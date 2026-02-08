using Microsoft.EntityFrameworkCore;
using TodoApi.Models;
using Task = System.Threading.Tasks.Task;
using System.Text;
using System.Linq;

namespace TodoApi.Data;

public static class DataSeeder
{
    private static void LogDebug(string location, string message, object? data = null, string? hypothesisId = null)
    {
        try
        {
            var logPath = "/Users/aavila/code/interviews/.cursor/debug.log";
            var logEntry = new
            {
                location = location,
                message = message,
                data = data ?? new { },
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                runId = "initial",
                hypothesisId = hypothesisId
            };
            File.AppendAllText(logPath, System.Text.Json.JsonSerializer.Serialize(logEntry) + "\n");
        }
        catch { }
    }

    public static async Task SeedAsync(TodoDbContext context)
    {
        // #region agent log
        LogDebug("DataSeeder.cs:29", "SeedAsync entry", new { }, "A,B,C,D,E");
        // #endregion

        // #region agent log
        var dbExistsBefore = await context.Database.CanConnectAsync();
        LogDebug("DataSeeder.cs:32", "Before EnsureCreatedAsync", new { dbExists = dbExistsBefore }, "A,B");
        // #endregion

        // Check if database exists and has the correct schema
        var requiredTables = new[] { "Organizations", "Roles", "Users", "TodoStates", "Tasks" };
        bool needsRecreation = false;

        if (dbExistsBefore)
        {
            // #region agent log
            try
            {
                var connection = context.Database.GetDbConnection();
                await connection.OpenAsync();
                var tablesCommand = connection.CreateCommand();
                tablesCommand.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
                var existingTables = new List<string>();
                using (var reader = await tablesCommand.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        existingTables.Add(reader.GetString(0));
                    }
                }
                LogDebug("DataSeeder.cs:54", "Existing tables before EnsureCreatedAsync", new { tables = existingTables.ToArray() }, "A,B,C");

                // Check if all required tables exist
                var missingTables = requiredTables.Except(existingTables, StringComparer.OrdinalIgnoreCase).ToArray();
                if (missingTables.Length > 0)
                {
                    needsRecreation = true;
                    LogDebug("DataSeeder.cs:60", "Missing required tables detected", new { missingTables = missingTables }, "A,B,C");
                }
                else
                {
                    // Check if Users table has the Preferences column (schema version check)
                    if (existingTables.Contains("Users", StringComparer.OrdinalIgnoreCase))
                    {
                        var columnsCommand = connection.CreateCommand();
                        columnsCommand.CommandText = "PRAGMA table_info(Users)";
                        var columns = new List<string>();
                        using (var reader = await columnsCommand.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                columns.Add(reader.GetString(1)); // Column name is at index 1
                            }
                        }
                        if (!columns.Contains("Preferences", StringComparer.OrdinalIgnoreCase))
                        {
                            needsRecreation = true;
                            LogDebug("DataSeeder.cs:75", "Users table missing Preferences column, needs recreation", new { existingColumns = columns.ToArray() }, "A,B,C");
                        }
                    }
                    
                    // Check if Tasks table has required columns (ParentTaskId, ProjectId)
                    if (existingTables.Contains("Tasks", StringComparer.OrdinalIgnoreCase))
                    {
                        var tasksColumnsCommand = connection.CreateCommand();
                        tasksColumnsCommand.CommandText = "PRAGMA table_info(Tasks)";
                        var tasksColumns = new List<string>();
                        using (var reader = await tasksColumnsCommand.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                tasksColumns.Add(reader.GetString(1)); // Column name is at index 1
                            }
                        }
                        var missingTasksColumns = new List<string>();
                        if (!tasksColumns.Contains("ParentTaskId", StringComparer.OrdinalIgnoreCase))
                        {
                            missingTasksColumns.Add("ParentTaskId");
                        }
                        if (!tasksColumns.Contains("ProjectId", StringComparer.OrdinalIgnoreCase))
                        {
                            missingTasksColumns.Add("ProjectId");
                        }
                        if (!tasksColumns.Contains("Order", StringComparer.OrdinalIgnoreCase))
                        {
                            missingTasksColumns.Add("Order");
                        }
                        if (missingTasksColumns.Count > 0)
                        {
                            needsRecreation = true;
                            LogDebug("DataSeeder.cs:100", "Tasks table missing columns, needs recreation", new { missingColumns = missingTasksColumns.ToArray(), existingColumns = tasksColumns.ToArray() }, "A,B,C");
                        }
                    }
                }
                await connection.CloseAsync();
            }
            catch (Exception ex)
            {
                LogDebug("DataSeeder.cs:65", "Error checking existing tables", new { error = ex.Message }, "A,B,C");
                // If we can't check, assume we need to recreate
                needsRecreation = true;
            }
            // #endregion
        }

        // If database exists but is missing required tables, delete and recreate it
        if (needsRecreation)
        {
            // #region agent log
            LogDebug("DataSeeder.cs:75", "Deleting database to recreate with correct schema", new { }, "A,B,C");
            // #endregion
            await context.Database.EnsureDeletedAsync();
        }

        // Ensure database is created
        var ensureCreatedResult = await context.Database.EnsureCreatedAsync();

        // #region agent log
        LogDebug("DataSeeder.cs:82", "After EnsureCreatedAsync", new { result = ensureCreatedResult, wasRecreated = needsRecreation }, "A,B");
        // #endregion

        // #region agent log
        try
        {
            var connection = context.Database.GetDbConnection();
            await connection.OpenAsync();
            var tablesCommand = connection.CreateCommand();
            tablesCommand.CommandText = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
            var tables = new List<string>();
            using (var reader = await tablesCommand.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    tables.Add(reader.GetString(0));
                }
            }
            await connection.CloseAsync();
            LogDebug("DataSeeder.cs:99", "Tables after EnsureCreatedAsync", new { tables = tables.ToArray() }, "A,B,C");
        }
        catch (Exception ex)
        {
            LogDebug("DataSeeder.cs:104", "Error checking tables", new { error = ex.Message }, "A,B,C");
        }
        // #endregion

        // Seed Roles if they don't exist
        // #region agent log
        LogDebug("DataSeeder.cs:38", "Before Roles.AnyAsync query", new { }, "A,D,E");
        // #endregion

        try
        {
            if (!await context.Roles.AnyAsync())
            {
                // #region agent log
                LogDebug("DataSeeder.cs:45", "Roles table is empty, seeding", new { }, "A");
                // #endregion

                var roles = new[]
                {
                    new Role { Name = "Admin", Description = "Full access to all features", CreatedAt = DateTime.UtcNow },
                    new Role { Name = "User", Description = "Can create/read/update own tasks, read organization tasks", CreatedAt = DateTime.UtcNow },
                    new Role { Name = "Viewer", Description = "Read-only access to tasks", CreatedAt = DateTime.UtcNow }
                };

                await context.Roles.AddRangeAsync(roles);
                await context.SaveChangesAsync();

                // #region agent log
                LogDebug("DataSeeder.cs:56", "Roles seeded successfully", new { count = roles.Length }, "A");
                // #endregion
            }
            else
            {
                // #region agent log
                LogDebug("DataSeeder.cs:61", "Roles already exist", new { }, "A");
                // #endregion
            }
        }
        catch (Exception ex)
        {
            // #region agent log
            LogDebug("DataSeeder.cs:67", "Exception in Roles seeding", new { error = ex.Message, type = ex.GetType().Name, stackTrace = ex.StackTrace }, "A,D,E");
            // #endregion
            throw;
        }

        // Seed default Organization if it doesn't exist
        var defaultOrg = await context.Organizations.FirstOrDefaultAsync(o => o.Slug == "default");
        if (defaultOrg == null)
        {
            defaultOrg = new Organization
            {
                Name = "Default Organization",
                Slug = "default",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await context.Organizations.AddAsync(defaultOrg);
            await context.SaveChangesAsync();
        }

        // Seed default TodoStates for the organization if they don't exist
        if (!await context.TodoStates.AnyAsync(s => s.OrganizationId == defaultOrg.Id))
        {
            var adminRole = await context.Roles.FirstAsync(r => r.Name == "Admin");
            var defaultStates = new[]
            {
                new TodoState
                {
                    Name = "draft",
                    DisplayName = "Draft",
                    Order = 0,
                    IsDefault = true,
                    Color = "#6B7280",
                    OrganizationId = defaultOrg.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new TodoState
                {
                    Name = "active",
                    DisplayName = "Active",
                    Order = 1,
                    IsDefault = false,
                    Color = "#3B82F6",
                    OrganizationId = defaultOrg.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new TodoState
                {
                    Name = "in-progress",
                    DisplayName = "In Progress",
                    Order = 2,
                    IsDefault = false,
                    Color = "#F59E0B",
                    OrganizationId = defaultOrg.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new TodoState
                {
                    Name = "done",
                    DisplayName = "Done",
                    Order = 3,
                    IsDefault = false,
                    Color = "#10B981",
                    OrganizationId = defaultOrg.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            await context.TodoStates.AddRangeAsync(defaultStates);
            await context.SaveChangesAsync();
        }

        // Migrate existing tasks to use TodoStateId if they exist
        var tasksWithoutState = await context.Tasks
            .Where(t => t.TodoStateId == 0 || !context.TodoStates.Any(s => s.Id == t.TodoStateId))
            .ToListAsync();

        if (tasksWithoutState.Any())
        {
            var activeState = await context.TodoStates.FirstAsync(s => s.Name == "active" && s.OrganizationId == defaultOrg.Id);
            var doneState = await context.TodoStates.FirstAsync(s => s.Name == "done" && s.OrganizationId == defaultOrg.Id);
            var defaultState = await context.TodoStates.FirstAsync(s => s.IsDefault && s.OrganizationId == defaultOrg.Id);

            // Create a default system user if needed for migration
            var systemUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "system@default.local");
            if (systemUser == null)
            {
                var userRole = await context.Roles.FirstAsync(r => r.Name == "User");
                systemUser = new User
                {
                    Email = "system@default.local",
                    PasswordHash = "MIGRATION_USER", // Not a real hash, just for migration
                    FirstName = "System",
                    LastName = "User",
                    OrganizationId = defaultOrg.Id,
                    RoleId = userRole.Id,
                    IsActive = false, // Inactive system user
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await context.Users.AddAsync(systemUser);
                await context.SaveChangesAsync();
            }

            foreach (var task in tasksWithoutState)
            {
                // For existing tasks, we'll use the default state
                // In a real migration, we'd check if there was an IsCompleted field
                // For now, we'll just assign default state
                task.TodoStateId = defaultState.Id;
                task.OrganizationId = defaultOrg.Id;
                task.CreatedById = systemUser.Id;
                task.UpdatedAt = DateTime.UtcNow;
                task.UpdatedById = systemUser.Id;
            }

            await context.SaveChangesAsync();
        }
    }
}

