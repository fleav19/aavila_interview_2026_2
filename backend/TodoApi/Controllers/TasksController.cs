using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.DTOs;
using TodoApi.Services;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IUserContextService _userContext;
    private readonly ILogger<TasksController> _logger;

    public TasksController(
        ITaskService taskService,
        IUserContextService userContext,
        ILogger<TasksController> logger)
    {
        _taskService = taskService;
        _userContext = userContext;
        _logger = logger;
    }

    /// <summary>
    /// Get all tasks with optional filtering and sorting
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TaskDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasks(
        [FromQuery] string? filter = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool? isCompleted = null,
        [FromQuery] int? todoStateId = null)
    {
        var organizationId = _userContext.GetCurrentOrganizationId();
        var userId = _userContext.GetCurrentUserId();
        var userRole = _userContext.GetCurrentUserRole();

        var tasks = await _taskService.GetAllTasksAsync(filter, sortBy, isCompleted, todoStateId, organizationId, userId, userRole);
        return Ok(tasks);
    }

    /// <summary>
    /// Get task statistics
    /// </summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(TaskStatsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<TaskStatsDto>> GetTaskStats()
    {
        var organizationId = _userContext.GetCurrentOrganizationId();
        var stats = await _taskService.GetTaskStatsAsync(organizationId);
        return Ok(stats);
    }

    /// <summary>
    /// Get a specific task by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<TaskDto>> GetTask(int id)
    {
        var organizationId = _userContext.GetCurrentOrganizationId();
        var userId = _userContext.GetCurrentUserId();
        var userRole = _userContext.GetCurrentUserRole();

        var task = await _taskService.GetTaskByIdAsync(id, organizationId, userId, userRole);
        if (task == null)
        {
            return NotFound(new { message = $"Task with ID {id} not found" });
        }
        return Ok(task);
    }

    /// <summary>
    /// Create a new task
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [Authorize(Roles = "Admin,User")] // Viewers cannot create tasks
    public async Task<ActionResult<TaskDto>> CreateTask([FromBody] CreateTaskDto createTaskDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .SelectMany(x => x.Value!.Errors.Select(e => new { Field = x.Key, Message = e.ErrorMessage }))
                .ToList();
            _logger.LogWarning("Validation failed for CreateTask: {Errors}", System.Text.Json.JsonSerializer.Serialize(errors));
            return BadRequest(new { message = "Validation failed", errors });
        }

        var userId = _userContext.GetCurrentUserId();
        var organizationId = _userContext.GetCurrentOrganizationId();

        if (userId == null || organizationId == null)
        {
            return Unauthorized(new { message = "User information not found" });
        }

        var task = await _taskService.CreateTaskAsync(createTaskDto, userId.Value, organizationId.Value);
        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    /// <summary>
    /// Update an existing task
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Roles = "Admin,User")] // Viewers cannot update tasks
    public async Task<ActionResult<TaskDto>> UpdateTask(int id, [FromBody] UpdateTaskDto updateTaskDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var organizationId = _userContext.GetCurrentOrganizationId();
        var userId = _userContext.GetCurrentUserId();
        var userRole = _userContext.GetCurrentUserRole();

        try
        {
            var task = await _taskService.UpdateTaskAsync(id, updateTaskDto, organizationId, userId, userRole);
            if (task == null)
            {
                return NotFound(new { message = $"Task with ID {id} not found" });
            }
            return Ok(task);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Toggle task completion status
    /// </summary>
    [HttpPatch("{id}/status")]
    [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Roles = "Admin,User")] // Viewers cannot toggle task status
    public async Task<ActionResult<TaskDto>> ToggleTaskStatus(int id)
    {
        var organizationId = _userContext.GetCurrentOrganizationId();
        var userId = _userContext.GetCurrentUserId();
        var userRole = _userContext.GetCurrentUserRole();

        try
        {
            var success = await _taskService.ToggleTaskStatusAsync(id, organizationId, userId, userRole);
            if (!success)
            {
                return NotFound(new { message = $"Task with ID {id} not found" });
            }

            var task = await _taskService.GetTaskByIdAsync(id, organizationId, userId, userRole);
            return Ok(task);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a task
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Roles = "Admin,User")] // Viewers cannot delete tasks
    public async Task<IActionResult> DeleteTask(int id)
    {
        var organizationId = _userContext.GetCurrentOrganizationId();
        var userId = _userContext.GetCurrentUserId();
        var userRole = _userContext.GetCurrentUserRole();

        try
        {
            var success = await _taskService.DeleteTaskAsync(id, organizationId, userId, userRole);
            if (!success)
            {
                return NotFound(new { message = $"Task with ID {id} not found" });
            }
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }
}

