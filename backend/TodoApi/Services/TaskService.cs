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

    public async Task<IEnumerable<TaskDto>> GetAllTasksAsync(string? filter, string? sortBy, bool? isCompleted, int? todoStateId, int? assignedToId, bool? unassignedOnly, int? organizationId, int? userId, string? userRole)
    {
        if (organizationId == null)
        {
            throw new UnauthorizedAccessException("User organization not found");
        }

        var query = _context.Tasks
            .Include(t => t.TodoState)
            .Include(t => t.AssignedTo)
            .Include(t => t.CreatedBy)
            .Where(t => !t.IsDeleted && t.OrganizationId == organizationId.Value)
            .AsQueryable();

        // Role-based filtering: Users see own tasks + org tasks, Viewers see all org tasks (read-only enforced at controller)
        if (userRole == "User" && userId.HasValue)
        {
            // Users can see their own tasks and all organization tasks
            // (No additional filtering needed - they can see all org tasks)
        }
        // Admins and Viewers see all organization tasks

        // Filter by assignee
        // assignedToId can be:
        // - null/undefined: no filter (show all) unless unassignedOnly is true
        // - >= 0: filter by specific user ID
        // unassignedOnly: if true, only show tasks with AssignedToId == null
        if (unassignedOnly == true)
        {
            query = query.Where(t => t.AssignedToId == null);
        }
        else if (assignedToId.HasValue && assignedToId.Value >= 0)
        {
            query = query.Where(t => t.AssignedToId == assignedToId.Value);
        }

        // Filter by todo state ID (takes precedence over isCompleted)
        if (todoStateId.HasValue)
        {
            query = query.Where(t => t.TodoStateId == todoStateId.Value);
        }
        // Filter by completion status (check if state name is "done") - only if todoStateId not provided
        else if (isCompleted.HasValue)
        {
            if (isCompleted.Value)
            {
                query = query.Where(t => t.TodoState.Name.ToLower() == "done");
            }
            else
            {
                query = query.Where(t => t.TodoState.Name.ToLower() != "done");
            }
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

    public async Task<TaskDto?> GetTaskByIdAsync(int id, int? organizationId, int? userId, string? userRole)
    {
        if (organizationId == null)
        {
            throw new UnauthorizedAccessException("User organization not found");
        }

        var task = await _context.Tasks
            .Include(t => t.TodoState)
            .Include(t => t.AssignedTo)
            .Include(t => t.CreatedBy)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted && t.OrganizationId == organizationId.Value);

        if (task == null)
        {
            return null;
        }

        // Check permissions: Users can read own tasks and org tasks, Admins/Viewers can read all org tasks
        // (Read permission is already checked by organization filter above)
        return MapToDto(task);
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskDto createTaskDto, int userId, int organizationId)
    {
        // Get state - use provided state or default state
        TodoState state;
        if (createTaskDto.TodoStateId.HasValue)
        {
            state = await _context.TodoStates
                .FirstOrDefaultAsync(s => s.Id == createTaskDto.TodoStateId.Value 
                    && s.OrganizationId == organizationId 
                    && !s.IsDeleted);
            
            if (state == null)
            {
                throw new InvalidOperationException($"Todo state with ID {createTaskDto.TodoStateId.Value} not found or not accessible");
            }
        }
        else
        {
            // Use default state
            state = await _context.TodoStates
                .FirstAsync(s => s.IsDefault && s.OrganizationId == organizationId && !s.IsDeleted);
        }

        // Validate assignee if provided
        if (createTaskDto.AssignedToId.HasValue)
        {
            var assignee = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == createTaskDto.AssignedToId.Value 
                    && u.OrganizationId == organizationId 
                    && !u.IsDeleted 
                    && u.IsActive);
            
            if (assignee == null)
            {
                throw new InvalidOperationException($"User with ID {createTaskDto.AssignedToId.Value} not found, not in this organization, or inactive");
            }
        }

        var task = new Models.Task
        {
            Title = createTaskDto.Title,
            Description = createTaskDto.Description,
            DueDate = createTaskDto.DueDate,
            Priority = (TaskPriority)createTaskDto.Priority,
            TodoStateId = state.Id,
            CreatedById = userId,
            AssignedToId = createTaskDto.AssignedToId,
            OrganizationId = organizationId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        await _context.Entry(task).Reference(t => t.TodoState).LoadAsync();
        await _context.Entry(task).Reference(t => t.AssignedTo).LoadAsync();
        await _context.Entry(task).Reference(t => t.CreatedBy).LoadAsync();

        _logger.LogInformation("Created task with ID {TaskId} by user {UserId} with state {StateName}", task.Id, userId, state.Name);
        return MapToDto(task);
    }

    public async Task<TaskDto?> UpdateTaskAsync(int id, UpdateTaskDto updateTaskDto, int? organizationId, int? userId, string? userRole)
    {
        if (organizationId == null || userId == null)
        {
            throw new UnauthorizedAccessException("User information not found");
        }

        var task = await _context.Tasks
            .Include(t => t.TodoState)
            .Include(t => t.AssignedTo)
            .Include(t => t.CreatedBy)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted && t.OrganizationId == organizationId.Value);

        if (task == null)
        {
            return null;
        }

        // Authorization: Users can only update own tasks, Admins can update any task
        if (userRole != "Admin" && task.CreatedById != userId.Value)
        {
            throw new UnauthorizedAccessException("You can only update your own tasks");
        }

        task.Title = updateTaskDto.Title;
        task.Description = updateTaskDto.Description;
        task.DueDate = updateTaskDto.DueDate;
        task.Priority = (TaskPriority)updateTaskDto.Priority;
        
        // Update assignee if provided
        if (updateTaskDto.AssignedToId.HasValue)
        {
            var assignee = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == updateTaskDto.AssignedToId.Value 
                    && u.OrganizationId == organizationId.Value 
                    && !u.IsDeleted 
                    && u.IsActive);
            
            if (assignee == null)
            {
                throw new InvalidOperationException($"User with ID {updateTaskDto.AssignedToId.Value} not found, not in this organization, or inactive");
            }
            
            task.AssignedToId = updateTaskDto.AssignedToId.Value;
        }
        else if (updateTaskDto.AssignedToId == null && task.AssignedToId.HasValue)
        {
            // Explicitly unassign if null is provided
            task.AssignedToId = null;
        }
        
        // Update state if provided
        if (updateTaskDto.TodoStateId.HasValue)
        {
            var newState = await _context.TodoStates
                .FirstOrDefaultAsync(s => s.Id == updateTaskDto.TodoStateId.Value 
                    && s.OrganizationId == organizationId.Value 
                    && !s.IsDeleted);
            
            if (newState == null)
            {
                throw new InvalidOperationException($"Todo state with ID {updateTaskDto.TodoStateId.Value} not found or not accessible");
            }

            task.TodoStateId = newState.Id;
            
            // Update CompletedAt based on state name
            if (newState.Name.ToLower() == "done")
            {
                task.CompletedAt = DateTime.UtcNow;
            }
            else if (task.CompletedAt.HasValue && newState.Name.ToLower() != "done")
            {
                task.CompletedAt = null;
            }
        }
        
        task.UpdatedAt = DateTime.UtcNow;
        task.UpdatedById = userId;

        await _context.SaveChangesAsync();
        
        // Reload navigation properties for DTO mapping
        await _context.Entry(task).Reference(t => t.TodoState).LoadAsync();
        await _context.Entry(task).Reference(t => t.AssignedTo).LoadAsync();
        await _context.Entry(task).Reference(t => t.CreatedBy).LoadAsync();

        _logger.LogInformation("Updated task with ID {TaskId} by user {UserId}", id, userId);
        return MapToDto(task);
    }

    public async Task<bool> ToggleTaskStatusAsync(int id, int? organizationId, int? userId, string? userRole)
    {
        if (organizationId == null || userId == null)
        {
            throw new UnauthorizedAccessException("User information not found");
        }

        var task = await _context.Tasks
            .Include(t => t.TodoState)
            .Include(t => t.AssignedTo)
            .Include(t => t.CreatedBy)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted && t.OrganizationId == organizationId.Value);

        if (task == null)
        {
            return false;
        }

        // Authorization: Users can only toggle own tasks, Admins can toggle any task
        if (userRole != "Admin" && task.CreatedById != userId.Value)
        {
            throw new UnauthorizedAccessException("You can only toggle your own tasks");
        }

        // Toggle between "done" and "active" states
        var doneState = await _context.TodoStates.FirstOrDefaultAsync(s => s.Name.ToLower() == "done" && s.OrganizationId == organizationId.Value && !s.IsDeleted);
        var activeState = await _context.TodoStates.FirstOrDefaultAsync(s => s.Name.ToLower() == "active" && s.OrganizationId == organizationId.Value && !s.IsDeleted);

        if (task.TodoState.Name.ToLower() == "done")
        {
            task.TodoStateId = activeState?.Id ?? task.TodoStateId;
            task.CompletedAt = null;
        }
        else
        {
            task.TodoStateId = doneState?.Id ?? task.TodoStateId;
            task.CompletedAt = DateTime.UtcNow;
        }
        task.UpdatedAt = DateTime.UtcNow;
        task.UpdatedById = userId;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Toggled task status for ID {TaskId} by user {UserId}", id, userId);
        return true;
    }

    public async Task<bool> DeleteTaskAsync(int id, int? organizationId, int? userId, string? userRole)
    {
        if (organizationId == null || userId == null)
        {
            throw new UnauthorizedAccessException("User information not found");
        }

        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted && t.OrganizationId == organizationId.Value);

        if (task == null)
        {
            return false;
        }

        // Authorization: Users can only delete own tasks, Admins can delete any task
        if (userRole != "Admin" && task.CreatedById != userId.Value)
        {
            throw new UnauthorizedAccessException("You can only delete your own tasks");
        }

        // Soft delete
        task.IsDeleted = true;
        task.DeletedAt = DateTime.UtcNow;
        task.DeletedById = userId;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted task with ID {TaskId} by user {UserId}", id, userId);
        return true;
    }

    public async Task<TaskStatsDto> GetTaskStatsAsync(int? organizationId)
    {
        if (organizationId == null)
        {
            throw new UnauthorizedAccessException("User organization not found");
        }

        var tasks = await _context.Tasks
            .Include(t => t.TodoState)
            .Where(t => !t.IsDeleted && t.OrganizationId == organizationId.Value)
            .ToListAsync();
        
        var doneStateName = "done";
        
        // Calculate state counts
        var stateCounts = tasks
            .GroupBy(t => t.TodoState)
            .ToDictionary(
                g => g.Key.DisplayName,
                g => g.Count()
            );
        
        return new TaskStatsDto
        {
            Total = tasks.Count,
            Completed = tasks.Count(t => t.TodoState.Name.ToLower() == doneStateName),
            Active = tasks.Count(t => t.TodoState.Name.ToLower() != doneStateName),
            HighPriority = tasks.Count(t => t.Priority == TaskPriority.High && t.TodoState.Name.ToLower() != doneStateName),
            StateCounts = stateCounts
        };
    }

    private static TaskDto MapToDto(Models.Task task)
    {
        // Map TodoState to IsCompleted for backward compatibility
        var isCompleted = task.TodoState?.Name.ToLower() == "done";
        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            IsCompleted = isCompleted,
            TodoStateId = task.TodoStateId,
            TodoStateName = task.TodoState?.Name ?? "unknown",
            TodoStateDisplayName = task.TodoState?.DisplayName ?? "Unknown",
            TodoStateColor = task.TodoState?.Color,
            CreatedAt = task.CreatedAt,
            DueDate = task.DueDate,
            Priority = (TaskPriorityDto)task.Priority,
            CompletedAt = task.CompletedAt,
            AssignedToId = task.AssignedToId,
            AssignedToName = task.AssignedTo != null ? $"{task.AssignedTo.FirstName} {task.AssignedTo.LastName}" : null,
            AssignedToEmail = task.AssignedTo?.Email,
            CreatedById = task.CreatedById,
            CreatedByName = task.CreatedBy != null ? $"{task.CreatedBy.FirstName} {task.CreatedBy.LastName}" : "Unknown"
        };
    }
}

