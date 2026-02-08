namespace TodoApi.Models;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OrganizationId { get; set; }
    public int CreatedById { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int? UpdatedById { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public int? DeletedById { get; set; }

    // Navigation properties
    public Organization Organization { get; set; } = null!;
    public User CreatedBy { get; set; } = null!;
    public User? UpdatedBy { get; set; }
    public User? DeletedBy { get; set; }
    public ICollection<Models.Task> Tasks { get; set; } = new List<Models.Task>();
}

