# Quick Start Guide

## Get Started in 3 Steps

1. **Navigate to the project:**
   ```bash
   cd backend/TodoApi
   ```

2. **Restore and run:**
   ```bash
   dotnet restore
   dotnet run
   ```

3. **Test the API:**
   - Open Swagger UI: http://localhost:5002/swagger (or https://localhost:5001/swagger)
   - Or use curl/Postman to test endpoints

## What You Get

✅ Full CRUD API for tasks
✅ SQLite database (auto-created)
✅ Swagger documentation
✅ CORS configured for React frontend
✅ Error handling middleware
✅ Task filtering, sorting, and search
✅ Task statistics endpoint

## Example API Calls

### Create a task:
```bash
curl -X POST http://localhost:5002/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn .NET","description":"Study .NET Core","priority":2}'
```

### Get all tasks:
```bash
curl http://localhost:5002/api/tasks
```

### Get task stats:
```bash
curl http://localhost:5002/api/tasks/stats
```

## Next Steps

- Connect the React frontend
- Test all endpoints
- Customize as needed

