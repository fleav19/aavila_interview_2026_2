using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.DTOs;
using TodoApi.Models;

namespace TodoApi.Services;

public class TaskService : ITaskService
{
    private readonly TodoDbContext _context;
    private readonly ILogger<TaskService> _logger;

    public TaskService(TodoDbContext context, ILogger<TaskService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<TaskDto>> GetAllTasksAsync(string? filter, string? sortBy, bool? isCompleted)
    {
        var query = _context.Tasks.AsQueryable();

        // Filter by completion status
        if (isCompleted.HasValue)
        {
            query = query.Where(t => t.IsCompleted == isCompleted.Value);
        }

        // Search filter
        if (!string.IsNullOrWhiteSpace(filter))
        {
            query = query.Where(t => 
                t.Title.Contains(filter) || 
                (t.Description != null && t.Description.Contains(filter)));
        }

        // Sorting
        query = sortBy?.ToLower() switch
        {
            "title" => query.OrderBy(t => t.Title),
            "priority" => query.OrderByDescending(t => t.Priority).ThenBy(t => t.CreatedAt),
            "duedate" => query.OrderBy(t => t.DueDate ?? DateTime.MaxValue),
            "created" => query.OrderByDescending(t => t.CreatedAt),
            _ => query.OrderByDescending(t => t.CreatedAt) // Default: newest first
        };

        var tasks = await query.ToListAsync();
        return tasks.Select(MapToDto);
    }

    public async Task<TaskDto?> GetTaskByIdAsync(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        return task == null ? null : MapToDto(task);
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskDto createTaskDto)
    {
        var task = new Models.Task
        {
            Title = createTaskDto.Title,
            Description = createTaskDto.Description,
            DueDate = createTaskDto.DueDate,
            Priority = (TaskPriority)createTaskDto.Priority,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created task with ID {TaskId}", task.Id);
        return MapToDto(task);
    }

    public async Task<TaskDto?> UpdateTaskAsync(int id, UpdateTaskDto updateTaskDto)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return null;
        }

        task.Title = updateTaskDto.Title;
        task.Description = updateTaskDto.Description;
        task.DueDate = updateTaskDto.DueDate;
        task.Priority = (TaskPriority)updateTaskDto.Priority;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated task with ID {TaskId}", id);
        return MapToDto(task);
    }

    public async Task<bool> ToggleTaskStatusAsync(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return false;
        }

        task.IsCompleted = !task.IsCompleted;
        task.CompletedAt = task.IsCompleted ? DateTime.UtcNow : null;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Toggled task status for ID {TaskId} to {Status}", id, task.IsCompleted);
        return true;
    }

    public async Task<bool> DeleteTaskAsync(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return false;
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted task with ID {TaskId}", id);
        return true;
    }

    public async Task<TaskStatsDto> GetTaskStatsAsync()
    {
        var tasks = await _context.Tasks.ToListAsync();
        
        return new TaskStatsDto
        {
            Total = tasks.Count,
            Completed = tasks.Count(t => t.IsCompleted),
            Active = tasks.Count(t => !t.IsCompleted),
            HighPriority = tasks.Count(t => t.Priority == TaskPriority.High && !t.IsCompleted)
        };
    }

    private static TaskDto MapToDto(Models.Task task)
    {
        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            IsCompleted = task.IsCompleted,
            CreatedAt = task.CreatedAt,
            DueDate = task.DueDate,
            Priority = (TaskPriorityDto)task.Priority,
            CompletedAt = task.CompletedAt
        };
    }
}

