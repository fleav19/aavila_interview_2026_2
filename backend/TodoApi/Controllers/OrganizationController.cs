using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.DTOs;
using TodoApi.Services;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = "Admin")]
public class OrganizationController : ControllerBase
{
    private readonly IOrganizationService _organizationService;
    private readonly IUserContextService _userContext;
    private readonly ILogger<OrganizationController> _logger;

    public OrganizationController(
        IOrganizationService organizationService,
        IUserContextService userContext,
        ILogger<OrganizationController> logger)
    {
        _organizationService = organizationService;
        _userContext = userContext;
        _logger = logger;
    }

    /// <summary>
    /// Get current organization information (Admin only)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(OrganizationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<OrganizationDto>> GetOrganization()
    {
        var organizationId = _userContext.GetCurrentOrganizationId();
        if (organizationId == null)
        {
            return Unauthorized(new { message = "User organization not found" });
        }

        try
        {
            var organization = await _organizationService.GetOrganizationAsync(organizationId.Value);
            return Ok(organization);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting organization");
            return StatusCode(500, new { message = "An error occurred while retrieving organization", error = ex.Message });
        }
    }

    /// <summary>
    /// Update organization information (Admin only)
    /// </summary>
    [HttpPut]
    [ProducesResponseType(typeof(OrganizationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<OrganizationDto>> UpdateOrganization([FromBody] UpdateOrganizationDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var organizationId = _userContext.GetCurrentOrganizationId();
        var userId = _userContext.GetCurrentUserId();

        if (organizationId == null || userId == null)
        {
            return Unauthorized(new { message = "User information not found" });
        }

        try
        {
            var organization = await _organizationService.UpdateOrganizationAsync(organizationId.Value, updateDto, userId.Value);
            return Ok(organization);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating organization");
            return StatusCode(500, new { message = "An error occurred while updating organization", error = ex.Message });
        }
    }
}

