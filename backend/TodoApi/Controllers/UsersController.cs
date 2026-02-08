using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TodoApi.DTOs;
using TodoApi.Services;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;
    private readonly IUserContextService _userContext;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IAuthService authService,
        IConfiguration configuration,
        IUserContextService userContext,
        ILogger<UsersController> logger)
    {
        _authService = authService;
        _configuration = configuration;
        _userContext = userContext;
        _logger = logger;
    }

    /// <summary>
    /// Get current authenticated user information
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? User.FindFirst("UserId")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var user = await _authService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(user);
    }

    /// <summary>
    /// Get dev settings (only if dev testing is enabled)
    /// </summary>
    [HttpGet("dev-settings")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<object> GetDevSettings()
    {
        var isDevTesting = _configuration.GetValue<bool>("DevSettings:IsDevTesting", false);
        
        if (!isDevTesting)
        {
            return NotFound(new { message = "Dev settings not available" });
        }

        return Ok(new
        {
            isDevTesting = true,
            availableRoles = new[] { "Admin", "User", "Viewer" }
        });
    }

    /// <summary>
    /// Update current user's role (dev testing only)
    /// </summary>
    [HttpPost("me/role")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AuthResponseDto>> UpdateMyRole([FromBody] UpdateRoleDto updateRoleDto)
    {
        var isDevTesting = _configuration.GetValue<bool>("DevSettings:IsDevTesting", false);
        
        if (!isDevTesting)
        {
            return BadRequest(new { message = "This endpoint is only available in dev testing mode" });
        }

        var userId = _userContext.GetCurrentUserId();
        var organizationId = _userContext.GetCurrentOrganizationId();

        if (userId == null || organizationId == null)
        {
            return Unauthorized(new { message = "User information not found" });
        }

        try
        {
            var result = await _authService.UpdateUserRoleAsync(userId.Value, updateRoleDto.Role, organizationId.Value);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class UpdateRoleDto
{
    public string Role { get; set; } = string.Empty;
}

