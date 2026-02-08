using TodoApi.DTOs;

namespace TodoApi.Services;

public interface IUserManagementService
{
    Task<IEnumerable<UserManagementDto>> GetUsersAsync(int organizationId);
    Task<UserManagementDto?> GetUserByIdAsync(int id, int organizationId);
    Task<UserManagementDto> UpdateUserAsync(int id, UpdateUserDto updateDto, int organizationId, int updatedById);
}

