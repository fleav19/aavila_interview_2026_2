# Full Stack To-Do Application - Project Plan

## Overview
Build a production-ready to-do task management system with .NET Core backend and React frontend.

## Technology Stack

### Backend
- **Framework**: .NET 8 Core (latest LTS)
- **ORM**: Entity Framework Core
- **Database**: SQLite (for simplicity and portability)
- **API**: RESTful API with ASP.NET Core Web API
- **Validation**: FluentValidation
- **Testing**: xUnit (optional but recommended)

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API or Zustand (lightweight)
- **HTTP Client**: Axios or Fetch API
- **UI Library**: Tailwind CSS or Material-UI (for quick, professional UI)
- **Form Handling**: React Hook Form
- **Testing**: Vitest + React Testing Library (optional)

## Project Structure

```
ezra-todo-app/
├── backend/
│   ├── TodoApi/
│   │   ├── Controllers/
│   │   ├── Models/
│   │   ├── Data/
│   │   ├── Services/
│   │   ├── DTOs/
│   │   ├── Validators/
│   │   ├── Program.cs
│   │   └── TodoApi.csproj
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md (main project README)
```

## Core Features (MVP)

### Backend API Endpoints
1. **GET /api/tasks** - Get all tasks (with filtering, sorting, pagination)
2. **GET /api/tasks/{id}** - Get task by ID
3. **POST /api/tasks** - Create new task
4. **PUT /api/tasks/{id}** - Update task
5. **PATCH /api/tasks/{id}/status** - Update task status (toggle complete)
6. **DELETE /api/tasks/{id}** - Delete task
7. **GET /api/tasks/stats** - Get task statistics (optional)

### Frontend Features
1. **Task List View**
   - Display all tasks
   - Filter by status (All, Active, Completed)
   - Sort by date, priority, status
   - Search functionality
   - Empty state handling

2. **Task Creation/Editing**
   - Create new task form
   - Edit existing task
   - Form validation
   - Success/error notifications

3. **Task Actions**
   - Mark as complete/incomplete
   - Delete task (with confirmation)
   - Edit task inline or via modal

4. **UI/UX Enhancements**
   - Loading states
   - Error handling and display
   - Responsive design
   - Optimistic updates
   - Keyboard shortcuts (optional)

## Data Model

### Task Entity
```csharp
public class Task
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public TaskPriority Priority { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public enum TaskPriority
{
    Low = 0,
    Medium = 1,
    High = 2
}
```

## Architecture Decisions

### Backend Architecture
1. **Clean Architecture Layers**
   - Controllers (API layer)
   - Services (Business logic)
   - Data/Repository (Data access)
   - DTOs (Data transfer objects)

2. **Dependency Injection**
   - Use built-in DI container
   - Interface-based design for testability

3. **Error Handling**
   - Global exception middleware
   - Consistent error response format
   - HTTP status codes

4. **CORS Configuration**
   - Configure for frontend communication
   - Development and production settings

### Frontend Architecture
1. **Component Structure**
   - Presentational components
   - Container components
   - Custom hooks for business logic

2. **State Management**
   - React Context for global state (tasks, loading, errors)
   - Local state for form inputs

3. **API Communication**
   - Centralized API service
   - Error handling wrapper
   - Request/response interceptors

## Production MVP Features

### Must-Have
1. ✅ CRUD operations for tasks
2. ✅ Task status management (complete/incomplete)
3. ✅ Input validation (frontend and backend)
4. ✅ Error handling and user feedback
5. ✅ Responsive design
6. ✅ Loading states
7. ✅ Data persistence (SQLite)

### Nice-to-Have (if time permits)
1. ⭐ Task priority levels
2. ⭐ Due dates
3. ⭐ Task search/filter
4. ⭐ Task statistics dashboard
5. ⭐ Drag-and-drop reordering
6. ⭐ Task categories/tags
7. ⭐ Undo/redo functionality


## Assumptions & Trade-offs

### Assumptions
1. Single-user application (no authentication required for MVP)
2. SQLite is sufficient for MVP (can scale to PostgreSQL later)
3. No real-time updates needed (polling or manual refresh)
4. Tasks are simple entities (no subtasks in MVP)
5. No file attachments or rich text

### Trade-offs
1. **SQLite vs PostgreSQL**: SQLite chosen for simplicity and portability
2. **In-memory vs SQLite**: SQLite chosen for data persistence
3. **No authentication**: MVP focuses on core functionality
4. **Simple state management**: Context API vs Redux (simpler for MVP)
5. **No caching**: Can add Redis later if needed

## Scalability Considerations

### Current Limitations
- SQLite has concurrency limitations (single writer)
- No authentication/authorization
- No horizontal scaling support
- No caching layer

### Future Scalability Path
1. **Database**: Migrate to PostgreSQL for better concurrency
2. **Authentication**: Add JWT-based auth with refresh tokens
3. **Caching**: Add Redis for frequently accessed data
4. **API**: Add rate limiting and request throttling
5. **Monitoring**: Add logging (Serilog) and health checks
6. **Testing**: Add unit and integration tests
7. **CI/CD**: Set up automated testing and deployment
8. **Real-time**: Add SignalR for real-time updates
9. **Microservices**: Split into separate services if needed

## Future Enhancements

### Short-term
1. User authentication and authorization
2. Task categories/tags
3. Task search with full-text search
4. Export tasks (CSV, JSON)
5. Task templates
6. Keyboard shortcuts

### Medium-term
1. Subtasks and task dependencies
2. Task comments/notes
3. File attachments
4. Task sharing and collaboration
5. Email notifications
6. Calendar view
7. Recurring tasks

### Long-term
1. Mobile app (React Native)
2. Offline support (PWA)
3. AI-powered task prioritization
4. Integration with calendar apps
5. Team workspaces
6. Advanced analytics and reporting

## Testing Strategy

### Backend
- Unit tests for services
- Integration tests for API endpoints
- Repository pattern for testability

### Frontend
- Component unit tests
- Integration tests for user flows
- E2E tests (optional, with Playwright/Cypress)
