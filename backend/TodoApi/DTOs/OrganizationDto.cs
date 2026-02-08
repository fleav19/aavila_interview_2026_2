namespace TodoApi.DTOs;

public class OrganizationDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Statistics
    public int UserCount { get; set; }
    public int TaskCount { get; set; }
    public int ActiveTaskCount { get; set; }
    public int TodoStateCount { get; set; }
}

public class UpdateOrganizationDto
{
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
    
    [System.ComponentModel.DataAnnotations.StringLength(100)]
    [System.ComponentModel.DataAnnotations.RegularExpression(@"^[a-z0-9-]+$", ErrorMessage = "Slug must contain only lowercase letters, numbers, and hyphens")]
    public string? Slug { get; set; }
    
    public bool? IsActive { get; set; }
}

