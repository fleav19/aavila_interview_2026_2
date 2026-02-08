namespace TodoApi.DTOs;

public class UserPreferencesDto
{
    public List<string> VisibleStats { get; set; } = new List<string>();
    public string Theme { get; set; } = "light"; // "light" or "dark"
    public string Language { get; set; } = "en"; // Language code (e.g., "en", "es", "fr")
    public Dictionary<string, object> OtherPreferences { get; set; } = new Dictionary<string, object>();
}

public class UpdateUserPreferencesDto
{
    public List<string>? VisibleStats { get; set; }
    public string? Theme { get; set; }
    public string? Language { get; set; }
    public Dictionary<string, object>? OtherPreferences { get; set; }
}

