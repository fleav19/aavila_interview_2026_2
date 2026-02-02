using TodoApi.DTOs;

namespace TodoApi.Services;

public interface ITaskService
{
    Task<IEnumerable<TaskDto>> GetAllTasksAsync(string? filter, string? sortBy, bool? isCompleted);
    Task<TaskDto?> GetTaskByIdAsync(int id);
    Task<TaskDto> CreateTaskAsync(CreateTaskDto createTaskDto);
    Task<TaskDto?> UpdateTaskAsync(int id, UpdateTaskDto updateTaskDto);
    Task<bool> ToggleTaskStatusAsync(int id);
    Task<bool> DeleteTaskAsync(int id);
    Task<TaskStatsDto> GetTaskStatsAsync();
}

public class TaskStatsDto
{
    public int Total { get; set; }
    public int Completed { get; set; }
    public int Active { get; set; }
    public int HighPriority { get; set; }
}

