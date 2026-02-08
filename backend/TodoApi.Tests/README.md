# TodoApi Integration Tests

This project contains integration tests for the TodoApi REST API endpoints.

## Running Tests

### Run all tests
```bash
cd backend/TodoApi.Tests
dotnet test
```

### Run tests with verbose output
```bash
dotnet test --verbosity normal
```

### Run a specific test
```bash
dotnet test --filter "FullyQualifiedName~TasksControllerTests.GetTasks_ReturnsSuccessStatusCode"
```

## Test Structure

- **WebApplicationFactory**: Sets up the test environment with in-memory database
- **TasksControllerTests**: Integration tests for all REST API endpoints

## Test Coverage

The tests cover:
- ✅ GET /api/tasks - Get all tasks
- ✅ GET /api/tasks/{id} - Get task by ID
- ✅ POST /api/tasks - Create task
- ✅ PUT /api/tasks/{id} - Update task
- ✅ DELETE /api/tasks/{id} - Delete task
- ✅ PATCH /api/tasks/{id}/status - Toggle task status
- ✅ GET /api/tasks/stats - Get task statistics
- ✅ Filtering and search functionality
- ✅ Validation and error handling

## Test Database

Tests use an in-memory database (separate instance per test) to ensure:
- Tests don't affect each other
- No external database dependencies
- Fast test execution
- Clean state for each test

