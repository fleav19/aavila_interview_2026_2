using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.DTOs;
using TodoApi.Models;

namespace TodoApi.Services;

public class UserPreferencesService : IUserPreferencesService
{
    private readonly TodoDbContext _context;
    private readonly ILogger<UserPreferencesService> _logger;

    public UserPreferencesService(TodoDbContext context, ILogger<UserPreferencesService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<UserPreferencesDto> GetUserPreferencesAsync(int userId)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);

        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        if (string.IsNullOrEmpty(user.Preferences))
        {
            // Return default preferences
            return new UserPreferencesDto
            {
                VisibleStats = new List<string> { "Total", "High Priority" }, // Default visible stats
                OtherPreferences = new Dictionary<string, object>()
            };
        }

        try
        {
            var preferences = JsonSerializer.Deserialize<UserPreferencesDto>(user.Preferences);
            return preferences ?? new UserPreferencesDto
            {
                VisibleStats = new List<string> { "Total", "High Priority" },
                OtherPreferences = new Dictionary<string, object>()
            };
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to deserialize user preferences for user {UserId}, returning defaults", userId);
            return new UserPreferencesDto
            {
                VisibleStats = new List<string> { "Total", "High Priority" },
                OtherPreferences = new Dictionary<string, object>()
            };
        }
    }

    public async Task<UserPreferencesDto> UpdateUserPreferencesAsync(int userId, UpdateUserPreferencesDto updateDto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);

        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Get current preferences or create new
        UserPreferencesDto currentPreferences;
        if (string.IsNullOrEmpty(user.Preferences))
        {
            currentPreferences = new UserPreferencesDto
            {
                VisibleStats = new List<string> { "Total", "High Priority" },
                OtherPreferences = new Dictionary<string, object>()
            };
        }
        else
        {
            try
            {
                currentPreferences = JsonSerializer.Deserialize<UserPreferencesDto>(user.Preferences)
                    ?? new UserPreferencesDto
                    {
                        VisibleStats = new List<string> { "Total", "High Priority" },
                        OtherPreferences = new Dictionary<string, object>()
                    };
            }
            catch (JsonException)
            {
                currentPreferences = new UserPreferencesDto
                {
                    VisibleStats = new List<string> { "Total", "High Priority" },
                    OtherPreferences = new Dictionary<string, object>()
                };
            }
        }

        // Update preferences
        if (updateDto.VisibleStats != null)
        {
            currentPreferences.VisibleStats = updateDto.VisibleStats;
        }

        if (updateDto.OtherPreferences != null)
        {
            foreach (var kvp in updateDto.OtherPreferences)
            {
                currentPreferences.OtherPreferences[kvp.Key] = kvp.Value;
            }
        }

        // Save to database
        var preferencesJson = JsonSerializer.Serialize(currentPreferences);
        _logger.LogInformation("Updating preferences for user {UserId}. Before: {Before}, After: {After}", 
            userId, user.Preferences, preferencesJson);
        
        user.Preferences = preferencesJson;
        user.UpdatedAt = DateTime.UtcNow;
        
        var saveResult = await _context.SaveChangesAsync();
        _logger.LogInformation("Updated preferences for user {UserId}. SaveChanges returned {SaveResult}", userId, saveResult);
        
        // Verify it was saved
        await _context.Entry(user).ReloadAsync();
        _logger.LogInformation("Verified saved preferences for user {UserId}: {SavedPreferences}", userId, user.Preferences);

        return currentPreferences;
    }
}

