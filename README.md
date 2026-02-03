# Todo Task Management Application

A full-stack to-do task management application built with .NET Core backend and React frontend. This project demonstrates modern web development practices, clean architecture, and production-ready MVP features.

## 🚀 Quick Start

### Prerequisites

- **Backend**: [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) or later
- **Frontend**: Node.js (v18 or higher) and npm/yarn
- **Database**: SQLite (included, no separate installation needed)

### Running the Application

1. **Start the Backend API:**
   ```bash
   cd backend/TodoApi
   dotnet restore
   dotnet run
   ```
   The API will be available at:
   - HTTP: `http://localhost:5002`
   - HTTPS: `https://localhost:5001`
   - Swagger UI: `https://localhost:5001/swagger`

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## 📁 Project Structure

```
Ezra/
├── backend/
│   ├── TodoApi/              # .NET Core Web API
│   │   ├── Controllers/      # API endpoints
│   │   ├── Services/         # Business logic
│   │   ├── Data/             # Database context
│   │   ├── Models/           # Domain models
│   │   ├── DTOs/             # Data transfer objects
│   │   └── Middleware/       # Custom middleware
│   ├── README.md             # Backend documentation
│   ├── API_OVERVIEW.md       # Detailed API documentation
│   └── QUICK_START.md        # Quick start guide
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React Context (state management)
│   │   ├── services/         # API client
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Helper functions
│   └── README.md             # Frontend documentation
└── README.md                  # This file
```

## 🛠 Technology Stack

### Backend
- **.NET 10.0** - Web API framework
- **Entity Framework Core** - ORM
- **SQLite** - Database
- **Swagger/OpenAPI** - API documentation
- **FluentValidation** - Input validation

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Axios** - HTTP client

## ✨ Features

### Core Features
- ✅ **Full CRUD Operations** - Create, read, update, and delete tasks
- ✅ **Task Status Management** - Mark tasks as complete/incomplete
- ✅ **Task Priorities** - Low, Medium, High priority levels
- ✅ **Due Dates** - Optional due dates with overdue detection
- ✅ **Task Filtering** - Filter by completion status (All, Active, Completed)
- ✅ **Task Search** - Search tasks by title and description
- ✅ **Task Sorting** - Sort by title, priority, due date, or creation date
- ✅ **Task Statistics** - Dashboard with task counts and metrics
- ✅ **Input Validation** - Frontend and backend validation
- ✅ **Error Handling** - Comprehensive error handling with user feedback
- ✅ **Loading States** - Visual feedback during API calls
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop

### Production MVP Features
- ✅ RESTful API with proper HTTP methods and status codes
- ✅ Global exception handling middleware
- ✅ CORS configuration for frontend communication
- ✅ API documentation with Swagger
- ✅ Data persistence with SQLite
- ✅ Clean architecture with separation of concerns
- ✅ Dependency injection
- ✅ Logging throughout the application
- ✅ Type-safe frontend with TypeScript

## 📚 Documentation

- **[Backend README](backend/README.md)** - Backend setup, API endpoints, and architecture
- **[Backend API Overview](backend/API_OVERVIEW.md)** - Detailed API documentation with examples
- **[Backend Quick Start](backend/QUICK_START.md)** - Quick start guide for backend
- **[Frontend README](frontend/README.md)** - Frontend setup, features, and architecture

## 🏗 Architecture

### Backend Architecture
The backend follows **Clean Architecture** principles:

- **Controllers** - Handle HTTP requests/responses, input validation
- **Services** - Contain business logic (ITaskService, TaskService)
- **Data Layer** - Database access via Entity Framework Core
- **DTOs** - Separate API contracts from domain models
- **Middleware** - Global exception handling

### Frontend Architecture
The frontend uses a **component-based architecture**:

- **Components** - Reusable UI components (TaskList, TaskItem, TaskForm, etc.)
- **Context API** - Global state management for tasks
- **Services** - Centralized API client
- **Types** - TypeScript type definitions
- **Utils** - Helper functions

## 🔄 API Communication

The frontend communicates with the backend via RESTful API:

- **Base URL**: `http://localhost:5002/api`
- **Format**: JSON
- **CORS**: Configured for React development servers
- **Error Handling**: Consistent error response format

See [API_OVERVIEW.md](backend/API_OVERVIEW.md) for detailed endpoint documentation.

## 🎯 Interview Requirements Coverage

This project addresses all requirements from the interview prompt:

1. ✅ **Backend API Design** - .NET Core RESTful API with clean architecture
2. ✅ **Data Structure Design** - SQLite with Entity Framework Core
3. ✅ **Frontend Component Design** - React with TypeScript, component-based architecture
4. ✅ **Communication** - RESTful API with CORS, JSON, error handling
5. ✅ **Clean Code & Architecture** - Separation of concerns, DI, interfaces, DTOs
6. ✅ **Trade-offs & Assumptions** - Documented below and in individual READMEs
7. ✅ **README with Setup Steps** - Comprehensive documentation throughout
8. ✅ **Assumptions, Scalability, Future** - Documented below
9. ✅ **Production MVP Features** - All essential features implemented

## 🤔 Assumptions & Trade-offs

### Assumptions
1. **Single-user application** - No authentication required for MVP
2. **SQLite is sufficient** - Can migrate to PostgreSQL for production scale
3. **Simple task model** - No subtasks, dependencies, or complex relationships in MVP
4. **No real-time updates** - Polling or manual refresh is acceptable
5. **Modern browser support** - ES6+ features, no IE11 support needed
6. **Local development** - CORS configured for localhost development servers

### Trade-offs

#### Database
- **SQLite vs PostgreSQL**: Chose SQLite for simplicity, portability, and zero-configuration. Trade-off: Limited concurrency (single writer). **Future**: Easy migration path to PostgreSQL.

#### Authentication
- **No auth vs JWT**: Focused on core functionality first. Trade-off: Not production-ready for multi-user scenarios. **Future**: Add JWT-based authentication.

#### State Management
- **Context API vs Redux**: Chose Context API for simplicity. Trade-off: May need Redux for complex state. **Current**: Sufficient for MVP scope.

#### Validation
- **Data Annotations vs FluentValidation**: Using data annotations for simplicity. Trade-off: Less flexible than FluentValidation. **Future**: Can migrate to FluentValidation for complex rules.

#### Port Selection
- **Port 5002 vs 5000**: Using 5002 to avoid macOS AirPlay conflict. Trade-off: Non-standard port. **Note**: Documented and configurable.

## 📈 Scalability Considerations

### Current Limitations
- **SQLite concurrency** - Single writer limitation
- **No authentication** - Single-user only
- **No caching** - All requests hit the database
- **No rate limiting** - API is open to abuse
- **No horizontal scaling** - Single instance only
- **In-memory statistics** - Stats calculated on every request

### Scalability Path

#### Short-term (Next Sprint)
1. **Database Migration** - Move to PostgreSQL for better concurrency
2. **Authentication** - Add JWT-based authentication with refresh tokens
3. **Caching** - Add Redis for frequently accessed data
4. **Rate Limiting** - Implement API rate limiting
5. **Health Checks** - Add health check endpoints
6. **Structured Logging** - Migrate to Serilog with structured logging

#### Medium-term
1. **Repository Pattern** - Abstract data access for better testability
2. **Unit & Integration Tests** - Comprehensive test coverage
3. **API Versioning** - Support multiple API versions
4. **Pagination** - Add pagination for large task lists
5. **Background Jobs** - Add background job processing (Hangfire/Quartz)
6. **Monitoring** - Add Application Insights or similar

#### Long-term
1. **Microservices** - Split into separate services if needed
2. **Message Queue** - Add message queue for async processing
3. **CDN** - Serve static assets via CDN
4. **Load Balancing** - Multiple API instances behind load balancer
5. **Database Sharding** - If user base grows significantly
6. **Real-time Updates** - Add SignalR for real-time task updates

## 🚧 Future Enhancements

### Short-term (Next Sprint)
- [ ] User authentication and authorization
- [ ] Task categories/tags
- [ ] Task search with full-text search
- [ ] Export tasks (CSV, JSON)
- [ ] Task templates
- [ ] Keyboard shortcuts
- [ ] Toast notifications for success/error messages
- [ ] Dark mode toggle

### Medium-term
- [ ] Subtasks and task dependencies
- [ ] Task comments/notes
- [ ] File attachments
- [ ] Task sharing and collaboration
- [ ] Email notifications for due dates
- [ ] Calendar view
- [ ] Recurring tasks
- [ ] Drag-and-drop reordering
- [ ] Task analytics and reporting

### Long-term
- [ ] Mobile app (React Native)
- [ ] Offline support (PWA with service workers)
- [ ] AI-powered task prioritization
- [ ] Integration with calendar apps (Google Calendar, Outlook)
- [ ] Team workspaces
- [ ] Advanced analytics and reporting
- [ ] Task automation and workflows

## 🧪 Testing

### Current State
- Manual testing via Swagger UI and frontend
- No automated tests (trade-off for MVP)

### Future Testing Strategy
- **Backend**: Unit tests for services, integration tests for API endpoints
- **Frontend**: Component tests with React Testing Library, E2E tests with Playwright/Cypress
- **CI/CD**: Automated test runs on pull requests

## 📝 Development Notes

### Backend
- Database is automatically created on first run using `EnsureCreated()`
- For production, consider using migrations: `dotnet ef migrations add InitialCreate`
- CORS is configured for local development; adjust for production
- Swagger is enabled in development mode only

### Frontend
- API base URL is configured in `src/services/api.ts`
- All API calls are centralized in the API service
- State management uses React Context API
- Form validation handled by React Hook Form

## 🤝 Contributing

This is an interview project, but if you'd like to suggest improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is part of an interview assessment.

## 👤 Author

Built as part of the Ezra Full Stack Developer interview process.

---

## 🔗 Quick Links

- **Repository**: [GitHub](https://github.com/fleav19/aavila_interview_2026_2)
- **Backend API Docs**: [Swagger UI](https://localhost:5001/swagger) (when running)
- **Backend README**: [backend/README.md](backend/README.md)
- **Frontend README**: [frontend/README.md](frontend/README.md)

