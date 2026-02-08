using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.DTOs;
using TodoApi.Models;

namespace TodoApi.Services;

public class TodoStateService : ITodoStateService
{
    private readonly TodoDbContext _context;
    private readonly ILogger<TodoStateService> _logger;

    public TodoStateService(TodoDbContext context, ILogger<TodoStateService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<TodoStateDto>> GetTodoStatesAsync(int organizationId)
    {
        var states = await _context.TodoStates
            .Where(s => s.OrganizationId == organizationId && !s.IsDeleted)
            .OrderBy(s => s.Order)
            .ThenBy(s => s.Name)
            .ToListAsync();

        var stateDtos = new List<TodoStateDto>();
        foreach (var state in states)
        {
            var taskCount = await _context.Tasks
                .CountAsync(t => t.TodoStateId == state.Id && !t.IsDeleted);

            stateDtos.Add(MapToDto(state, taskCount));
        }

        return stateDtos;
    }

    public async Task<TodoStateDto?> GetTodoStateByIdAsync(int id, int organizationId)
    {
        var state = await _context.TodoStates
            .FirstOrDefaultAsync(s => s.Id == id && s.OrganizationId == organizationId && !s.IsDeleted);

        if (state == null)
        {
            return null;
        }

        var taskCount = await _context.Tasks
            .CountAsync(t => t.TodoStateId == state.Id && !t.IsDeleted);

        return MapToDto(state, taskCount);
    }

    public async Task<TodoStateDto> CreateTodoStateAsync(CreateTodoStateDto createDto, int organizationId, int userId)
    {
        // Validate name uniqueness within organization
        var existingState = await _context.TodoStates
            .FirstOrDefaultAsync(s => s.OrganizationId == organizationId 
                && s.Name.ToLower() == createDto.Name.ToLower() 
                && !s.IsDeleted);

        if (existingState != null)
        {
            throw new InvalidOperationException($"A todo state with the name '{createDto.Name}' already exists in this organization.");
        }

        // If this is set as default, unset other defaults
        if (createDto.IsDefault)
        {
            var currentDefaults = await _context.TodoStates
                .Where(s => s.OrganizationId == organizationId && s.IsDefault && !s.IsDeleted)
                .ToListAsync();

            foreach (var currentDefault in currentDefaults)
            {
                currentDefault.IsDefault = false;
                currentDefault.UpdatedAt = DateTime.UtcNow;
            }
        }

        var state = new TodoState
        {
            Name = createDto.Name.ToLowerInvariant(),
            DisplayName = createDto.DisplayName,
            Order = createDto.Order,
            IsDefault = createDto.IsDefault,
            Color = createDto.Color,
            Icon = createDto.Icon,
            OrganizationId = organizationId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.TodoStates.AddAsync(state);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created todo state {StateId} ({StateName}) for organization {OrgId} by user {UserId}",
            state.Id, state.Name, organizationId, userId);

        return MapToDto(state, 0);
    }

    public async Task<TodoStateDto?> UpdateTodoStateAsync(int id, UpdateTodoStateDto updateDto, int organizationId, int userId)
    {
        var state = await _context.TodoStates
            .FirstOrDefaultAsync(s => s.Id == id && s.OrganizationId == organizationId && !s.IsDeleted);

        if (state == null)
        {
            return null;
        }

        // Validate name uniqueness if name is being changed
        if (!string.IsNullOrEmpty(updateDto.Name) && updateDto.Name.ToLower() != state.Name.ToLower())
        {
            var existingState = await _context.TodoStates
                .FirstOrDefaultAsync(s => s.OrganizationId == organizationId
                    && s.Id != id
                    && s.Name.ToLower() == updateDto.Name.ToLower()
                    && !s.IsDeleted);

            if (existingState != null)
            {
                throw new InvalidOperationException($"A todo state with the name '{updateDto.Name}' already exists in this organization.");
            }

            state.Name = updateDto.Name.ToLowerInvariant();
        }

        // Update other properties if provided
        if (!string.IsNullOrEmpty(updateDto.DisplayName))
        {
            state.DisplayName = updateDto.DisplayName;
        }

        if (updateDto.Order.HasValue)
        {
            state.Order = updateDto.Order.Value;
        }

        if (updateDto.Color != null)
        {
            state.Color = updateDto.Color;
        }

        if (updateDto.Icon != null)
        {
            state.Icon = updateDto.Icon;
        }

        // Handle default state change
        if (updateDto.IsDefault.HasValue)
        {
            if (updateDto.IsDefault.Value && !state.IsDefault)
            {
                // Unset other defaults
                var currentDefaults = await _context.TodoStates
                    .Where(s => s.OrganizationId == organizationId && s.IsDefault && s.Id != id && !s.IsDeleted)
                    .ToListAsync();

                foreach (var currentDefault in currentDefaults)
                {
                    currentDefault.IsDefault = false;
                    currentDefault.UpdatedAt = DateTime.UtcNow;
                }
            }

            state.IsDefault = updateDto.IsDefault.Value;
        }

        state.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated todo state {StateId} ({StateName}) for organization {OrgId} by user {UserId}",
            state.Id, state.Name, organizationId, userId);

        var taskCount = await _context.Tasks
            .CountAsync(t => t.TodoStateId == state.Id && !t.IsDeleted);

        return MapToDto(state, taskCount);
    }

    public async Task<bool> DeleteTodoStateAsync(int id, int organizationId, int userId)
    {
        var state = await _context.TodoStates
            .FirstOrDefaultAsync(s => s.Id == id && s.OrganizationId == organizationId && !s.IsDeleted);

        if (state == null)
        {
            return false;
        }

        // Check if state is in use
        var taskCount = await _context.Tasks
            .CountAsync(t => t.TodoStateId == state.Id && !t.IsDeleted);

        if (taskCount > 0)
        {
            throw new InvalidOperationException($"Cannot delete todo state '{state.DisplayName}' because it is being used by {taskCount} task(s). Please reassign those tasks to another state first.");
        }

        // Soft delete
        state.IsDeleted = true;
        state.DeletedAt = DateTime.UtcNow;
        state.DeletedById = userId;
        state.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted todo state {StateId} ({StateName}) for organization {OrgId} by user {UserId}",
            state.Id, state.Name, organizationId, userId);

        return true;
    }

    private static TodoStateDto MapToDto(TodoState state, int taskCount)
    {
        return new TodoStateDto
        {
            Id = state.Id,
            Name = state.Name,
            DisplayName = state.DisplayName,
            Order = state.Order,
            IsDefault = state.IsDefault,
            Color = state.Color,
            Icon = state.Icon,
            OrganizationId = state.OrganizationId,
            TaskCount = taskCount
        };
    }
}

