using TodoApi.DTOs;

namespace TodoApi.Services;

public interface IOrganizationService
{
    Task<OrganizationDto> GetOrganizationAsync(int organizationId);
    Task<OrganizationDto> UpdateOrganizationAsync(int organizationId, UpdateOrganizationDto updateDto, int updatedById);
}

