using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.DTOs;
using TodoApi.Models;

namespace TodoApi.Services;

public class UserManagementService : IUserManagementService
{
    private readonly TodoDbContext _context;
    private readonly ILogger<UserManagementService> _logger;

    public UserManagementService(TodoDbContext context, ILogger<UserManagementService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<UserManagementDto>> GetUsersAsync(int organizationId)
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .Where(u => u.OrganizationId == organizationId && !u.IsDeleted)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync();

        var userDtos = new List<UserManagementDto>();
        foreach (var user in users)
        {
            var taskCount = await _context.Tasks
                .CountAsync(t => t.CreatedById == user.Id && !t.IsDeleted);

            userDtos.Add(MapToDto(user, taskCount));
        }

        return userDtos;
    }

    public async Task<UserManagementDto?> GetUserByIdAsync(int id, int organizationId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id && u.OrganizationId == organizationId && !u.IsDeleted);

        if (user == null)
        {
            return null;
        }

        var taskCount = await _context.Tasks
            .CountAsync(t => t.CreatedById == user.Id && !t.IsDeleted);

        return MapToDto(user, taskCount);
    }

    public async Task<UserManagementDto> UpdateUserAsync(int id, UpdateUserDto updateDto, int organizationId, int updatedById)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id && u.OrganizationId == organizationId && !u.IsDeleted);

        if (user == null)
        {
            throw new InvalidOperationException($"User with ID {id} not found in organization");
        }

        // Update first name
        if (!string.IsNullOrEmpty(updateDto.FirstName))
        {
            user.FirstName = updateDto.FirstName;
        }

        // Update last name
        if (!string.IsNullOrEmpty(updateDto.LastName))
        {
            user.LastName = updateDto.LastName;
        }

        // Update role
        if (!string.IsNullOrEmpty(updateDto.Role))
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == updateDto.Role);
            if (role == null)
            {
                throw new InvalidOperationException($"Role '{updateDto.Role}' not found");
            }

            user.RoleId = role.Id;
        }

        // Update active status
        if (updateDto.IsActive.HasValue)
        {
            user.IsActive = updateDto.IsActive.Value;
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Reload with updated role
        await _context.Entry(user).Reference(u => u.Role).LoadAsync();

        _logger.LogInformation("Updated user {UserId} by admin {AdminId} in organization {OrgId}",
            user.Id, updatedById, organizationId);

        var taskCount = await _context.Tasks
            .CountAsync(t => t.CreatedById == user.Id && !t.IsDeleted);

        return MapToDto(user, taskCount);
    }

    private static UserManagementDto MapToDto(User user, int taskCount)
    {
        return new UserManagementDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role?.Name ?? "User",
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt,
            TaskCount = taskCount
        };
    }
}

