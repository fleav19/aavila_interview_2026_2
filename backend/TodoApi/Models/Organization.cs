namespace TodoApi.Models;

public class Organization
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public int? DeletedById { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User? DeletedBy { get; set; }
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<TodoState> TodoStates { get; set; } = new List<TodoState>();
    public ICollection<Task> Tasks { get; set; } = new List<Task>();
}

