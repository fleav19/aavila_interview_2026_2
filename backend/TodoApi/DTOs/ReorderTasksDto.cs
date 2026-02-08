using System.ComponentModel.DataAnnotations;

namespace TodoApi.DTOs;

public class ReorderTasksDto
{
    [Required]
    [MinLength(1, ErrorMessage = "At least one task ID is required")]
    public List<int> TaskIds { get; set; } = new List<int>();
}

