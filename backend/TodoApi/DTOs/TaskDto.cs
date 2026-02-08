namespace TodoApi.DTOs;

public class TaskDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsCompleted { get; set; } // Kept for backward compatibility
    public int TodoStateId { get; set; }
    public string TodoStateName { get; set; } = string.Empty;
    public string TodoStateDisplayName { get; set; } = string.Empty;
    public string? TodoStateColor { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public TaskPriorityDto Priority { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    // Assignee information
    public int? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }
    public string? AssignedToEmail { get; set; }
    
    // Creator information
    public int CreatedById { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    
    // Update information
    public DateTime UpdatedAt { get; set; }
    public int? UpdatedById { get; set; }
    public string? UpdatedByName { get; set; }
}

