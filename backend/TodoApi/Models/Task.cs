namespace TodoApi.Models;

public class Task
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int TodoStateId { get; set; }
    public int CreatedById { get; set; }
    public int? AssignedToId { get; set; }
    public int? ProjectId { get; set; }
    public int? ParentTaskId { get; set; }
    public int OrganizationId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int? UpdatedById { get; set; }
    public DateTime? DueDate { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public DateTime? CompletedAt { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public int? DeletedById { get; set; }

    // Navigation properties
    public TodoState TodoState { get; set; } = null!;
    public User CreatedBy { get; set; } = null!;
    public User? AssignedTo { get; set; }
    public User? UpdatedBy { get; set; }
    public User? DeletedBy { get; set; }
    public Organization Organization { get; set; } = null!;
    public Project? Project { get; set; }
    public Models.Task? ParentTask { get; set; }
    public ICollection<Models.Task> Subtasks { get; set; } = new List<Models.Task>();
}

public enum TaskPriority
{
    Low = 0,
    Medium = 1,
    High = 2
}

