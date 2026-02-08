using TodoApi.DTOs;

namespace TodoApi.Services;

public interface IUserPreferencesService
{
    Task<UserPreferencesDto> GetUserPreferencesAsync(int userId);
    Task<UserPreferencesDto> UpdateUserPreferencesAsync(int userId, UpdateUserPreferencesDto preferences);
}

