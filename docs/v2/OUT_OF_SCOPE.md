# Out of Scope Document

## Overview
This document explicitly defines features, capabilities, and requirements that are **NOT** included in the current scope of the Ezra TODO application. This helps set clear boundaries and manage expectations.

---

## 1. Features Explicitly Out of Scope

### 1.1 Task Dependencies (Blocking Tasks)
**What**: Task dependencies where one task blocks another, dependency chains, dependency resolution
**Why Out of Scope**: 
- Requires dependency resolution logic
- Complex UI for dependency visualization
- Circular dependency detection
- Not required for MVP

**Note**: Basic subtasks (parent-child relationships) are now in scope for MVP. See USER_STORIES.md for details.

**Future Consideration**: Advanced dependency management can be added as Phase 2 feature

---

### 1.2 File Attachments
**What**: Ability to attach files, images, or documents to tasks
**Why Out of Scope**:
- Requires file storage (S3, Azure Blob, etc.)
- File upload handling
- File size limits and validation
- Security concerns (malware scanning)
- Storage costs

**Future Consideration**: Can be added with cloud storage integration

---

### 1.3 Rich Text Editing
**What**: Markdown, HTML, or rich text formatting in task descriptions
**Why Out of Scope**:
- Requires rich text editor library
- Sanitization and security concerns
- More complex validation
- Not essential for MVP

**Current**: Plain text descriptions only

---

### 1.4 Task Comments/Notes
**What**: Separate comments or notes system for tasks
**Why Out of Scope**:
- Additional data model complexity
- Real-time comment updates
- Notification system needed
- Can use description field for now

**Future Consideration**: Can be added as collaboration feature

---

### 1.5 Task Templates
**What**: Pre-defined task templates for common workflows
**Why Out of Scope**:
- Additional data model
- Template management UI
- Not essential for MVP

**Future Consideration**: Useful feature for Phase 2

---

### 1.6 Recurring Tasks
**What**: Tasks that automatically repeat (daily, weekly, monthly)
**Why Out of Scope**:
- Requires scheduling logic
- Cron job or background service
- Complex date calculations
- Not essential for MVP

**Future Consideration**: Can be added with background job processing

---

### 1.7 Task Sharing and Collaboration
**What**: Share tasks with specific users, real-time collaboration
**Why Out of Scope**:
- Complex permission system
- Real-time synchronization (WebSockets)
- Conflict resolution
- Notification system
- Current scope: organization-level access only

**Future Consideration**: Major feature for Phase 3

---

### 1.8 Email Notifications
**What**: Email alerts for due dates, assignments, updates
**Why Out of Scope**:
- Email service integration (SendGrid, SES, etc.)
- Email template system
- Notification preferences
- Background job processing
- Not essential for MVP

**Future Consideration**: Can be added with email service integration

---

### 1.9 Calendar Integration
**What**: Integration with Google Calendar, Outlook, iCal
**Why Out of Scope**:
- OAuth integration for calendar services
- Calendar API complexity
- Sync logic
- Not essential for MVP

**Future Consideration**: External integration feature

---

### 1.10 Mobile Applications
**What**: Native iOS or Android mobile apps
**Why Out of Scope**:
- Separate codebase required
- App store deployment
- Platform-specific development
- Current scope: Web application only

**Future Consideration**: React Native or PWA approach

---

### 1.11 Offline Support
**What**: PWA with service workers for offline functionality
**Why Out of Scope**:
- Service worker implementation
- Local storage sync logic
- Conflict resolution
- Complex state management
- Not essential for MVP

**Future Consideration**: PWA features for Phase 2

---

### 1.12 Task Analytics and Reporting
**What**: Advanced analytics, charts, productivity metrics
**Why Out of Scope**:
- Analytics data aggregation
- Charting libraries
- Complex queries
- Not essential for MVP
- Current: Basic statistics only

**Future Consideration**: Business intelligence features

---

### 1.13 Task Categories/Tags (Beyond Projects)
**What**: Additional categorization or tagging system beyond projects (e.g., tags, labels, custom fields)
**Why Out of Scope**:
- Additional data model complexity
- Many-to-many relationships
- Tag management UI
- Projects provide sufficient organization for MVP

**Note**: Projects (grouping tasks together) are now in scope for MVP. See USER_STORIES.md for details. This section refers to additional tagging/categorization systems beyond projects.

**Future Consideration**: Can be added easily in Phase 2 if needed

---

### 1.14 Drag-and-Drop Reordering
**What**: Visual drag-and-drop to reorder tasks
**Why Out of Scope**:
- UI library (react-beautiful-dnd, etc.)
- Order persistence
- Not essential for MVP
- Current: Sort by various fields

**Future Consideration**: UX enhancement for Phase 2

---

### 1.15 Keyboard Shortcuts
**What**: Power user keyboard shortcuts for common actions
**Why Out of Scope**:
- Keyboard event handling
- Shortcut conflict resolution
- Documentation needed
- Not essential for MVP

**Future Consideration**: UX enhancement

---

### 1.16 Task Export
**What**: Export tasks to CSV, JSON, PDF
**Why Out of Scope**:
- Export formatting logic
- File generation
- Not essential for MVP

**Future Consideration**: Useful feature for data portability

---

### 1.17 Task Import
**What**: Import tasks from CSV, JSON, or other formats
**Why Out of Scope**:
- File parsing
- Data validation
- Error handling
- Not essential for MVP

**Future Consideration**: Data migration feature

---

### 1.18 Dark Mode
**What**: Theme switching (light/dark mode)
**Why Out of Scope**:
- Theme management
- CSS variable system
- User preference storage
- Not essential for MVP

**Future Consideration**: UX enhancement

---

## 2. Technical Capabilities Out of Scope

### 2.1 Real-time Updates
**What**: WebSocket or SignalR for real-time task updates
**Why Out of Scope**:
- Additional infrastructure
- Connection management
- Not essential for MVP
- Current: Polling/manual refresh

**Future Consideration**: SignalR or GraphQL subscriptions (when GraphQL is implemented)

---

### 2.2 Caching Layer
**What**: Redis or in-memory caching
**Why Out of Scope**:
- Additional infrastructure
- Cache invalidation complexity
- SQLite is fast for small datasets
- Not needed for MVP scale

**Future Consideration**: Add when performance requires it

---

### 2.3 Microservices Architecture
**What**: Breaking the backend into separate microservices (e.g., Auth Service, Task Service, User Service)
**Why Out of Scope**:
- Much more complex architecture for MVP
- Service-to-service communication overhead
- Distributed system challenges
- More infrastructure to manage
- Overkill for MVP scale
- Current: Monolith architecture

**Note**: The backend is intentionally kept as a monolith for MVP. While we have ideas about microservices architecture, we will wait for user traffic and real-world usage patterns to confirm the need before making that architectural change. Premature microservices can add unnecessary complexity without clear benefits.

**Future Consideration**: Consider microservices only when:
- User traffic confirms need for independent scaling
- Specific services have different scaling requirements
- Clear service boundaries emerge from usage patterns
- Performance bottlenecks identified in specific areas

---

### 2.4 Rate Limiting
**What**: API rate limiting to prevent abuse
**Why Out of Scope**:
- Additional middleware
- Rate limit storage
- Not essential for MVP
- Can be added at infrastructure level

**Future Consideration**: Security enhancement

---

### 2.4 API Versioning
**What**: Support for multiple API versions
**Why Out of Scope**:
- Additional complexity
- Not needed for MVP
- GraphQL schema evolution handles this

**Future Consideration**: If breaking changes needed

---

### 2.5 Database Migrations (EF Core Migrations)
**What**: Proper EF Core migration system
**Why Out of Scope**:
- Using `EnsureCreated()` for simplicity
- Not production-ready approach
- Sufficient for MVP/demo

**Future Consideration**: Implement proper migrations for production

---

### 2.6 Automated Testing
**What**: Unit tests, integration tests, E2E tests
**Why Out of Scope**:
- Time constraints for interview
- Focus on features first
- Manual testing sufficient for MVP

**Future Consideration**: Comprehensive test suite

---

### 2.7 CI/CD Pipeline
**What**: Automated build, test, and deployment
**Why Out of Scope**:
- Infrastructure setup
- Not required for interview
- Manual deployment sufficient

**Future Consideration**: Production deployment requirement

---

### 2.8 Monitoring and Observability
**What**: Application Insights, logging aggregation, metrics
**Why Out of Scope**:
- Additional services
- Not essential for MVP
- Basic logging sufficient

**Future Consideration**: Production monitoring

---

### 2.9 Health Checks
**What**: Health check endpoints for monitoring
**Why Out of Scope**:
- Not essential for MVP
- Can be added easily

**Future Consideration**: Production requirement

---

### 2.10 Load Balancing
**What**: Multiple API instances behind load balancer
**Why Out of Scope**:
- Infrastructure complexity
- Not needed for MVP scale
- Single instance sufficient

**Future Consideration**: Horizontal scaling

---

## 3. Security Features Out of Scope

### 3.1 Two-Factor Authentication (2FA)
**What**: SMS or authenticator app 2FA
**Why Out of Scope**:
- Additional service integration
- Complex implementation
- Not essential for MVP
- Current: Password-only authentication

**Future Consideration**: Security enhancement

---

### 3.2 OAuth/SSO Integration
**What**: Login with Google, Microsoft, etc.
**Why Out of Scope**:
- OAuth flow complexity
- Provider-specific implementations
- Not essential for MVP

**Future Consideration**: Enterprise feature

---

### 3.3 Password Complexity Requirements
**What**: Enforced password strength rules
**Why Out of Scope**:
- Basic validation sufficient for MVP
- Can be added easily

**Future Consideration**: Security best practice

---

### 3.4 Account Lockout
**What**: Lock account after failed login attempts
**Why Out of Scope**:
- Additional logic
- Lockout state management
- Not essential for MVP

**Future Consideration**: Security enhancement

---

### 3.5 IP Whitelisting
**What**: Restrict access by IP address
**Why Out of Scope**:
- Enterprise feature
- Not needed for MVP

**Future Consideration**: Enterprise security feature

---

## 4. User Management Features Out of Scope

### 4.1 User Profiles
**What**: User profile pages with avatars, preferences
**Why Out of Scope**:
- Additional UI
- File upload for avatars
- Not essential for MVP

**Future Consideration**: User experience enhancement

---

### 4.2 Password Reset Flow
**What**: "Forgot password" email flow
**Why Out of Scope**:
- Email service required
- Token generation and validation
- Not essential for MVP demo

**Future Consideration**: Essential for production

---

### 4.3 Email Verification
**What**: Verify email addresses on registration
**Why Out of Scope**:
- Email service required
- Verification token system
- Not essential for MVP

**Future Consideration**: Production requirement

---

### 4.4 User Invitations
**What**: Invite users to organization via email
**Why Out of Scope**:
- Email service required
- Invitation token system
- Not essential for MVP

**Future Consideration**: User onboarding feature

---

## 5. Organization Features Out of Scope

### 5.1 Organization Settings
**What**: Organization-level settings and configuration
**Why Out of Scope**:
- Additional UI and data model
- Not essential for MVP
- Current: Basic organization model

**Future Consideration**: Admin features

---

### 5.2 Organization Billing
**What**: Subscription, billing, payment processing
**Why Out of Scope**:
- Payment processor integration
- Subscription management
- Not relevant for interview project

**Future Consideration**: Commercial feature

---

## 6. Data Features Out of Scope

### 6.1 Data Backup and Restore
**What**: Automated backups, point-in-time recovery
**Why Out of Scope**:
- Infrastructure setup
- Not essential for MVP
- SQLite file can be backed up manually

**Future Consideration**: Production requirement

---

### 6.2 Data Archiving
**What**: Archive old completed tasks
**Why Out of Scope**:
- Additional logic
- Not essential for MVP

**Future Consideration**: Data management feature

---

### 6.3 Data Retention Policies
**What**: Automatic deletion of old data
**Why Out of Scope**:
- Policy configuration
- Background jobs
- Not essential for MVP

**Future Consideration**: Compliance feature

---

## 7. Integration Features Out of Scope

### 7.1 Webhooks
**What**: Outgoing webhooks for task events
**Why Out of Scope**:
- Additional infrastructure
- Event system
- Not essential for MVP

**Future Consideration**: Integration capability

---

### 7.2 REST API (Dual API Support)
**What**: Maintain both REST and GraphQL APIs
**Why Out of Scope**:
- Double maintenance
- REST is sufficient for MVP
- GraphQL will be added later as enhancement

**Current State**: REST API only
**Future Consideration**: GraphQL will be added as Phase 2, may maintain both APIs or migrate fully

---

### 7.3 Third-party Integrations
**What**: Slack, Teams, Zapier, etc.
**Why Out of Scope**:
- Provider-specific implementations
- Not relevant for interview

**Future Consideration**: Ecosystem expansion

---

## Summary

### In Scope (MVP)
- ✅ User authentication (JWT) - ✅ Implemented
- ✅ Role-based access control (Admin, User, Viewer) - ✅ Implemented
- ✅ Multi-tenant organizations - ✅ Implemented
- ✅ Todo CRUD operations - ✅ Implemented
- ✅ Configurable lifecycle states - ✅ Implemented
- ✅ Task assignment - ✅ Implemented
- ✅ Task priorities and due dates - ✅ Implemented
- ✅ Task filtering, sorting, search - ✅ Implemented
- ✅ Basic statistics - ✅ Implemented
- ✅ REST API - ✅ Implemented
- ✅ Soft deletion - ✅ Implemented
- ✅ Audit trail - ✅ Implemented
- ✅ Task detail view - ✅ Implemented
- ✅ Organization settings - ✅ Implemented
- ✅ Dark mode - ✅ Implemented
- ✅ Internationalization - ✅ Implemented
- ✅ User preferences - ✅ Implemented
- ✅ Routing - ✅ Implemented
- ✅ Projects (grouping tasks) - ✅ Implemented
- ✅ Subtasks (parent-child relationships) - ✅ Implemented
- ✅ UI Validation - ✅ Implemented (real-time form validation with visual feedback)
- ⏸️ GraphQL API - Deferred to Phase 2

**Note on MVP Flexibility**: The MVP implementation of Projects and Subtasks provides a solid foundation for task organization. While we could add more advanced features (e.g., nested project hierarchies, complex subtask dependencies, project templates), the current MVP scope balances functionality with implementation complexity. This provides a great starting point that can be extended based on user feedback and needs.

### Out of Scope (Future)
- ❌ Task dependencies (blocking tasks, dependency chains)
- ❌ File attachments
- ❌ Rich text editing
- ❌ Comments/notes
- ❌ Real-time updates
- ❌ Email notifications
- ❌ Mobile apps
- ❌ Advanced analytics
- ❌ Automated testing
- ❌ CI/CD pipeline
- ❌ 2FA/OAuth
- ❌ Many other features listed above

---

## Rationale for Out of Scope Items

1. **Time Constraints**: Interview project has limited time
2. **MVP Focus**: Focus on core functionality first
3. **Complexity**: Some features add significant complexity
4. **Dependencies**: Some features require external services
5. **Interview Scope**: Demonstrate core skills, not every possible feature

---

## MVP Flexibility Note

The MVP implementation of **Projects** and **Subtasks** provides a solid foundation for task organization. While we could add more advanced features (e.g., nested project hierarchies, complex subtask dependencies, project templates, multi-level subtask nesting), the current MVP scope balances functionality with implementation complexity. This provides a great starting point that can be extended based on user feedback and needs. The architecture is designed to accommodate future enhancements without major rewrites.

---

## Future Roadmap

Features marked as "Future Consideration" can be prioritized based on:
- User feedback
- Business requirements
- Technical priorities
- Resource availability

The architecture is designed to accommodate these features without major rewrites.

