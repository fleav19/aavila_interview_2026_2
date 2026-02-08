using TodoApi.DTOs;

namespace TodoApi.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<UserDto?> GetUserByIdAsync(int userId);
    Task<AuthResponseDto> UpdateUserRoleAsync(int userId, string newRole, int organizationId);
    Task<IEnumerable<UserForAssignmentDto>> GetUsersForAssignmentAsync(int organizationId);
}

