using TodoApi.DTOs;

namespace TodoApi.Services;

public interface ITaskService
{
    Task<IEnumerable<TaskDto>> GetAllTasksAsync(string? filter, string? sortBy, bool? isCompleted, int? todoStateId, int? organizationId, int? userId, string? userRole);
    Task<TaskDto?> GetTaskByIdAsync(int id, int? organizationId, int? userId, string? userRole);
    Task<TaskDto> CreateTaskAsync(CreateTaskDto createTaskDto, int userId, int organizationId);
    Task<TaskDto?> UpdateTaskAsync(int id, UpdateTaskDto updateTaskDto, int? organizationId, int? userId, string? userRole);
    Task<bool> ToggleTaskStatusAsync(int id, int? organizationId, int? userId, string? userRole);
    Task<bool> DeleteTaskAsync(int id, int? organizationId, int? userId, string? userRole);
    Task<TaskStatsDto> GetTaskStatsAsync(int? organizationId);
}

public class TaskStatsDto
{
    public int Total { get; set; }
    public int Completed { get; set; }
    public int Active { get; set; }
    public int HighPriority { get; set; }
    public Dictionary<string, int> StateCounts { get; set; } = new Dictionary<string, int>();
}

