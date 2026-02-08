using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using TodoApi.DTOs;
using Xunit;

namespace TodoApi.Tests;

public class TasksControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory<Program> _factory;

    public TasksControllerTests(CustomWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetTasks_ReturnsSuccessStatusCode()
    {
        // Act
        var response = await _client.GetAsync("/api/tasks");

        // Assert
        response.EnsureSuccessStatusCode();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetTasks_ReturnsListOfTasks()
    {
        // Act
        var response = await _client.GetAsync("/api/tasks");
        var tasks = await response.Content.ReadFromJsonAsync<List<TaskDto>>();

        // Assert
        response.EnsureSuccessStatusCode();
        tasks.Should().NotBeNull();
        tasks.Should().BeAssignableTo<IEnumerable<TaskDto>>();
    }

    [Fact]
    public async Task CreateTask_WithValidData_ReturnsCreated()
    {
        // Arrange
        var createTaskDto = new CreateTaskDto
        {
            Title = "Test Task",
            Description = "Test Description",
            Priority = TaskPriorityDto.Medium,
            DueDate = DateTime.UtcNow.AddDays(7)
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks", createTaskDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var task = await response.Content.ReadFromJsonAsync<TaskDto>();
        task.Should().NotBeNull();
        task!.Title.Should().Be(createTaskDto.Title);
        task.Description.Should().Be(createTaskDto.Description);
        task.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task CreateTask_WithInvalidData_ReturnsBadRequest()
    {
        // Arrange
        var createTaskDto = new CreateTaskDto
        {
            Title = "", // Invalid: empty title
            Description = "Test Description",
            Priority = TaskPriorityDto.Medium
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/tasks", createTaskDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetTaskById_WithValidId_ReturnsTask()
    {
        // Arrange - Create a task first
        var createTaskDto = new CreateTaskDto
        {
            Title = "Get Task Test",
            Description = "Description",
            Priority = TaskPriorityDto.High
        };
        var createResponse = await _client.PostAsJsonAsync("/api/tasks", createTaskDto);
        var createdTask = await createResponse.Content.ReadFromJsonAsync<TaskDto>();

        // Act
        var response = await _client.GetAsync($"/api/tasks/{createdTask!.Id}");

        // Assert
        response.EnsureSuccessStatusCode();
        var task = await response.Content.ReadFromJsonAsync<TaskDto>();
        task.Should().NotBeNull();
        task!.Id.Should().Be(createdTask.Id);
        task.Title.Should().Be(createdTask.Title);
    }

    [Fact]
    public async Task GetTaskById_WithInvalidId_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/tasks/99999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateTask_WithValidData_ReturnsOk()
    {
        // Arrange - Create a task first
        var createTaskDto = new CreateTaskDto
        {
            Title = "Original Title",
            Description = "Original Description",
            Priority = TaskPriorityDto.Low
        };
        var createResponse = await _client.PostAsJsonAsync("/api/tasks", createTaskDto);
        var createdTask = await createResponse.Content.ReadFromJsonAsync<TaskDto>();

        var updateTaskDto = new UpdateTaskDto
        {
            Title = "Updated Title",
            Description = "Updated Description",
            Priority = TaskPriorityDto.High
        };

        // Act
        var response = await _client.PutAsJsonAsync($"/api/tasks/{createdTask!.Id}", updateTaskDto);

        // Assert
        response.EnsureSuccessStatusCode();
        var updatedTask = await response.Content.ReadFromJsonAsync<TaskDto>();
        updatedTask.Should().NotBeNull();
        updatedTask!.Title.Should().Be(updateTaskDto.Title);
        updatedTask.Description.Should().Be(updateTaskDto.Description);
        updatedTask.Priority.Should().Be(updateTaskDto.Priority);
    }

    [Fact]
    public async Task UpdateTask_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        var updateTaskDto = new UpdateTaskDto
        {
            Title = "Updated Title",
            Description = "Updated Description",
            Priority = TaskPriorityDto.Medium
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/tasks/99999", updateTaskDto);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteTask_WithValidId_ReturnsNoContent()
    {
        // Arrange - Create a task first
        var createTaskDto = new CreateTaskDto
        {
            Title = "Task to Delete",
            Description = "Description",
            Priority = TaskPriorityDto.Medium
        };
        var createResponse = await _client.PostAsJsonAsync("/api/tasks", createTaskDto);
        var createdTask = await createResponse.Content.ReadFromJsonAsync<TaskDto>();

        // Act
        var response = await _client.DeleteAsync($"/api/tasks/{createdTask!.Id}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify task is deleted (soft delete)
        var getResponse = await _client.GetAsync($"/api/tasks/{createdTask.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteTask_WithInvalidId_ReturnsNotFound()
    {
        // Act
        var response = await _client.DeleteAsync("/api/tasks/99999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ToggleTaskStatus_WithValidId_ReturnsOk()
    {
        // Arrange - Create a task first
        var createTaskDto = new CreateTaskDto
        {
            Title = "Task to Toggle",
            Description = "Description",
            Priority = TaskPriorityDto.Medium
        };
        var createResponse = await _client.PostAsJsonAsync("/api/tasks", createTaskDto);
        var createdTask = await createResponse.Content.ReadFromJsonAsync<TaskDto>();
        var initialStatus = createdTask!.IsCompleted;

        // Act
        var response = await _client.PatchAsync($"/api/tasks/{createdTask.Id}/status", null);

        // Assert
        response.EnsureSuccessStatusCode();
        var toggledTask = await response.Content.ReadFromJsonAsync<TaskDto>();
        toggledTask.Should().NotBeNull();
        toggledTask!.IsCompleted.Should().Be(!initialStatus);
    }

    [Fact]
    public async Task GetTaskStats_ReturnsSuccessStatusCode()
    {
        // Act
        var response = await _client.GetAsync("/api/tasks/stats");

        // Assert
        response.EnsureSuccessStatusCode();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetTaskStats_ReturnsValidStats()
    {
        // Act
        var response = await _client.GetAsync("/api/tasks/stats");
        var stats = await response.Content.ReadFromJsonAsync<TaskStatsDto>();

        // Assert
        response.EnsureSuccessStatusCode();
        stats.Should().NotBeNull();
        stats!.Total.Should().BeGreaterThanOrEqualTo(0);
        stats.Completed.Should().BeGreaterThanOrEqualTo(0);
        stats.Active.Should().BeGreaterThanOrEqualTo(0);
        stats.HighPriority.Should().BeGreaterThanOrEqualTo(0);
    }

    [Fact]
    public async Task GetTasks_WithFilter_ReturnsFilteredResults()
    {
        // Arrange - Create a completed task
        var createTaskDto = new CreateTaskDto
        {
            Title = "Completed Task",
            Description = "Description",
            Priority = TaskPriorityDto.Medium
        };
        var createResponse = await _client.PostAsJsonAsync("/api/tasks", createTaskDto);
        var createdTask = await createResponse.Content.ReadFromJsonAsync<TaskDto>();
        
        // Toggle to completed
        await _client.PatchAsync($"/api/tasks/{createdTask!.Id}/status", null);

        // Act - Filter by completed
        var response = await _client.GetAsync("/api/tasks?isCompleted=true");
        var tasks = await response.Content.ReadFromJsonAsync<List<TaskDto>>();

        // Assert
        response.EnsureSuccessStatusCode();
        tasks.Should().NotBeNull();
        tasks!.All(t => t.IsCompleted).Should().BeTrue();
    }

    [Fact]
    public async Task GetTasks_WithSearchFilter_ReturnsMatchingResults()
    {
        // Arrange - Create a task with unique title
        var uniqueTitle = $"Search Test {Guid.NewGuid()}";
        var createTaskDto = new CreateTaskDto
        {
            Title = uniqueTitle,
            Description = "Description",
            Priority = TaskPriorityDto.Medium
        };
        await _client.PostAsJsonAsync("/api/tasks", createTaskDto);

        // Act - Search for the unique title
        var response = await _client.GetAsync($"/api/tasks?filter={uniqueTitle}");
        var tasks = await response.Content.ReadFromJsonAsync<List<TaskDto>>();

        // Assert
        response.EnsureSuccessStatusCode();
        tasks.Should().NotBeNull();
        tasks!.Any(t => t.Title.Contains(uniqueTitle)).Should().BeTrue();
    }
}

