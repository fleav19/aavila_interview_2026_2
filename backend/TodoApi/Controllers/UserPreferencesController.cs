using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.DTOs;
using TodoApi.Services;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class UserPreferencesController : ControllerBase
{
    private readonly IUserPreferencesService _preferencesService;
    private readonly IUserContextService _userContext;
    private readonly ILogger<UserPreferencesController> _logger;

    public UserPreferencesController(
        IUserPreferencesService preferencesService,
        IUserContextService userContext,
        ILogger<UserPreferencesController> logger)
    {
        _preferencesService = preferencesService;
        _userContext = userContext;
        _logger = logger;
    }

    /// <summary>
    /// Get current user's preferences
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(UserPreferencesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserPreferencesDto>> GetPreferences()
    {
        var userId = _userContext.GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User information not found" });
        }

        try
        {
            var preferences = await _preferencesService.GetUserPreferencesAsync(userId.Value);
            return Ok(preferences);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user preferences");
            return StatusCode(500, new { message = "An error occurred while retrieving preferences" });
        }
    }

    /// <summary>
    /// Update current user's preferences
    /// </summary>
    [HttpPut]
    [ProducesResponseType(typeof(UserPreferencesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserPreferencesDto>> UpdatePreferences([FromBody] UpdateUserPreferencesDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .SelectMany(x => x.Value!.Errors.Select(e => new { Field = x.Key, Message = e.ErrorMessage }))
                .ToList();
            return BadRequest(new { message = "Validation failed", errors });
        }

        var userId = _userContext.GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User information not found" });
        }

        try
        {
            var preferences = await _preferencesService.UpdateUserPreferencesAsync(userId.Value, updateDto);
            return Ok(preferences);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user preferences");
            return StatusCode(500, new { message = "An error occurred while updating preferences" });
        }
    }
}

