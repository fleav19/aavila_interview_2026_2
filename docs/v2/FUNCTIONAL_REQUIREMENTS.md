# Functional Requirements Document

## Overview
This document defines the functional requirements for the Ezra TODO application - what the system must do from a user and business perspective.

---

## 1. User Authentication and Authorization

### 1.1 User Registration
**Requirement ID**: FR-001  
**Priority**: High  
**Description**: Users must be able to create new accounts.

**Functional Requirements**:
- User can register with email, password, first name, and last name
- Email must be unique across the system
- Password must be hashed before storage
- User is automatically assigned to an organization (default or specified)
- User is assigned a default role (typically "User")
- Registration creates a new User record in the database

**Inputs**:
- Email (required, valid email format, unique)
- Password (required, min length TBD)
- First Name (required, max 100 chars)
- Last Name (required, max 100 chars)
- Organization ID (optional, defaults to creating user's organization)

**Outputs**:
- Success: User record created, JWT token returned
- Error: Validation errors or duplicate email error

**Business Rules**:
- Email must be unique
- Password must meet minimum complexity (TBD)
- User must belong to exactly one organization

---

### 1.2 User Login
**Requirement ID**: FR-002  
**Priority**: High  
**Description**: Users must be able to authenticate and access the system.

**Functional Requirements**:
- User can login with email and password
- System validates credentials
- On success, returns JWT access token
- Token includes user ID, email, role, and organization ID
- Token has expiration time (15-30 minutes)
- System tracks last login timestamp

**Inputs**:
- Email (required)
- Password (required)

**Outputs**:
- Success: JWT token and user information
- Error: Invalid credentials error

**Business Rules**:
- Invalid credentials return generic error (security)
- Token expires after configured time
- Last login timestamp is updated on successful login

---

### 1.3 User Logout
**Requirement ID**: FR-003  
**Priority**: Medium  
**Description**: Users must be able to log out of the system.

**Functional Requirements**:
- User can logout, invalidating their current session
- Frontend removes token from storage
- Optional: Token blacklist (future enhancement)

**Inputs**:
- JWT token (from request header)

**Outputs**:
- Success: Logout confirmation
- Error: If token invalid

**Business Rules**:
- Logout is primarily client-side (token removal)
- Server-side blacklist optional for enhanced security

---

### 1.4 Role-Based Access Control
**Requirement ID**: FR-004  
**Priority**: High  
**Description**: System must enforce permissions based on user roles.

**Functional Requirements**:
- Three roles: Admin, User, Viewer
- Admin: Full access to all features
- User: Create/read/update own tasks, read organization tasks
- Viewer: Read-only access to tasks
- Permissions enforced at API/GraphQL level
- Frontend UI reflects user permissions

**Roles and Permissions**:

| Feature | Admin | User | Viewer |
|---------|-------|------|--------|
| Create Task | ✅ | ✅ | ❌ |
| Read Own Tasks | ✅ | ✅ | ✅ |
| Read Org Tasks | ✅ | ✅ | ✅ |
| Update Own Tasks | ✅ | ✅ | ❌ |
| Update Any Task | ✅ | ❌ | ❌ |
| Delete Tasks | ✅ | Own only | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Manage States | ✅ | ❌ | ❌ |
| Manage Organization | ✅ | ❌ | ❌ |

**Business Rules**:
- Users can only access data from their organization
- Users cannot access other organizations' data
- Role assignments are managed by Admins

---

## 2. Organization Management

### 2.1 Organization Creation
**Requirement ID**: FR-005  
**Priority**: High  
**Description**: System must support multiple organizations (multi-tenancy).

**Functional Requirements**:
- Organizations can be created (typically by system or first user)
- Each organization has a unique name and slug
- Organization gets default todo states seeded
- Users belong to exactly one organization

**Inputs**:
- Name (required, max 200 chars)
- Slug (required, unique, URL-friendly)

**Outputs**:
- Success: Organization created with default states
- Error: Validation errors or duplicate slug

**Business Rules**:
- Slug must be unique
- Default states are created automatically
- First user in organization becomes Admin

---

## 3. Todo State Management

### 3.1 View Todo States
**Requirement ID**: FR-006  
**Priority**: High  
**Description**: Users must be able to view available todo states for their organization.

**Functional Requirements**:
- Users can query todo states for their organization
- States are returned ordered by `Order` field
- States include name, display name, color, icon
- Only non-deleted states are returned

**Inputs**:
- Organization ID (from user context)

**Outputs**:
- List of todo states for organization

**Business Rules**:
- Users only see states from their organization
- Deleted states are excluded

---

### 3.2 Create Todo State (Admin Only)
**Requirement ID**: FR-007  
**Priority**: Medium  
**Description**: Admins must be able to create new todo states for their organization.

**Functional Requirements**:
- Admin can create new todo state
- State name must be unique within organization
- State gets assigned an order value
- State can be set as default

**Inputs**:
- Name (required, max 50 chars, unique per org)
- DisplayName (required, max 100 chars)
- Order (required, integer)
- IsDefault (optional, boolean)
- Color (optional, hex color)
- Icon (optional, icon identifier)

**Outputs**:
- Success: New todo state created
- Error: Validation errors or duplicate name

**Business Rules**:
- Only one default state per organization
- Name must be unique within organization
- Admin only

---

### 3.3 Update Todo State (Admin Only)
**Requirement ID**: FR-008  
**Priority**: Medium  
**Description**: Admins must be able to update existing todo states.

**Functional Requirements**:
- Admin can update state properties
- Cannot change state if it's in use by tasks (or handle gracefully)
- Can change default state (only one default)

**Inputs**:
- State ID
- Updated properties (name, display name, order, color, icon, isDefault)

**Outputs**:
- Success: State updated
- Error: Validation errors or constraint violations

**Business Rules**:
- Only one default state per organization
- Name must remain unique within organization
- Admin only

---

### 3.4 Delete Todo State (Admin Only)
**Requirement ID**: FR-009  
**Priority**: Medium  
**Description**: Admins must be able to delete (soft delete) todo states.

**Functional Requirements**:
- Admin can soft delete a state
- State is marked as deleted, not removed
- Tasks using deleted state need handling (migration or error)

**Inputs**:
- State ID

**Outputs**:
- Success: State soft deleted
- Error: If state is in use by tasks

**Business Rules**:
- Cannot delete state if tasks are using it (or migrate tasks first)
- Soft delete preserves data
- Admin only

---

## 4. Todo Task Management

### 4.1 Create Task
**Requirement ID**: FR-010  
**Priority**: High  
**Description**: Users must be able to create new todo tasks.

**Functional Requirements**:
- User can create task with title, description, due date, priority, state, assignee
- Task is assigned to user's organization
- Task creator is set to current user
- Task gets default state if not specified
- Task can be assigned to another user (optional)

**Inputs**:
- Title (required, max 200 chars)
- Description (optional, max 1000 chars)
- DueDate (optional, valid date)
- Priority (required, enum: Low, Medium, High)
- TodoStateId (optional, defaults to organization's default state)
- AssignedToId (optional, user ID)

**Outputs**:
- Success: Task created with ID
- Error: Validation errors

**Business Rules**:
- Title is required
- Task belongs to user's organization
- Assigned user must be in same organization
- Default state used if not specified

---

### 4.2 View Tasks
**Requirement ID**: FR-011  
**Priority**: High  
**Description**: Users must be able to view todo tasks.

**Functional Requirements**:
- User can query tasks with filtering, sorting, searching
- Users see tasks from their organization only
- Users can filter by state, priority, assignee, creator
- Users can sort by title, priority, due date, created date
- Users can search by title and description
- Soft-deleted tasks are excluded by default

**Inputs**:
- Filter parameters (state, priority, assignee, creator, search term)
- Sort parameters (field, direction)
- Pagination (optional, future)

**Outputs**:
- List of tasks matching criteria
- Task details include: title, description, state, priority, due date, creator, assignee, timestamps

**Business Rules**:
- Users only see tasks from their organization
- Soft-deleted tasks excluded by default
- Viewers can only read
- Users can read own tasks and organization tasks

---

### 4.3 View Single Task
**Requirement ID**: FR-012  
**Priority**: High  
**Description**: Users must be able to view details of a single task.

**Functional Requirements**:
- User can retrieve task by ID
- Returns full task details
- Validates user has access (organization match)

**Inputs**:
- Task ID

**Outputs**:
- Task details or 404 if not found/unauthorized

**Business Rules**:
- User must be in same organization as task
- Soft-deleted tasks return 404

---

### 4.4 Update Task
**Requirement ID**: FR-013  
**Priority**: High  
**Description**: Users must be able to update existing tasks.

**Functional Requirements**:
- User can update task properties
- Users can update own tasks
- Admins can update any task in organization
- UpdatedAt and UpdatedById are tracked
- Cannot change organization

**Inputs**:
- Task ID
- Updated properties (title, description, state, priority, due date, assignee)

**Outputs**:
- Success: Updated task
- Error: Validation errors, not found, unauthorized

**Business Rules**:
- Users can only update own tasks (unless Admin)
- Admins can update any task in organization
- Organization cannot be changed
- UpdatedAt timestamp is set
- UpdatedById is set to current user

---

### 4.5 Delete Task
**Requirement ID**: FR-014  
**Priority**: High  
**Description**: Users must be able to delete (soft delete) tasks.

**Functional Requirements**:
- User can soft delete task
- Users can delete own tasks
- Admins can delete any task in organization
- Task is marked as deleted, not removed
- DeletedAt and DeletedById are tracked

**Inputs**:
- Task ID

**Outputs**:
- Success: Task soft deleted
- Error: Not found, unauthorized

**Business Rules**:
- Users can only delete own tasks (unless Admin)
- Soft delete preserves data
- Deleted tasks excluded from queries by default

---

### 4.6 Change Task State
**Requirement ID**: FR-015  
**Priority**: High  
**Description**: Users must be able to change task lifecycle state.

**Functional Requirements**:
- User can change task to different state
- State must belong to task's organization
- CompletedAt is set when state is "Done"
- CompletedAt is cleared when state changes from "Done"

**Inputs**:
- Task ID
- New TodoStateId

**Outputs**:
- Success: Task state updated
- Error: Invalid state, not found, unauthorized

**Business Rules**:
- State must be from task's organization
- CompletedAt logic based on state name or flag
- Users can change state of own tasks (unless Admin)

---

## 5. Task Filtering and Search

### 5.1 Filter Tasks
**Requirement ID**: FR-016  
**Priority**: Medium  
**Description**: Users must be able to filter tasks by various criteria.

**Functional Requirements**:
- Filter by todo state (one or multiple)
- Filter by priority (one or multiple)
- Filter by assignee (self, others, unassigned)
- Filter by creator (self, others)
- Filter by due date (overdue, today, this week, future)
- Combine multiple filters

**Inputs**:
- Filter criteria (state, priority, assignee, creator, due date range)

**Outputs**:
- Filtered list of tasks

**Business Rules**:
- Filters only apply to user's organization
- Soft-deleted tasks excluded

---

### 5.2 Search Tasks
**Requirement ID**: FR-017  
**Priority**: Medium  
**Description**: Users must be able to search tasks by text.

**Functional Requirements**:
- Search in task title
- Search in task description
- Case-insensitive search
- Partial match support

**Inputs**:
- Search term (string)

**Outputs**:
- List of tasks matching search term

**Business Rules**:
- Search only within user's organization
- Soft-deleted tasks excluded

---

### 5.3 Sort Tasks
**Requirement ID**: FR-018  
**Priority**: Medium  
**Description**: Users must be able to sort tasks.

**Functional Requirements**:
- Sort by title (A-Z, Z-A)
- Sort by priority (High to Low, Low to High)
- Sort by due date (earliest first, latest first)
- Sort by created date (newest first, oldest first)
- Sort by updated date (newest first, oldest first)

**Inputs**:
- Sort field
- Sort direction (ascending, descending)

**Outputs**:
- Sorted list of tasks

**Business Rules**:
- Sort only applies to user's organization

---

## 6. Task Statistics

### 6.1 View Task Statistics
**Requirement ID**: FR-019  
**Priority**: Low  
**Description**: Users must be able to view task statistics.

**Functional Requirements**:
- Total tasks count
- Tasks by state (count per state)
- Tasks by priority (count per priority)
- Overdue tasks count
- Tasks assigned to user count

**Inputs**:
- Organization context (from user)

**Outputs**:
- Statistics object with various counts

**Business Rules**:
- Statistics only for user's organization
- Soft-deleted tasks excluded
- Real-time calculation (no caching initially)

---

## 7. Data Management

### 7.1 Soft Deletion
**Requirement ID**: FR-020  
**Priority**: High  
**Description**: System must support soft deletion for data recovery.

**Functional Requirements**:
- All major entities support soft deletion
- Deleted records are marked, not removed
- Deleted records excluded from queries by default
- DeletedAt and DeletedById tracked

**Entities**:
- Tasks
- Users
- Organizations
- TodoStates

**Business Rules**:
- Soft deletion preserves data
- Deleted records can be recovered (future feature)
- Queries exclude deleted by default

---

### 7.2 Audit Trail
**Requirement ID**: FR-021  
**Priority**: Medium  
**Description**: System must track who created and updated records.

**Functional Requirements**:
- CreatedAt timestamp on all entities
- UpdatedAt timestamp on all entities
- CreatedById on tasks
- UpdatedById on tasks
- DeletedById on all entities

**Business Rules**:
- Timestamps are automatically set
- User IDs are set from current user context
- Audit trail is read-only (cannot be modified)

---

## 8. User Interface Requirements

### 8.1 Responsive Design
**Requirement ID**: FR-022  
**Priority**: High  
**Description**: Application must work on desktop, tablet, and mobile.

**Functional Requirements**:
- Responsive layout using Tailwind CSS
- Mobile-friendly navigation
- Touch-friendly controls
- Readable text on all screen sizes

---

### 8.2 Loading States
**Requirement ID**: FR-023  
**Priority**: Medium  
**Description**: Application must show loading indicators during operations.

**Functional Requirements**:
- Loading spinner during API calls
- Disable forms during submission
- Visual feedback for all async operations

---

### 8.3 Error Handling
**Requirement ID**: FR-024  
**Priority**: High  
**Description**: Application must handle and display errors gracefully.

**Functional Requirements**:
- Display validation errors
- Display API errors
- User-friendly error messages
- Network error handling

---

## 9. Security Requirements

### 9.1 Password Security
**Requirement ID**: FR-025  
**Priority**: High  
**Description**: Passwords must be securely stored.

**Functional Requirements**:
- Passwords hashed with bcrypt
- Passwords never stored in plain text
- Passwords never returned in API responses

**Business Rules**:
- Minimum password length (TBD)
- Password complexity (TBD, future)

---

### 9.2 Data Isolation
**Requirement ID**: FR-026  
**Priority**: High  
**Description**: Users must only access data from their organization.

**Functional Requirements**:
- All queries filtered by organization
- Organization ID from user context
- Cannot access other organizations' data
- Enforced at API level

**Business Rules**:
- Organization isolation is mandatory
- No cross-organization data access

---

### 9.3 Authorization Enforcement
**Requirement ID**: FR-027  
**Priority**: High  
**Description**: Permissions must be enforced at API level.

**Functional Requirements**:
- Role checks in REST API controllers (GraphQL resolvers when GraphQL is implemented)
- Authorization middleware
- Unauthorized requests return 403
- Frontend reflects permissions but doesn't enforce

**Business Rules**:
- Server-side authorization is authoritative
- Frontend permissions are UX only

---

## 10. API Requirements

### 10.1 REST API (Current)
**Requirement ID**: FR-028  
**Priority**: High  
**Description**: System must provide REST API.

**Functional Requirements**:
- RESTful endpoints at `/api/tasks`
- JSON responses
- Standard HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Swagger/OpenAPI documentation
- Error handling and validation

**Endpoints**:
- `GET /api/tasks` - List tasks with filtering/sorting
- `GET /api/tasks/{id}` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/status` - Toggle task status
- `GET /api/tasks/stats` - Get task statistics

**Status**: ✅ Implemented

---

### 10.2 GraphQL API (Deferred)
**Requirement ID**: FR-028B  
**Priority**: Low (Future Enhancement)  
**Description**: System will provide GraphQL API as a future enhancement.

**Status**: ⏸️ **DEFERRED** - Will be implemented after core features are complete

**Planned Functional Requirements** (when implemented):
- GraphQL endpoint at `/graphql`
- Queries for reading data
- Mutations for modifying data
- Schema introspection enabled
- Error handling and validation

**Planned Queries**:
- `todos` - List tasks with filtering/sorting
- `todo` - Get single task
- `todoStates` - List states for organization
- `me` - Get current user

**Planned Mutations**:
- `createTodo` - Create task
- `updateTodo` - Update task
- `deleteTodo` - Delete task
- `createTodoState` - Create state (Admin)
- `updateTodoState` - Update state (Admin)
- `deleteTodoState` - Delete state (Admin)
- `login` - Authenticate user
- `register` - Register new user

---

### 10.3 API Documentation
**Requirement ID**: FR-029  
**Priority**: Medium  
**Description**: API must be self-documenting.

**Functional Requirements**:
- Swagger/OpenAPI documentation for REST API (✅ Current)
- GraphQL schema introspection (when GraphQL is implemented)
- Type definitions
- Field descriptions
- Query examples

---

## Priority Summary

### High Priority (MVP Critical)
- FR-001: User Registration
- FR-002: User Login
- FR-004: Role-Based Access Control
- FR-005: Organization Management
- FR-006: View Todo States
- FR-010: Create Task
- FR-011: View Tasks
- FR-012: View Single Task
- FR-013: Update Task
- FR-014: Delete Task
- FR-015: Change Task State
- FR-020: Soft Deletion
- FR-022: Responsive Design
- FR-024: Error Handling
- FR-025: Password Security
- FR-026: Data Isolation
- FR-027: Authorization Enforcement
- FR-028: REST API (GraphQL deferred - FR-028B)

### Medium Priority (Important)
- FR-003: User Logout
- FR-007: Create Todo State
- FR-008: Update Todo State
- FR-009: Delete Todo State
- FR-016: Filter Tasks
- FR-017: Search Tasks
- FR-018: Sort Tasks
- FR-021: Audit Trail
- FR-023: Loading States
- FR-029: API Documentation

### Low Priority (Nice to Have)
- FR-019: View Task Statistics

### Deferred (Future Enhancements)
- FR-028B: GraphQL API

---

## Acceptance Criteria

Each requirement must meet:
1. **Functional**: Does what it's supposed to do
2. **Testable**: Can be verified through testing
3. **Complete**: Fully specified with inputs/outputs
4. **Consistent**: Doesn't conflict with other requirements
5. **Traceable**: Can be traced to business need

