using TodoApi.DTOs;

namespace TodoApi.Services;

public interface IProjectService
{
    Task<IEnumerable<ProjectDto>> GetProjectsAsync(int organizationId);
    Task<ProjectDto?> GetProjectByIdAsync(int id, int organizationId);
    Task<ProjectDto> CreateProjectAsync(CreateProjectDto createDto, int organizationId, int userId);
    Task<ProjectDto?> UpdateProjectAsync(int id, UpdateProjectDto updateDto, int organizationId, int userId);
    Task<bool> DeleteProjectAsync(int id, int organizationId, int userId);
}

