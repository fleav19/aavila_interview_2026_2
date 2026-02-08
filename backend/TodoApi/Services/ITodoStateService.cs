using TodoApi.DTOs;

namespace TodoApi.Services;

public interface ITodoStateService
{
    Task<IEnumerable<TodoStateDto>> GetTodoStatesAsync(int organizationId);
    Task<TodoStateDto?> GetTodoStateByIdAsync(int id, int organizationId);
    Task<TodoStateDto> CreateTodoStateAsync(CreateTodoStateDto createDto, int organizationId, int userId);
    Task<TodoStateDto?> UpdateTodoStateAsync(int id, UpdateTodoStateDto updateDto, int organizationId, int userId);
    Task<bool> DeleteTodoStateAsync(int id, int organizationId, int userId);
    Task<bool> ReorderTodoStatesAsync(List<int> stateIds, int organizationId, int userId);
}

