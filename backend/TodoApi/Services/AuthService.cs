using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TodoApi.Data;
using TodoApi.DTOs;
using TodoApi.Models;

namespace TodoApi.Services;

public class AuthService : IAuthService
{
    private readonly TodoDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        TodoDbContext context,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        // Check if user already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == registerDto.Email && !u.IsDeleted);

        if (existingUser != null)
        {
            throw new InvalidOperationException("User with this email already exists");
        }

        // Get or create organization
        var organization = registerDto.OrganizationId.HasValue
            ? await _context.Organizations.FindAsync(registerDto.OrganizationId.Value)
            : await _context.Organizations.FirstOrDefaultAsync(o => o.Slug == "default");

        if (organization == null)
        {
            // Create default organization if it doesn't exist
            organization = new Organization
            {
                Name = "Default Organization",
                Slug = "default",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _context.Organizations.AddAsync(organization);
            await _context.SaveChangesAsync();
        }

        // Check if this is the first user for the organization
        var existingUserCount = await _context.Users
            .CountAsync(u => u.OrganizationId == organization.Id && !u.IsDeleted);

        // Get role: Admin for first user, User for subsequent users
        Role role;
        if (existingUserCount == 0)
        {
            // First user in organization gets Admin role
            role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
            if (role == null)
            {
                throw new InvalidOperationException("Admin role not found. Please seed the database.");
            }
            _logger.LogInformation("First user for organization {OrgId} ({OrgName}) - assigning Admin role", organization.Id, organization.Name);
        }
        else
        {
            // Subsequent users get User role
            role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "User");
            if (role == null)
            {
                throw new InvalidOperationException("Default User role not found. Please seed the database.");
            }
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

        // Create user
        var user = new User
        {
            Email = registerDto.Email.ToLowerInvariant(),
            PasswordHash = passwordHash,
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            OrganizationId = organization.Id,
            RoleId = role.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Reload user with navigation properties for token generation
        await _context.Entry(user).Reference(u => u.Organization).LoadAsync();
        await _context.Entry(user).Reference(u => u.Role).LoadAsync();

        _logger.LogInformation("User registered: {Email}, ID: {UserId}", user.Email, user.Id);

        // Generate token (needs Role.Name, so we use the loaded user)
        var token = GenerateJwtToken(user);

        return new AuthResponseDto
        {
            Token = token,
            User = MapToUserDto(user, user.Organization, user.Role)
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        // Find user by email
        var user = await _context.Users
            .Include(u => u.Organization)
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == loginDto.Email.ToLowerInvariant() && !u.IsDeleted);

        if (user == null || !user.IsActive)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Verify password
        var isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("User logged in: {Email}, ID: {UserId}", user.Email, user.Id);

        // Generate token
        var token = GenerateJwtToken(user);

        return new AuthResponseDto
        {
            Token = token,
            User = MapToUserDto(user, user.Organization, user.Role)
        };
    }

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Organization)
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted && u.IsActive);

        if (user == null)
        {
            return null;
        }

        return MapToUserDto(user, user.Organization, user.Role);
    }

    public async Task<AuthResponseDto> UpdateUserRoleAsync(int userId, string newRole, int organizationId)
    {
        var user = await _context.Users
            .Include(u => u.Organization)
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId && u.OrganizationId == organizationId && !u.IsDeleted);

        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == newRole);
        if (role == null)
        {
            throw new InvalidOperationException($"Role '{newRole}' not found");
        }

        user.RoleId = role.Id;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Reload user with new role
        await _context.Entry(user).Reference(u => u.Role).LoadAsync();

        _logger.LogInformation("Updated user {UserId} role to {Role} (dev testing mode)", userId, newRole);

        // Generate new token with updated role
        var token = GenerateJwtToken(user);

        return new AuthResponseDto
        {
            Token = token,
            User = MapToUserDto(user, user.Organization, user.Role)
        };
    }

    public async Task<IEnumerable<UserForAssignmentDto>> GetUsersForAssignmentAsync(int organizationId)
    {
        var users = await _context.Users
            .Where(u => u.OrganizationId == organizationId && !u.IsDeleted && u.IsActive)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .Select(u => new UserForAssignmentDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email
            })
            .ToListAsync();

        return users;
    }

    private string GenerateJwtToken(User user)
    {
        // Ensure Role is loaded
        if (user.Role == null)
        {
            _context.Entry(user).Reference(u => u.Role).Load();
        }

        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!";
        var issuer = jwtSettings["Issuer"] ?? "TodoApi";
        var audience = jwtSettings["Audience"] ?? "TodoApiUsers";
        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "30");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new Claim(ClaimTypes.Role, user.Role?.Name ?? "User"),
            new Claim("OrganizationId", user.OrganizationId.ToString()),
            new Claim("UserId", user.Id.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapToUserDto(User user, Organization organization, Role role)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = role.Name,
            OrganizationId = organization.Id,
            OrganizationName = organization.Name
        };
    }
}

