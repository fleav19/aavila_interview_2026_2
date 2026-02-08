using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.DTOs;
using TodoApi.Services;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class TodoStatesController : ControllerBase
{
    private readonly ITodoStateService _todoStateService;
    private readonly IUserContextService _userContext;
    private readonly ILogger<TodoStatesController> _logger;

    public TodoStatesController(
        ITodoStateService todoStateService,
        IUserContextService userContext,
        ILogger<TodoStatesController> logger)
    {
        _todoStateService = todoStateService;
        _userContext = userContext;
        _logger = logger;
    }

    /// <summary>
    /// Get all todo states for the current user's organization
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TodoStateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<TodoStateDto>>> GetTodoStates()
    {
        var organizationId = _userContext.GetCurrentOrganizationId();
        if (organizationId == null)
        {
            return Unauthorized(new { message = "User organization not found" });
        }

        var states = await _todoStateService.GetTodoStatesAsync(organizationId.Value);
        return Ok(states);
    }

    /// <summary>
    /// Get a specific todo state by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TodoStateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<TodoStateDto>> GetTodoState(int id)
    {
        var organizationId = _userContext.GetCurrentOrganizationId();
        if (organizationId == null)
        {
            return Unauthorized(new { message = "User organization not found" });
        }

        var state = await _todoStateService.GetTodoStateByIdAsync(id, organizationId.Value);
        if (state == null)
        {
            return NotFound(new { message = $"Todo state with ID {id} not found" });
        }

        return Ok(state);
    }

    /// <summary>
    /// Create a new todo state (Admin only)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TodoStateDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TodoStateDto>> CreateTodoState([FromBody] CreateTodoStateDto createDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .SelectMany(x => x.Value!.Errors.Select(e => new { Field = x.Key, Message = e.ErrorMessage }))
                .ToList();
            return BadRequest(new { message = "Validation failed", errors });
        }

        var organizationId = _userContext.GetCurrentOrganizationId();
        var userId = _userContext.GetCurrentUserId();

        if (organizationId == null || userId == null)
        {
            return Unauthorized(new { message = "User information not found" });
        }

        try
        {
            var state = await _todoStateService.CreateTodoStateAsync(createDto, organizationId.Value, userId.Value);
            return CreatedAtAction(nameof(GetTodoState), new { id = state.Id }, state);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating todo state");
            return StatusCode(500, new { message = "An error occurred while creating the todo state" });
        }
    }

    /// <summary>
    /// Update an existing todo state (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TodoStateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TodoStateDto>> UpdateTodoState(int id, [FromBody] UpdateTodoStateDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .SelectMany(x => x.Value!.Errors.Select(e => new { Field = x.Key, Message = e.ErrorMessage }))
                .ToList();
            return BadRequest(new { message = "Validation failed", errors });
        }

        var organizationId = _userContext.GetCurrentOrganizationId();
        var userId = _userContext.GetCurrentUserId();

        if (organizationId == null || userId == null)
        {
            return Unauthorized(new { message = "User information not found" });
        }

        try
        {
            var state = await _todoStateService.UpdateTodoStateAsync(id, updateDto, organizationId.Value, userId.Value);
            if (state == null)
            {
                return NotFound(new { message = $"Todo state with ID {id} not found" });
            }

            return Ok(state);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating todo state {StateId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the todo state" });
        }
    }

    /// <summary>
    /// Delete a todo state (Admin only, soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteTodoState(int id)
    {
        var organizationId = _userContext.GetCurrentOrganizationId();
        var userId = _userContext.GetCurrentUserId();

        if (organizationId == null || userId == null)
        {
            return Unauthorized(new { message = "User information not found" });
        }

        try
        {
            var success = await _todoStateService.DeleteTodoStateAsync(id, organizationId.Value, userId.Value);
            if (!success)
            {
                return NotFound(new { message = $"Todo state with ID {id} not found" });
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting todo state {StateId}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the todo state" });
        }
    }
}

