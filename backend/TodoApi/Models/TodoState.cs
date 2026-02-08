namespace TodoApi.Models;

public class TodoState
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsDefault { get; set; } = false;
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public int OrganizationId { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public int? DeletedById { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Organization Organization { get; set; } = null!;
    public User? DeletedBy { get; set; }
    public ICollection<Task> Tasks { get; set; } = new List<Task>();
}

