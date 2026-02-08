using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.DTOs;
using TodoApi.Models;

namespace TodoApi.Services;

public class ProjectService : IProjectService
{
    private readonly TodoDbContext _context;
    private readonly ILogger<ProjectService> _logger;

    public ProjectService(TodoDbContext context, ILogger<ProjectService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<ProjectDto>> GetProjectsAsync(int organizationId)
    {
        var projects = await _context.Projects
            .Include(p => p.CreatedBy)
            .Include(p => p.UpdatedBy)
            .Include(p => p.Organization)
            .Where(p => p.OrganizationId == organizationId && !p.IsDeleted)
            .OrderBy(p => p.Name)
            .ToListAsync();

        var projectDtos = new List<ProjectDto>();
        foreach (var project in projects)
        {
            var taskCount = await _context.Tasks
                .CountAsync(t => t.ProjectId == project.Id && !t.IsDeleted);

            var activeTaskCount = await _context.Tasks
                .Include(t => t.TodoState)
                .CountAsync(t => t.ProjectId == project.Id && !t.IsDeleted && t.TodoState.Name.ToLower() != "done");

            projectDtos.Add(MapToDto(project, taskCount, activeTaskCount));
        }

        return projectDtos;
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(int id, int organizationId)
    {
        var project = await _context.Projects
            .Include(p => p.CreatedBy)
            .Include(p => p.UpdatedBy)
            .Include(p => p.Organization)
            .FirstOrDefaultAsync(p => p.Id == id && p.OrganizationId == organizationId && !p.IsDeleted);

        if (project == null)
        {
            return null;
        }

        var taskCount = await _context.Tasks
            .CountAsync(t => t.ProjectId == project.Id && !t.IsDeleted);

        var activeTaskCount = await _context.Tasks
            .CountAsync(t => t.ProjectId == project.Id && !t.IsDeleted && t.TodoState.Name != "done");

        return MapToDto(project, taskCount, activeTaskCount);
    }

    public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto createDto, int organizationId, int userId)
    {
        // Validate name uniqueness within organization
        var existingProject = await _context.Projects
            .FirstOrDefaultAsync(p => p.OrganizationId == organizationId 
                && p.Name.ToLower() == createDto.Name.ToLower() 
                && !p.IsDeleted);

        if (existingProject != null)
        {
            throw new InvalidOperationException($"A project with the name '{createDto.Name}' already exists in this organization.");
        }

        var project = new Project
        {
            Name = createDto.Name.Trim(),
            Description = createDto.Description?.Trim(),
            OrganizationId = organizationId,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        // Load navigation properties
        await _context.Entry(project)
            .Reference(p => p.CreatedBy)
            .LoadAsync();
        await _context.Entry(project)
            .Reference(p => p.Organization)
            .LoadAsync();

        _logger.LogInformation("Project {ProjectId} created by user {UserId} in organization {OrganizationId}", 
            project.Id, userId, organizationId);

        return MapToDto(project, 0, 0);
    }

    public async Task<ProjectDto?> UpdateProjectAsync(int id, UpdateProjectDto updateDto, int organizationId, int userId)
    {
        var project = await _context.Projects
            .Include(p => p.CreatedBy)
            .Include(p => p.UpdatedBy)
            .Include(p => p.Organization)
            .FirstOrDefaultAsync(p => p.Id == id && p.OrganizationId == organizationId && !p.IsDeleted);

        if (project == null)
        {
            return null;
        }

        // Validate name uniqueness if name is being changed
        if (updateDto.Name != null && updateDto.Name.Trim() != project.Name)
        {
            var existingProject = await _context.Projects
                .FirstOrDefaultAsync(p => p.OrganizationId == organizationId 
                    && p.Id != id
                    && p.Name.ToLower() == updateDto.Name.ToLower() 
                    && !p.IsDeleted);

            if (existingProject != null)
            {
                throw new InvalidOperationException($"A project with the name '{updateDto.Name}' already exists in this organization.");
            }

            project.Name = updateDto.Name.Trim();
        }

        if (updateDto.Description != null)
        {
            project.Description = updateDto.Description.Trim();
        }

        project.UpdatedAt = DateTime.UtcNow;
        project.UpdatedById = userId;

        await _context.SaveChangesAsync();

        // Reload UpdatedBy navigation property
        await _context.Entry(project)
            .Reference(p => p.UpdatedBy)
            .LoadAsync();

        var taskCount = await _context.Tasks
            .CountAsync(t => t.ProjectId == project.Id && !t.IsDeleted);

        var activeTaskCount = await _context.Tasks
            .CountAsync(t => t.ProjectId == project.Id && !t.IsDeleted && t.TodoState.Name != "done");

        _logger.LogInformation("Project {ProjectId} updated by user {UserId}", project.Id, userId);

        return MapToDto(project, taskCount, activeTaskCount);
    }

    public async Task<bool> DeleteProjectAsync(int id, int organizationId, int userId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == id && p.OrganizationId == organizationId && !p.IsDeleted);

        if (project == null)
        {
            return false;
        }

        // Check if project has tasks
        var hasTasks = await _context.Tasks
            .AnyAsync(t => t.ProjectId == project.Id && !t.IsDeleted);

        if (hasTasks)
        {
            throw new InvalidOperationException("Cannot delete project that has tasks. Please reassign or delete tasks first.");
        }

        // Soft delete
        project.IsDeleted = true;
        project.DeletedAt = DateTime.UtcNow;
        project.DeletedById = userId;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Project {ProjectId} deleted by user {UserId}", project.Id, userId);

        return true;
    }

    private static ProjectDto MapToDto(Project project, int taskCount, int activeTaskCount)
    {
        return new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            OrganizationId = project.OrganizationId,
            OrganizationName = project.Organization?.Name ?? string.Empty,
            CreatedById = project.CreatedById,
            CreatedByName = $"{project.CreatedBy?.FirstName} {project.CreatedBy?.LastName}".Trim(),
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            UpdatedById = project.UpdatedById,
            UpdatedByName = project.UpdatedBy != null 
                ? $"{project.UpdatedBy.FirstName} {project.UpdatedBy.LastName}".Trim() 
                : null,
            TaskCount = taskCount,
            ActiveTaskCount = activeTaskCount
        };
    }
}

