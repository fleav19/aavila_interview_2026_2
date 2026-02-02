using System.ComponentModel.DataAnnotations;

namespace TodoApi.DTOs;

public class UpdateTaskDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    public TaskPriorityDto Priority { get; set; } = TaskPriorityDto.Medium;
}

