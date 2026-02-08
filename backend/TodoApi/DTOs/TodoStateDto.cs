using System.ComponentModel.DataAnnotations;

namespace TodoApi.DTOs;

public class TodoStateDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsDefault { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public int OrganizationId { get; set; }
    public int TaskCount { get; set; } // Number of tasks using this state
}

public class CreateTodoStateDto
{
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string DisplayName { get; set; } = string.Empty;

    [Required]
    [Range(0, int.MaxValue)]
    public int Order { get; set; }

    public bool IsDefault { get; set; }

    [StringLength(7)] // Hex color code length
    public string? Color { get; set; }

    [StringLength(50)]
    public string? Icon { get; set; }
}

public class UpdateTodoStateDto
{
    [StringLength(50, MinimumLength = 1)]
    public string? Name { get; set; }

    [StringLength(100, MinimumLength = 1)]
    public string? DisplayName { get; set; }

    [Range(0, int.MaxValue)]
    public int? Order { get; set; }

    public bool? IsDefault { get; set; }

    [StringLength(7)] // Hex color code length
    public string? Color { get; set; }

    [StringLength(50)]
    public string? Icon { get; set; }
}

