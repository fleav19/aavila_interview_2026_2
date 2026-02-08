using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApi.DTOs;
using TodoApi.Services;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly IUserContextService _userContext;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(
        IProjectService projectService,
        IUserContextService userContext,
        ILogger<ProjectsController> logger)
    {
        _projectService = projectService;
        _userContext = userContext;
        _logger = logger;
    }

    /// <summary>
    /// Get all projects for the current user's organization
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProjectDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<ProjectDto>>> GetProjects()
    {
        var organizationId = _userContext.GetCurrentOrganizationId();
        if (organizationId == null)
        {
            return Unauthorized(new { message = "User organization not found" });
        }

        var projects = await _projectService.GetProjectsAsync(organizationId.Value);
        return Ok(projects);
    }

    /// <summary>
    /// Get a specific project by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ProjectDto>> GetProject(int id)
    {
        var organizationId = _userContext.GetCurrentOrganizationId();
        if (organizationId == null)
        {
            return Unauthorized(new { message = "User organization not found" });
        }

        var project = await _projectService.GetProjectByIdAsync(id, organizationId.Value);
        if (project == null)
        {
            return NotFound(new { message = "Project not found" });
        }

        return Ok(project);
    }

    /// <summary>
    /// Create a new project (Admin and User only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,User")]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ProjectDto>> CreateProject([FromBody] CreateProjectDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var organizationId = _userContext.GetCurrentOrganizationId();
        var userId = _userContext.GetCurrentUserId();

        if (organizationId == null || userId == null)
        {
            return Unauthorized(new { message = "User context not found" });
        }

        try
        {
            var project = await _projectService.CreateProjectAsync(createDto, organizationId.Value, userId.Value);
            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing project (Admin and User only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,User")]
    [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ProjectDto>> UpdateProject(int id, [FromBody] UpdateProjectDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var organizationId = _userContext.GetCurrentOrganizationId();
        var userId = _userContext.GetCurrentUserId();

        if (organizationId == null || userId == null)
        {
            return Unauthorized(new { message = "User context not found" });
        }

        try
        {
            var project = await _projectService.UpdateProjectAsync(id, updateDto, organizationId.Value, userId.Value);
            if (project == null)
            {
                return NotFound(new { message = "Project not found" });
            }

            return Ok(project);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a project (Admin and User only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,User")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var organizationId = _userContext.GetCurrentOrganizationId();
        var userId = _userContext.GetCurrentUserId();

        if (organizationId == null || userId == null)
        {
            return Unauthorized(new { message = "User context not found" });
        }

        try
        {
            var deleted = await _projectService.DeleteProjectAsync(id, organizationId.Value, userId.Value);
            if (!deleted)
            {
                return NotFound(new { message = "Project not found" });
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

