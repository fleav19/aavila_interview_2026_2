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

## Implementation Steps

### Phase 1: Backend Setup (2-3 hours)
1. Create .NET Core Web API project
2. Set up Entity Framework Core with SQLite
3. Create Task model and DbContext
4. Create database migrations
5. Set up dependency injection
6. Configure CORS

### Phase 2: Backend API (2-3 hours)
1. Create DTOs (CreateTaskDto, UpdateTaskDto, TaskDto)
2. Create service layer (ITaskService, TaskService)
3. Create controller with CRUD endpoints
4. Add validation (FluentValidation)
5. Add error handling middleware
6. Test endpoints with Postman/Swagger

### Phase 3: Frontend Setup (1-2 hours)
1. Create React + TypeScript + Vite project
2. Set up Tailwind CSS or Material-UI
3. Configure API client (Axios)
4. Set up routing (if needed)
5. Create base component structure

### Phase 4: Frontend Implementation (3-4 hours)
1. Create Task type definitions
2. Create API service layer
3. Create Context for state management
4. Build TaskList component
5. Build TaskForm component (create/edit)
6. Build TaskItem component
7. Add filtering and sorting
8. Add error handling and loading states
9. Style and polish UI

### Phase 5: Integration & Testing (1-2 hours)
1. Connect frontend to backend
2. Test all CRUD operations
3. Test error scenarios
4. Fix any integration issues
5. Add loading and error states

### Phase 6: Documentation & Polish (1-2 hours)
1. Write comprehensive README.md
2. Document setup steps
3. Document assumptions and trade-offs
4. Document scalability considerations
5. Document future enhancements
6. Add code comments where needed
7. Clean up code

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

### Short-term (Next Sprint)
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

## Deliverables Checklist

- [ ] Backend API with all CRUD operations
- [ ] Frontend React application
- [ ] Database setup and migrations
- [ ] README.md with setup instructions
- [ ] README.md with assumptions and trade-offs
- [ ] README.md with scalability notes
- [ ] README.md with future enhancements
- [ ] Clean, well-structured code
- [ ] Error handling throughout
- [ ] Responsive UI
- [ ] Production-ready MVP features
- [ ] Git repository with proper .gitignore
- [ ] Code comments where necessary

## Estimated Time
**Total: 10-15 hours**
- Backend: 4-6 hours
- Frontend: 4-6 hours
- Integration & Testing: 2-3 hours
- Documentation: 1-2 hours

## Next Steps
1. Review and approve this plan
2. Set up project structure
3. Begin Phase 1: Backend Setup
4. Iterate through phases
5. Final review and polish

