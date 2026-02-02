# Todo API - Backend

A RESTful API for managing to-do tasks built with .NET 8 Core, Entity Framework Core, and SQLite.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) or later
- Your favorite IDE (Visual Studio, VS Code, Rider, etc.)

## Setup Instructions

1. **Navigate to the project directory:**
   ```bash
   cd backend/TodoApi
   ```

2. **Restore dependencies:**
   ```bash
   dotnet restore
   ```

3. **Run the application:**
   ```bash
   dotnet run
   ```

   The API will be available at:
   - HTTP: `http://localhost:5002` (port 5000 is often used by macOS AirPlay)
   - HTTPS: `https://localhost:5001`
   - Swagger UI: `https://localhost:5001/swagger` (or `http://localhost:5002/swagger` in HTTP mode)

## Database

The application uses SQLite with Entity Framework Core. The database file (`todo.db`) will be automatically created in the project root when you first run the application.

### Database Schema

The `Task` table has the following structure:
- `Id` (int, Primary Key)
- `Title` (string, required, max 200 chars)
- `Description` (string, optional, max 1000 chars)
- `IsCompleted` (bool)
- `CreatedAt` (DateTime)
- `DueDate` (DateTime, nullable)
- `Priority` (enum: Low, Medium, High)
- `CompletedAt` (DateTime, nullable)

## API Endpoints

### Get All Tasks
```
GET /api/tasks
Query Parameters:
  - filter (string, optional): Search in title and description
  - sortBy (string, optional): Sort by "title", "priority", "duedate", or "created" (default)
  - isCompleted (bool, optional): Filter by completion status
```

### Get Task Statistics
```
GET /api/tasks/stats
Returns: Total, Completed, Active, and High Priority task counts
```

### Get Task by ID
```
GET /api/tasks/{id}
```

### Create Task
```
POST /api/tasks
Body:
{
  "title": "Task title",
  "description": "Task description (optional)",
  "dueDate": "2024-12-31T00:00:00Z",
  "priority": 0  // 0=Low, 1=Medium, 2=High
}
```

### Update Task
```
PUT /api/tasks/{id}
Body: Same as Create Task
```

### Toggle Task Status
```
PATCH /api/tasks/{id}/status
Toggles the completion status of a task
```

### Delete Task
```
DELETE /api/tasks/{id}
```

## Testing the API

### Using Swagger UI
1. Run the application
2. Navigate to `https://localhost:5001/swagger`
3. Use the interactive API documentation to test endpoints

### Using curl
```bash
# Get all tasks
curl http://localhost:5002/api/tasks

# Create a task
curl -X POST http://localhost:5002/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"My first task","description":"This is a test task","priority":1}'

# Update a task
curl -X PUT http://localhost:5002/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated task","description":"Updated description","priority":2}'

# Toggle task status
curl -X PATCH http://localhost:5002/api/tasks/1/status

# Delete a task
curl -X DELETE http://localhost:5002/api/tasks/1
```

## Project Structure

```
TodoApi/
├── Controllers/       # API controllers
├── Data/             # DbContext and database configuration
├── DTOs/             # Data Transfer Objects
├── Middleware/       # Custom middleware (exception handling)
├── Models/           # Domain models
├── Services/         # Business logic services
├── Program.cs        # Application entry point
└── appsettings.json  # Configuration
```

## Architecture Decisions

### Clean Architecture
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Data**: Database access via Entity Framework
- **DTOs**: Separate API contracts from domain models

### Dependency Injection
- All services are registered in `Program.cs`
- Interface-based design for testability

### Error Handling
- Global exception middleware for consistent error responses
- Proper HTTP status codes (404, 400, 500, etc.)

### CORS Configuration
- Configured to allow requests from React development servers
- Can be adjusted for production deployment

## Assumptions & Trade-offs

### Assumptions
1. Single-user application (no authentication required for MVP)
2. SQLite is sufficient for MVP (can migrate to PostgreSQL for production)
3. Tasks are simple entities (no subtasks in MVP)
4. No real-time updates needed

### Trade-offs
1. **SQLite vs PostgreSQL**: Chosen for simplicity and portability
2. **No authentication**: MVP focuses on core functionality
3. **Simple validation**: Using data annotations (could use FluentValidation for complex rules)
4. **In-memory vs SQLite**: SQLite chosen for data persistence

## Scalability Considerations

### Current Limitations
- SQLite has concurrency limitations (single writer)
- No authentication/authorization
- No caching layer
- No rate limiting

### Future Enhancements
1. **Database**: Migrate to PostgreSQL for better concurrency
2. **Authentication**: Add JWT-based authentication
3. **Caching**: Add Redis for frequently accessed data
4. **API**: Add rate limiting and request throttling
5. **Monitoring**: Add structured logging (Serilog) and health checks
6. **Testing**: Add unit and integration tests
7. **Real-time**: Add SignalR for real-time updates

## Development Notes

- The database is automatically created on first run using `EnsureCreated()`
- For production, consider using migrations: `dotnet ef migrations add InitialCreate`
- CORS is configured for local development; adjust for production
- Swagger is enabled in development mode only

