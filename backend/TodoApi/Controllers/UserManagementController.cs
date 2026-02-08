using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.DTOs;
using TodoApi.Services;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = "Admin")]
public class UserManagementController : ControllerBase
{
    private readonly IUserManagementService _userManagementService;
    private readonly IUserContextService _userContext;
    private readonly ILogger<UserManagementController> _logger;

    public UserManagementController(
        IUserManagementService userManagementService,
        IUserContextService userContext,
        ILogger<UserManagementController> logger)
    {
        _userManagementService = userManagementService;
        _userContext = userContext;
        _logger = logger;
    }

    /// <summary>
    /// Get all users in the organization (Admin only)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserManagementDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<UserManagementDto>>> GetUsers()
    {
        try
        {
            var organizationId = _userContext.GetCurrentOrganizationId();
            if (organizationId == null)
            {
                _logger.LogWarning("GetUsers called but organizationId is null");
                return Unauthorized(new { message = "User organization not found" });
            }

            var users = await _userManagementService.GetUsersAsync(organizationId.Value);
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users");
            return StatusCode(500, new { message = "An error occurred while retrieving users", error = ex.Message });
        }
    }

    /// <summary>
    /// Get a specific user by ID (Admin only)
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(UserManagementDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<UserManagementDto>> GetUser(int id)
    {
        var organizationId = _userContext.GetCurrentOrganizationId();
        if (organizationId == null)
        {
            return Unauthorized(new { message = "User organization not found" });
        }

        var user = await _userManagementService.GetUserByIdAsync(id, organizationId.Value);
        if (user == null)
        {
            return NotFound(new { message = $"User with ID {id} not found" });
        }

        return Ok(user);
    }

    /// <summary>
    /// Update a user (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(UserManagementDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<UserManagementDto>> UpdateUser(int id, [FromBody] UpdateUserDto updateDto)
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
            var user = await _userManagementService.UpdateUserAsync(id, updateDto, organizationId.Value, userId.Value);
            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the user" });
        }
    }
}

