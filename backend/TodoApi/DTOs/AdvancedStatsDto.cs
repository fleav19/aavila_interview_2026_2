namespace TodoApi.DTOs;

public class AdvancedStatsDto
{
    public Dictionary<string, UserTaskStatsDto> ByUser { get; set; } = new Dictionary<string, UserTaskStatsDto>();
    public List<TrendDataPointDto> Trends { get; set; } = new List<TrendDataPointDto>();
    public Dictionary<string, int> ByState { get; set; } = new Dictionary<string, int>();
}

public class UserTaskStatsDto
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int ActiveTasks { get; set; }
    public int HighPriorityTasks { get; set; }
    public Dictionary<string, int> StateCounts { get; set; } = new Dictionary<string, int>();
}

public class TrendDataPointDto
{
    public DateTime Date { get; set; }
    public int TasksCreated { get; set; }
    public int TasksCompleted { get; set; }
    public int TotalTasks { get; set; }
    public Dictionary<string, int> StateCounts { get; set; } = new Dictionary<string, int>();
}

