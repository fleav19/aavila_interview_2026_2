namespace TodoApi.DTOs;

public class UserPreferencesDto
{
    public List<string> VisibleStats { get; set; } = new List<string>();
    public Dictionary<string, object> OtherPreferences { get; set; } = new Dictionary<string, object>();
}

public class UpdateUserPreferencesDto
{
    public List<string>? VisibleStats { get; set; }
    public Dictionary<string, object>? OtherPreferences { get; set; }
}

