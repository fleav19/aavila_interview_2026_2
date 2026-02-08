using System.Security.Claims;

namespace TodoApi.Services;

public class UserContextService : IUserContextService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserContextService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int? GetCurrentUserId()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? _httpContextAccessor.HttpContext?.User?.FindFirst("UserId")?.Value;

        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    public int? GetCurrentOrganizationId()
    {
        var orgIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("OrganizationId")?.Value;
        return int.TryParse(orgIdClaim, out var orgId) ? orgId : null;
    }

    public string? GetCurrentUserRole()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;
    }

    public bool IsAdmin()
    {
        return GetCurrentUserRole() == "Admin";
    }

    public bool IsUser()
    {
        return GetCurrentUserRole() == "User";
    }

    public bool IsViewer()
    {
        return GetCurrentUserRole() == "Viewer";
    }
}

