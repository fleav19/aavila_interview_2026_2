using System.Security.Claims;

namespace TodoApi.Services;

public interface IUserContextService
{
    int? GetCurrentUserId();
    int? GetCurrentOrganizationId();
    string? GetCurrentUserRole();
    bool IsAdmin();
    bool IsUser();
    bool IsViewer();
}

