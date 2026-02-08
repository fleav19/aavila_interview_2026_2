using System.ComponentModel.DataAnnotations;

namespace TodoApi.DTOs;

public class ReorderTodoStatesDto
{
    [Required]
    [MinLength(1, ErrorMessage = "At least one state ID is required")]
    public List<int> StateIds { get; set; } = new List<int>();
}

