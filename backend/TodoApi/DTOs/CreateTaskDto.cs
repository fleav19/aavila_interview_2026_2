using System.ComponentModel.DataAnnotations;

namespace TodoApi.DTOs;

public class CreateTaskDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    public TaskPriorityDto Priority { get; set; } = TaskPriorityDto.Medium;

    public int? TodoStateId { get; set; } // Optional - will use default state if not provided
}

public enum TaskPriorityDto
{
    Low = 0,
    Medium = 1,
    High = 2
}

