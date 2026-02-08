using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.DTOs;
using TodoApi.Models;

namespace TodoApi.Services;

public class OrganizationService : IOrganizationService
{
    private readonly TodoDbContext _context;
    private readonly ILogger<OrganizationService> _logger;

    public OrganizationService(TodoDbContext context, ILogger<OrganizationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<OrganizationDto> GetOrganizationAsync(int organizationId)
    {
        var organization = await _context.Organizations
            .FirstOrDefaultAsync(o => o.Id == organizationId && !o.IsDeleted);

        if (organization == null)
        {
            throw new InvalidOperationException("Organization not found");
        }

        // Get statistics
        var userCount = await _context.Users
            .CountAsync(u => u.OrganizationId == organizationId && !u.IsDeleted);

        var taskCount = await _context.Tasks
            .CountAsync(t => t.OrganizationId == organizationId && !t.IsDeleted);

        var activeTaskCount = await _context.Tasks
            .Include(t => t.TodoState)
            .CountAsync(t => t.OrganizationId == organizationId 
                && !t.IsDeleted 
                && t.TodoState != null 
                && t.TodoState.Name.ToLower() != "done");

        var todoStateCount = await _context.TodoStates
            .CountAsync(s => s.OrganizationId == organizationId && !s.IsDeleted);

        return new OrganizationDto
        {
            Id = organization.Id,
            Name = organization.Name,
            Slug = organization.Slug,
            IsActive = organization.IsActive,
            CreatedAt = organization.CreatedAt,
            UpdatedAt = organization.UpdatedAt,
            UserCount = userCount,
            TaskCount = taskCount,
            ActiveTaskCount = activeTaskCount,
            TodoStateCount = todoStateCount
        };
    }

    public async Task<OrganizationDto> UpdateOrganizationAsync(int organizationId, UpdateOrganizationDto updateDto, int updatedById)
    {
        var organization = await _context.Organizations
            .FirstOrDefaultAsync(o => o.Id == organizationId && !o.IsDeleted);

        if (organization == null)
        {
            throw new InvalidOperationException("Organization not found");
        }

        // Update name
        organization.Name = updateDto.Name;

        // Update slug if provided
        if (!string.IsNullOrWhiteSpace(updateDto.Slug))
        {
            // Check if slug is unique (excluding current organization)
            var existingOrg = await _context.Organizations
                .FirstOrDefaultAsync(o => o.Slug == updateDto.Slug && o.Id != organizationId && !o.IsDeleted);

            if (existingOrg != null)
            {
                throw new InvalidOperationException($"Slug '{updateDto.Slug}' is already in use");
            }

            organization.Slug = updateDto.Slug;
        }

        // Update IsActive if provided
        if (updateDto.IsActive.HasValue)
        {
            organization.IsActive = updateDto.IsActive.Value;
        }

        organization.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated organization {OrganizationId} by user {UserId}", organizationId, updatedById);

        // Return updated organization with stats
        return await GetOrganizationAsync(organizationId);
    }
}

