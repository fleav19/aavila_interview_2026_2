# Todo Task Management Application

A full-stack to-do task management application built with .NET Core backend and React frontend. This project demonstrates modern web development practices, clean architecture, and production-ready MVP features.

## 🚀 Quick Start

### Prerequisites

- **Backend**: [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) or later
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
├── docs/
│   ├── v1/                   # Original documentation
│   └── v2/                    # Enhanced documentation
└── README.md                  # This file
```

## 🛠 Technology Stack

### Backend
- **.NET 10.0** - Web API framework
- **Entity Framework Core** - ORM
- **SQLite** - Database
- **Swagger/OpenAPI** - API documentation
- **BCrypt.Net-Next** - Password hashing
- **JWT Bearer Authentication** - Token-based auth
- **xUnit** - Testing framework

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling with dark mode support
- **React Hook Form** - Form handling
- **Axios** - HTTP client

## ✨ Features

### Authentication & Authorization
- ✅ **User Registration** - Create accounts with email, password, name
- ✅ **User Login** - JWT-based authentication
- ✅ **User Logout** - Secure session termination
- ✅ **Role-Based Access Control (RBAC)** - Admin, User, Viewer roles
- ✅ **Multi-Tenancy** - Organization-based data isolation
- ✅ **JWT Tokens** - Secure token-based authentication

### Task Management
- ✅ **Full CRUD Operations** - Create, read, update, and delete tasks
- ✅ **Configurable Task States** - Custom lifecycle states (Draft, Active, In Progress, Done, etc.)
- ✅ **Task State Selection** - Dropdown to change task states with visual badges
- ✅ **Task Priorities** - Low, Medium, High priority levels
- ✅ **Due Dates** - Optional due dates with overdue detection
- ✅ **Task Filtering** - Filter by state, assignee, completion status, search
- ✅ **Task Search** - Search tasks by title and description
- ✅ **Task Sorting** - Sort by title, priority, due date, or creation date
- ✅ **Task Assignment** - Assign tasks to team members with filtering
- ✅ **Task Detail View** - Full task detail page with audit trail
- ✅ **Soft Deletion** - Tasks are soft-deleted with audit trail
- ✅ **Audit Trail** - Track who created/updated/deleted tasks

### Admin Features
- ✅ **User Management** - View, update roles, activate/deactivate users
- ✅ **Todo State Management** - Full CRUD for custom task states
- ✅ **State Configuration** - Set colors, icons, display names, order
- ✅ **Default State** - Configure default state for new tasks
- ✅ **Organization Settings** - Manage organization name, slug, view statistics
- ✅ **Organization Scoping** - All data scoped to user's organization

### User Experience
- ✅ **Dark Mode** - Full dark mode support with theme persistence
- ✅ **Internationalization (i18n)** - English, Spanish, French language support
- ✅ **User Preferences** - Configurable stats visibility, theme, language
- ✅ **Configurable Statistics** - Users can choose which stats to display
- ✅ **URL Routing** - React Router with URL-based navigation
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop
- ✅ **Loading States** - Visual feedback during API calls
- ✅ **Error Handling** - Comprehensive error handling with user feedback

### Statistics & Dashboard
- ✅ **Task Statistics** - Total, Active, Completed, High Priority counts
- ✅ **State-Based Statistics** - Counts for each custom state
- ✅ **Configurable Stats Banner** - Users can customize visible statistics
- ✅ **Real-time Updates** - Statistics update as tasks change

### Production MVP Features
- ✅ RESTful API with proper HTTP methods and status codes
- ✅ Global exception handling middleware
- ✅ CORS configuration for frontend communication
- ✅ API documentation with Swagger (JWT support)
- ✅ Data persistence with SQLite
- ✅ Clean architecture with separation of concerns
- ✅ Dependency injection
- ✅ Logging throughout the application
- ✅ Type-safe frontend with TypeScript
- ✅ Integration tests for backend API
- ✅ Monolith architecture (designed for future microservices migration if needed)

## 📚 Documentation

- **[Backend README](backend/README.md)** - Backend setup, API endpoints, and architecture
- **[Backend API Overview](backend/API_OVERVIEW.md)** - Detailed API documentation with examples
- **[Backend Quick Start](backend/QUICK_START.md)** - Quick start guide for backend
- **[Frontend README](frontend/README.md)** - Frontend setup, features, and architecture
- **[User Stories](docs/v2/USER_STORIES.md)** - Detailed user stories by role
- **[Functional Requirements](docs/v2/FUNCTIONAL_REQUIREMENTS.md)** - Complete functional requirements
- **[Data Model](docs/v2/DATA_MODEL.md)** - Database schema and relationships
- **[Trade-offs](docs/v2/TRADE_OFFS.md)** - Design decisions and trade-offs

## 🏗 Architecture

### Backend Architecture
The backend follows **Clean Architecture** principles:

- **Controllers** - Handle HTTP requests/responses, input validation, authorization
- **Services** - Contain business logic (ITaskService, IAuthService, ITodoStateService, etc.)
- **Data Layer** - Database access via Entity Framework Core
- **DTOs** - Separate API contracts from domain models
- **Middleware** - Global exception handling, authentication, authorization

### Frontend Architecture
The frontend uses a **component-based architecture**:

- **Components** - Reusable UI components (TaskList, TaskItem, TaskForm, UserMenu, etc.)
- **Context API** - Global state management (AuthContext, TaskContext, ThemeContext, I18nContext)
- **Services** - Centralized API client
- **Types** - TypeScript type definitions
- **Utils** - Helper functions

## 🔄 API Communication

The frontend communicates with the backend via RESTful API:

- **Base URL**: `http://localhost:5002/api`
- **Format**: JSON
- **Authentication**: JWT Bearer tokens
- **CORS**: Configured for React development servers
- **Error Handling**: Consistent error response format

See [API_OVERVIEW.md](backend/API_OVERVIEW.md) for detailed endpoint documentation.

## 🎯 Interview Requirements Coverage

This project addresses all requirements from the interview prompt:

1. ✅ **Backend API Design** - .NET Core RESTful API with clean architecture
2. ✅ **Data Structure Design** - SQLite with Entity Framework Core
3. ✅ **Frontend Component Design** - React with TypeScript, component-based architecture
4. ✅ **Communication** - RESTful API with CORS, JSON, error handling, JWT auth
5. ✅ **Clean Code & Architecture** - Separation of concerns, DI, interfaces, DTOs
6. ✅ **Trade-offs & Assumptions** - Documented in [TRADE_OFFS.md](docs/v2/TRADE_OFFS.md)
7. ✅ **README with Setup Steps** - Comprehensive documentation throughout
8. ✅ **Assumptions, Scalability, Future** - Documented below and in docs
9. ✅ **Production MVP Features** - All essential features implemented

## 🤔 Assumptions & Trade-offs

### Assumptions
1. **Multi-tenant application** - Users belong to organizations for data isolation
2. **SQLite is sufficient** - Can migrate to PostgreSQL for production scale
3. **JWT tokens** - Stateless authentication, no server-side session storage
4. **REST API** - GraphQL deferred to future phase
5. **Modern browser support** - ES6+ features, no IE11 support needed
6. **Local development** - CORS configured for localhost development servers

### Trade-offs

#### Database
- **SQLite vs PostgreSQL**: Chose SQLite for simplicity, portability, and zero-configuration. Trade-off: Limited concurrency (single writer). **Future**: Easy migration path to PostgreSQL.

#### Authentication
- **JWT vs Session-based**: Chose JWT for stateless authentication. Trade-off: Token revocation requires blacklist. **Current**: Client-side token removal on logout.

#### API Style
- **REST vs GraphQL**: Chose REST for MVP simplicity. Trade-off: GraphQL provides more flexibility. **Future**: Can add GraphQL alongside REST.

#### State Management
- **Context API vs Redux**: Chose Context API for simplicity. Trade-off: May need Redux for complex state. **Current**: Sufficient for MVP scope.

#### Theme & Language
- **User Preferences vs System Defaults**: Store preferences per user. Trade-off: Additional storage. **Current**: Preferences stored in User table as JSON.

See [TRADE_OFFS.md](docs/v2/TRADE_OFFS.md) for detailed trade-off documentation.

## 📈 Scalability Considerations

### Current Limitations
- **SQLite concurrency** - Single writer limitation
- **No caching** - All requests hit the database
- **No rate limiting** - API is open to abuse (mitigated by authentication)
- **No horizontal scaling** - Single instance only
- **In-memory statistics** - Stats calculated on every request

### Scalability Path

#### Short-term (Next Sprint)
1. **Database Migration** - Move to PostgreSQL for better concurrency
2. **Token Refresh** - Add refresh token mechanism for better security
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
7. **GraphQL** - Add GraphQL API alongside REST

## 🚧 Future Enhancements

### Short-term (Next Sprint)
- [ ] Projects - Group tasks together in projects
- [ ] Subtasks - Create subtasks for breaking down work
- [ ] Advanced statistics (by user, trends)
- [ ] State reordering UI (drag-and-drop)
- [ ] GraphQL API (deferred from initial plan)

### Medium-term
- [ ] Task dependencies (blocking tasks, dependency chains)
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
- ✅ **Integration Tests** - Backend API integration tests with xUnit
- ✅ **Manual Testing** - Via Swagger UI and frontend
- ⚠️ **Unit Tests** - Limited (trade-off for MVP)

### Future Testing Strategy
- **Backend**: Unit tests for services, more integration tests for API endpoints
- **Frontend**: Component tests with React Testing Library, E2E tests with Playwright/Cypress
- **CI/CD**: Automated test runs on pull requests

## 📝 Development Notes

### Backend
- Database is automatically created on first run using `EnsureCreated()`
- Data seeder populates default roles, organization, and todo states
- For production, consider using migrations: `dotnet ef migrations add InitialCreate`
- CORS is configured for local development; adjust for production
- Swagger is enabled in development mode only
- JWT secret key should be set via environment variable in production

### Frontend
- API base URL is configured in `src/services/api.ts`
- All API calls are centralized in the API service
- State management uses React Context API
- Form validation handled by React Hook Form
- Theme and language preferences persist per user
- Dark mode uses Tailwind's class-based dark mode

## 🔐 Security Considerations

- Passwords are hashed using BCrypt
- JWT tokens include user ID, role, and organization ID
- Role-based authorization enforced at controller and service levels
- Multi-tenant data isolation (users can only access their organization's data)
- CORS configured for specific origins
- Input validation on both frontend and backend

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
- **User Stories**: [docs/v2/USER_STORIES.md](docs/v2/USER_STORIES.md)

