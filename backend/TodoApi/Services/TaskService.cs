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

    public async Task<IEnumerable<TaskDto>> GetAllTasksAsync(string? filter, string? sortBy, bool? isCompleted, int? todoStateId, int? assignedToId, bool? unassignedOnly, int? projectId, int? organizationId, int? userId, string? userRole)
    {
        if (organizationId == null)
        {
            throw new UnauthorizedAccessException("User organization not found");
        }

        var query = _context.Tasks
            .Include(t => t.TodoState)
            .Include(t => t.AssignedTo)
            .Include(t => t.CreatedBy)
            .Include(t => t.UpdatedBy)
            .Include(t => t.Project)
            .Include(t => t.ParentTask)
            .Where(t => !t.IsDeleted && t.OrganizationId == organizationId.Value && t.ParentTaskId == null) // Only top-level tasks (not subtasks)
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

        // Filter by project
        if (projectId.HasValue)
        {
            query = query.Where(t => t.ProjectId == projectId.Value);
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

        // Sorting - Order field takes precedence if set, then apply sortBy
        query = sortBy?.ToLower() switch
        {
            "title" => query.OrderBy(t => t.Order ?? int.MaxValue).ThenBy(t => t.Title),
            "priority" => query.OrderBy(t => t.Order ?? int.MaxValue).ThenByDescending(t => t.Priority).ThenBy(t => t.CreatedAt),
            "duedate" => query.OrderBy(t => t.Order ?? int.MaxValue).ThenBy(t => t.DueDate ?? DateTime.MaxValue),
            "created" => query.OrderBy(t => t.Order ?? int.MaxValue).ThenByDescending(t => t.CreatedAt),
            _ => query.OrderBy(t => t.Order ?? int.MaxValue).ThenByDescending(t => t.CreatedAt) // Default: custom order first, then newest first
        };

        var tasks = await query.ToListAsync();
        return tasks.Select(t => MapToDto(t));
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
            .Include(t => t.UpdatedBy)
            .Include(t => t.Project)
            .Include(t => t.ParentTask)
            .Include(t => t.Subtasks)
                .ThenInclude(s => s.TodoState)
            .Include(t => t.Subtasks)
                .ThenInclude(s => s.AssignedTo)
            .FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted && t.OrganizationId == organizationId.Value);

        if (task == null)
        {
            return null;
        }

        // Check permissions: Users can read own tasks and org tasks, Admins/Viewers can read all org tasks
        // (Read permission is already checked by organization filter above)
        return MapToDto(task, includeSubtasks: true);
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskDto createTaskDto, int userId, int organizationId)
    {
        // Get state - use provided state or default state
        TodoState? state;
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

        // Validate project if provided
        if (createTaskDto.ProjectId.HasValue)
        {
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == createTaskDto.ProjectId.Value 
                    && p.OrganizationId == organizationId 
                    && !p.IsDeleted);
            
            if (project == null)
            {
                throw new InvalidOperationException($"Project with ID {createTaskDto.ProjectId.Value} not found or not accessible");
            }
        }

        // Validate parent task if provided (for subtasks)
        if (createTaskDto.ParentTaskId.HasValue)
        {
            var parentTask = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == createTaskDto.ParentTaskId.Value 
                    && t.OrganizationId == organizationId 
                    && !t.IsDeleted);
            
            if (parentTask == null)
            {
                throw new InvalidOperationException($"Parent task with ID {createTaskDto.ParentTaskId.Value} not found or not accessible");
            }

            // If creating a subtask, inherit project from parent if not specified
            if (!createTaskDto.ProjectId.HasValue && parentTask.ProjectId.HasValue)
            {
                createTaskDto.ProjectId = parentTask.ProjectId;
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
            ProjectId = createTaskDto.ProjectId,
            ParentTaskId = createTaskDto.ParentTaskId,
            OrganizationId = organizationId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        await _context.Entry(task).Reference(t => t.TodoState).LoadAsync();
        await _context.Entry(task).Reference(t => t.AssignedTo).LoadAsync();
        await _context.Entry(task).Reference(t => t.CreatedBy).LoadAsync();
        await _context.Entry(task).Reference(t => t.UpdatedBy).LoadAsync();
        await _context.Entry(task).Reference(t => t.Project).LoadAsync();
        await _context.Entry(task).Reference(t => t.ParentTask).LoadAsync();

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
            .Include(t => t.UpdatedBy)
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

        // Update project if provided
        if (updateTaskDto.ProjectId.HasValue)
        {
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == updateTaskDto.ProjectId.Value 
                    && p.OrganizationId == organizationId.Value 
                    && !p.IsDeleted);
            
            if (project == null)
            {
                throw new InvalidOperationException($"Project with ID {updateTaskDto.ProjectId.Value} not found or not accessible");
            }
            
            task.ProjectId = updateTaskDto.ProjectId.Value;
        }
        else if (updateTaskDto.ProjectId == null && task.ProjectId.HasValue)
        {
            // Explicitly remove from project if null is provided
            task.ProjectId = null;
        }

        // Update parent task if provided (for subtasks)
        if (updateTaskDto.ParentTaskId.HasValue)
        {
            var parentTask = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == updateTaskDto.ParentTaskId.Value 
                    && t.OrganizationId == organizationId.Value 
                    && !t.IsDeleted);
            
            if (parentTask == null)
            {
                throw new InvalidOperationException($"Parent task with ID {updateTaskDto.ParentTaskId.Value} not found or not accessible");
            }

            // Prevent circular references
            if (parentTask.Id == task.Id)
            {
                throw new InvalidOperationException("A task cannot be its own parent");
            }

            // If making this a subtask, inherit project from parent if not specified
            if (!updateTaskDto.ProjectId.HasValue && parentTask.ProjectId.HasValue)
            {
                task.ProjectId = parentTask.ProjectId;
            }
            
            task.ParentTaskId = updateTaskDto.ParentTaskId.Value;
        }
        else if (updateTaskDto.ParentTaskId == null && task.ParentTaskId.HasValue)
        {
            // Explicitly remove parent if null is provided (make it a top-level task)
            task.ParentTaskId = null;
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
        await _context.Entry(task).Reference(t => t.UpdatedBy).LoadAsync();

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
            .Include(t => t.UpdatedBy)
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

    public async Task<AdvancedStatsDto> GetAdvancedStatsAsync(int? organizationId, int? days = 30)
    {
        if (organizationId == null)
        {
            throw new UnauthorizedAccessException("User organization not found");
        }

        var daysToLookBack = days ?? 30;
        var startDate = DateTime.UtcNow.AddDays(-daysToLookBack).Date;

        var tasks = await _context.Tasks
            .Include(t => t.TodoState)
            .Include(t => t.AssignedTo)
            .Include(t => t.CreatedBy)
            .Where(t => !t.IsDeleted && t.OrganizationId == organizationId.Value)
            .ToListAsync();

        var doneStateName = "done";

        // Statistics by User
        var byUser = tasks
            .Where(t => t.AssignedTo != null)
            .GroupBy(t => t.AssignedTo!)
            .ToDictionary(
                g => $"{g.Key.FirstName} {g.Key.LastName}",
                g => new UserTaskStatsDto
                {
                    UserId = g.Key.Id,
                    UserName = $"{g.Key.FirstName} {g.Key.LastName}",
                    UserEmail = g.Key.Email,
                    TotalTasks = g.Count(),
                    CompletedTasks = g.Count(t => t.TodoState.Name.ToLower() == doneStateName),
                    ActiveTasks = g.Count(t => t.TodoState.Name.ToLower() != doneStateName),
                    HighPriorityTasks = g.Count(t => t.Priority == TaskPriority.High && t.TodoState.Name.ToLower() != doneStateName),
                    StateCounts = g.GroupBy(t => t.TodoState.DisplayName)
                        .ToDictionary(sg => sg.Key, sg => sg.Count())
                }
            );

        // Add unassigned tasks stats
        var unassignedTasks = tasks.Where(t => t.AssignedTo == null).ToList();
        if (unassignedTasks.Any())
        {
            byUser["Unassigned"] = new UserTaskStatsDto
            {
                UserId = 0,
                UserName = "Unassigned",
                UserEmail = "",
                TotalTasks = unassignedTasks.Count,
                CompletedTasks = unassignedTasks.Count(t => t.TodoState.Name.ToLower() == doneStateName),
                ActiveTasks = unassignedTasks.Count(t => t.TodoState.Name.ToLower() != doneStateName),
                HighPriorityTasks = unassignedTasks.Count(t => t.Priority == TaskPriority.High && t.TodoState.Name.ToLower() != doneStateName),
                StateCounts = unassignedTasks.GroupBy(t => t.TodoState.DisplayName)
                    .ToDictionary(sg => sg.Key, sg => sg.Count())
            };
        }

        // Statistics by State
        var byState = tasks
            .GroupBy(t => t.TodoState.DisplayName)
            .ToDictionary(
                g => g.Key,
                g => g.Count()
            );

        // Trends (daily snapshots for the last N days)
        var trends = new List<TrendDataPointDto>();
        var currentDate = startDate;
        var today = DateTime.UtcNow.Date;

        while (currentDate <= today)
        {
            var nextDate = currentDate.AddDays(1);
            
            // Tasks created on or before this date
            var tasksUpToDate = tasks.Where(t => t.CreatedAt.Date <= currentDate).ToList();
            
            // Tasks completed on or before this date
            var completedUpToDate = tasksUpToDate
                .Where(t => t.CompletedAt.HasValue && t.CompletedAt.Value.Date <= currentDate)
                .ToList();

            // Tasks created on this specific date
            var tasksCreatedOnDate = tasks.Count(t => t.CreatedAt.Date == currentDate);
            
            // Tasks completed on this specific date
            var tasksCompletedOnDate = tasks.Count(t => 
                t.CompletedAt.HasValue && t.CompletedAt.Value.Date == currentDate);

            // State counts for tasks up to this date
            var stateCountsForDate = tasksUpToDate
                .GroupBy(t => t.TodoState.DisplayName)
                .ToDictionary(g => g.Key, g => g.Count());

            trends.Add(new TrendDataPointDto
            {
                Date = currentDate,
                TasksCreated = tasksCreatedOnDate,
                TasksCompleted = tasksCompletedOnDate,
                TotalTasks = tasksUpToDate.Count,
                StateCounts = stateCountsForDate
            });

            currentDate = nextDate;
        }

        return new AdvancedStatsDto
        {
            ByUser = byUser,
            Trends = trends,
            ByState = byState
        };
    }

    public async Task<bool> ReorderTasksAsync(List<int> taskIds, int? organizationId, int? userId, string? userRole)
    {
        if (organizationId == null || userId == null)
        {
            throw new UnauthorizedAccessException("User information not found");
        }

        if (taskIds == null || taskIds.Count == 0)
        {
            throw new InvalidOperationException("Task IDs list cannot be empty");
        }

        // Get all tasks for the organization
        var tasks = await _context.Tasks
            .Where(t => !t.IsDeleted && t.OrganizationId == organizationId.Value && t.ParentTaskId == null)
            .ToListAsync();

        // Validate that all provided IDs belong to this organization
        var providedTaskIds = taskIds.ToHashSet();
        var organizationTaskIds = tasks.Select(t => t.Id).ToHashSet();

        if (!providedTaskIds.IsSubsetOf(organizationTaskIds))
        {
            throw new InvalidOperationException("All task IDs must belong to the organization");
        }

        // Check permissions: Users can only reorder their own tasks, Admins can reorder any tasks
        if (userRole != "Admin")
        {
            var userTasks = tasks.Where(t => t.CreatedById == userId.Value).Select(t => t.Id).ToHashSet();
            if (!providedTaskIds.IsSubsetOf(userTasks))
            {
                throw new UnauthorizedAccessException("You can only reorder your own tasks");
            }
        }

        // Update order based on the provided order
        for (int i = 0; i < taskIds.Count; i++)
        {
            var task = tasks.FirstOrDefault(t => t.Id == taskIds[i]);
            if (task != null)
            {
                task.Order = i;
                task.UpdatedAt = DateTime.UtcNow;
                task.UpdatedById = userId;
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Reordered tasks for organization {OrgId} by user {UserId}",
            organizationId, userId);

        return true;
    }

    private static TaskDto MapToDto(Models.Task task, bool includeSubtasks = false)
    {
        // Map TodoState to IsCompleted for backward compatibility
        var isCompleted = task.TodoState?.Name.ToLower() == "done";
        var dto = new TaskDto
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
            UpdatedAt = task.UpdatedAt,
            DueDate = task.DueDate,
            Priority = (TaskPriorityDto)task.Priority,
            CompletedAt = task.CompletedAt,
            AssignedToId = task.AssignedToId,
            AssignedToName = task.AssignedTo != null ? $"{task.AssignedTo.FirstName} {task.AssignedTo.LastName}" : null,
            AssignedToEmail = task.AssignedTo?.Email,
            CreatedById = task.CreatedById,
            CreatedByName = task.CreatedBy != null ? $"{task.CreatedBy.FirstName} {task.CreatedBy.LastName}" : "Unknown",
            UpdatedById = task.UpdatedById,
            UpdatedByName = task.UpdatedBy != null ? $"{task.UpdatedBy.FirstName} {task.UpdatedBy.LastName}" : null,
            ProjectId = task.ProjectId,
            ProjectName = task.Project?.Name,
            ParentTaskId = task.ParentTaskId,
            ParentTaskTitle = task.ParentTask?.Title
        };

        // Include subtasks if requested
        if (includeSubtasks && task.Subtasks != null)
        {
            dto.Subtasks = task.Subtasks
                .Where(s => !s.IsDeleted)
                .Select(s => MapToDto(s, includeSubtasks: false))
                .ToList();
        }

        return dto;
    }
}

