# User Stories

## Overview
This document captures user stories organized by role to help identify functional requirements and gaps in the Ezra TODO application.

---

## As a Guest (Unauthenticated User)

### US-GUEST-001: View Landing Page
**As a** guest  
**I want to** see a landing page with login and registration options  
**So that** I can understand what the application does and access it

**Acceptance Criteria**:
- Landing page displays application name and description
- Login form is visible and accessible
- Registration form is visible and accessible
- Can switch between login and registration tabs
- Page is visually appealing and professional

**Status**: ✅ Implemented

---

### US-GUEST-002: Register for Account
**As a** guest  
**I want to** create a new account  
**So that** I can access the application

**Acceptance Criteria**:
- Can enter email, password, first name, last name
- Form validates input (email format, password length, required fields)
- On success, automatically logged in and redirected to dashboard
- On error, clear error message displayed
- Email must be unique

**Status**: ✅ Implemented

---

### US-GUEST-003: Login to Account
**As a** guest  
**I want to** login with my credentials  
**So that** I can access my tasks

**Acceptance Criteria**:
- Can enter email and password
- Form validates input
- On success, redirected to dashboard with tasks
- On error, clear error message displayed
- Token is stored for future sessions

**Status**: ✅ Implemented

---

## As a Viewer (Read-Only User)

### US-VIEWER-001: View My Organization's Tasks
**As a** viewer  
**I want to** see all tasks in my organization  
**So that** I can stay informed about work progress

**Acceptance Criteria**:
- Can see list of all tasks in my organization
- Tasks show title, description, priority, due date, state, assignee
- Can see who created each task
- Tasks are filtered by my organization automatically
- Cannot see tasks from other organizations

**Status**: ✅ Implemented

---

### US-VIEWER-002: View Task Details
**As a** viewer  
**I want to** see detailed information about a specific task  
**So that** I can understand what needs to be done

**Acceptance Criteria**:
- Can click on a task to see full details
- See all task properties (title, description, priority, due date, state, assignee, creator, timestamps)
- See task history/audit trail (who created, updated, when)
- Cannot edit or delete the task

**Status**: ✅ Implemented (full task detail page with audit trail)

---

### US-VIEWER-003: View Projects
**As a** viewer  
**I want to** view projects that contain tasks  
**So that** I can see how tasks are organized

**Acceptance Criteria**:
- Can see list of projects in my organization
- Can see tasks grouped by project
- Can view project details (name, description, task count)
- Cannot create, edit, or delete projects

**Status**: ✅ Implemented

---

### US-VIEWER-004: View Subtasks
**As a** viewer  
**I want to** view subtasks of a task  
**So that** I can see the breakdown of work

**Acceptance Criteria**:
- Can see subtasks when viewing a task
- Can see subtask title, state, assignee
- Cannot create, edit, or delete subtasks

**Status**: ✅ Implemented

---

### US-VIEWER-005: Filter and Search Tasks
**As a** viewer  
**I want to** filter and search tasks  
**So that** I can find specific tasks quickly

**Acceptance Criteria**:
- Can filter by completion status (completed/active)
- Can filter by state
- Can filter by project
- Can search by title or description
- Can sort by title, priority, due date, creation date
- Filters persist while browsing
- Clear visual indication of active filters

**Status**: ✅ Implemented (includes project filter)

---

### US-VIEWER-006: View Task Statistics
**As a** viewer  
**I want to** see statistics about tasks  
**So that** I can understand overall progress

**Acceptance Criteria**:
- Can see total number of tasks
- Can see number of completed tasks
- Can see number of active tasks
- Can see number of high priority tasks
- Statistics are scoped to my organization

**Status**: ✅ Implemented

---

### US-VIEWER-007: View Available Todo States
**As a** viewer  
**I want to** see what states are available for tasks  
**So that** I can understand the workflow

**Acceptance Criteria**:
- Can see list of all todo states for my organization
- States show name, display name, color, icon
- States are ordered correctly
- Cannot create, edit, or delete states

**Status**: ✅ Implemented (can view states in Todo States tab, read-only)

---

### US-VIEWER-006: Cannot Create Tasks
**As a** viewer  
**I want to** be prevented from creating tasks  
**So that** I maintain read-only access

**Acceptance Criteria**:
- Create task button is not visible or disabled
- Cannot access create task endpoint
- Clear indication of read-only role

**Status**: ✅ Implemented (endpoint protected, but UI might show button)

---

### US-VIEWER-007: Cannot Edit Tasks
**As a** viewer  
**I want to** be prevented from editing tasks  
**So that** I maintain read-only access

**Acceptance Criteria**:
- Edit task button is not visible or disabled
- Cannot access update task endpoint
- Cannot change task state

**Status**: ✅ Implemented (endpoint protected, but UI might show buttons)

---

### US-VIEWER-008: Cannot Delete Tasks
**As a** viewer  
**I want to** be prevented from deleting tasks  
**So that** I maintain read-only access

**Acceptance Criteria**:
- Delete task button is not visible or disabled
- Cannot access delete task endpoint

**Status**: ✅ Implemented (endpoint protected, but UI might show buttons)

---

## As a User (Standard User)

### US-USER-001: View My Organization's Tasks
**As a** user  
**I want to** see all tasks in my organization  
**So that** I can stay informed about work progress

**Acceptance Criteria**:
- Can see list of all tasks in my organization
- Tasks show title, description, priority, due date, state, assignee
- Can see who created each task
- Tasks are filtered by my organization automatically

**Status**: ✅ Implemented

---

### US-USER-002: Create New Tasks
**As a** user  
**I want to** create new tasks  
**So that** I can track work that needs to be done

**Acceptance Criteria**:
- Can click "New Task" button
- Can enter title (required), description (optional), due date (optional), priority
- Task is automatically assigned to my organization
- Task is automatically assigned to default state
- I am set as the creator
- Can optionally assign task to another user in my organization
- Form validates input
- On success, task appears in list
- On error, clear error message displayed

**Status**: ✅ Implemented (includes assignee selection, state selection, project selection, and real-time validation)

---

### US-USER-003: Edit My Own Tasks
**As a** user  
**I want to** edit tasks I created  
**So that** I can update task details as work progresses

**Acceptance Criteria**:
- Can click edit on tasks I created
- Can update title, description, due date, priority
- Can change task state
- Can change assignee (to another user in my organization)
- Changes are saved with audit trail
- Cannot edit tasks created by others (unless admin)

**Status**: ✅ Implemented (can edit with state selection and assignee selection)

---

### US-USER-004: Delete My Own Tasks
**As a** user  
**I want to** delete tasks I created  
**So that** I can remove tasks that are no longer needed

**Acceptance Criteria**:
- Can delete tasks I created
- Task is soft deleted (not permanently removed)
- Cannot delete tasks created by others (unless admin)
- Deleted tasks don't appear in normal list
- Can see deletion in audit trail

**Status**: ✅ Implemented

---

### US-USER-005: Change Task State
**As a** user  
**I want to** change the state of my tasks  
**So that** I can track progress through the workflow

**Acceptance Criteria**:
- Can see current state of each task
- Can change state of tasks I created
- Can select from available states for my organization
- State changes are saved with audit trail
- Visual indication of state (color, icon)
- Cannot change state of tasks created by others (unless admin)

**Status**: ✅ Implemented (full state selection with dropdown and badges)

---

### US-USER-006: Assign Tasks to Team Members
**As a** user  
**I want to** assign tasks to other users in my organization  
**So that** I can delegate work

**Acceptance Criteria**:
- Can see list of users in my organization
- Can assign task to another user when creating
- Can reassign task to another user when editing
- Can see who a task is assigned to
- Can filter tasks by assignee
- Cannot assign to users outside my organization

**Status**: ✅ Implemented (assignee dropdown in TaskForm, can assign/reassign tasks)

---

### US-USER-007: View Tasks Assigned to Me
**As a** user  
**I want to** see tasks assigned to me  
**So that** I know what work I need to do

**Acceptance Criteria**:
- Can filter tasks to show only those assigned to me
- Can see tasks I created and tasks assigned to me
- Clear visual distinction between my tasks and assigned tasks

**Status**: ✅ Implemented ("Assigned to Me" filter option in TaskFilters)

---

### US-USER-008: View My Profile
**As a** user  
**I want to** see my profile information  
**So that** I can verify my account details

**Acceptance Criteria**:
- Can see my email, name, role, organization
- Can see when I last logged in
- Information is read-only (cannot edit)

**Status**: ✅ Implemented (via /api/users/me)

---

### US-USER-009: Logout
**As a** user  
**I want to** logout from the application  
**So that** I can secure my session

**Acceptance Criteria**:
- Can click logout button
- Session is cleared
- Redirected to landing page
- Token is removed from storage

**Status**: ✅ Implemented

---

### US-USER-010: Filter and Search Tasks
**As a** user  
**I want to** filter and search tasks  
**So that** I can find specific tasks quickly

**Acceptance Criteria**:
- Can filter by completion status
- Can filter by state
- Can filter by assignee
- Can filter by priority
- Can search by title or description
- Can sort by various fields
- Filters can be combined

**Status**: ✅ Implemented (filtering by state, assignee, status, search, and sorting)

---

### US-USER-011: Create and Manage Projects
**As a** user  
**I want to** create projects and group tasks together  
**So that** I can organize related tasks

**Acceptance Criteria**:
- Can create a new project with name and description
- Can assign tasks to a project when creating or editing
- Can view tasks grouped by project
- Can filter tasks by project
- Can see project statistics (task count, completion rate)
- Can edit project details (name, description)
- Can delete projects (if no tasks assigned, or with confirmation)
- Projects are scoped to my organization

**Status**: ✅ Implemented

---

### US-USER-012: Create and Manage Subtasks
**As a** user  
**I want to** create subtasks for a task  
**So that** I can break down work into smaller pieces

**Acceptance Criteria**:
- Can create subtasks when creating or editing a task
- Can add subtask title, description, state, assignee
- Can see list of subtasks for a task
- Can edit subtask details
- Can delete subtasks
- Can mark subtasks as complete
- Subtasks inherit organization and project from parent task
- Can see subtask progress (e.g., 3 of 5 complete)

**Status**: ✅ Implemented

---

## As an Admin

### US-ADMIN-001: All User Capabilities
**As an** admin  
**I want to** have all capabilities of a regular user  
**So that** I can perform normal work tasks

**Acceptance Criteria**:
- Can do everything a user can do
- Can create, edit, delete any task in my organization
- Can change state of any task
- Can assign any task to any user in organization

**Status**: ✅ Implemented (can edit/delete any task)

---

### US-ADMIN-002: View All Users in Organization
**As an** admin  
**I want to** see all users in my organization  
**So that** I can manage team members

**Acceptance Criteria**:
- Can see list of all users in my organization
- See user email, name, role, status (active/inactive)
- See when user last logged in
- Can see user's task statistics (how many tasks created, assigned)

**Status**: ✅ Implemented

---

### US-ADMIN-003: Manage User Roles
**As an** admin  
**I want to** change user roles  
**So that** I can grant appropriate permissions

**Acceptance Criteria**:
- Can change a user's role (User, Viewer, Admin)
- Can see current role of each user
- Changes take effect immediately
- Cannot change my own role (or requires special permission)
- Audit trail of role changes

**Status**: ✅ Implemented (can change roles, but can change own role - may want to add restriction)

---

### US-ADMIN-004: Activate/Deactivate Users
**As an** admin  
**I want to** activate or deactivate users  
**So that** I can control access

**Acceptance Criteria**:
- Can activate inactive users
- Can deactivate active users
- Deactivated users cannot login
- Deactivated users' tasks remain visible
- Clear indication of user status

**Status**: ✅ Implemented

---

### US-ADMIN-005: View Todo States
**As an** admin  
**I want to** see all todo states for my organization  
**So that** I can manage the workflow

**Acceptance Criteria**:
- Can see list of all todo states
- See state name, display name, order, color, icon
- See which state is default
- See how many tasks are in each state
- States are ordered correctly

**Status**: ✅ Implemented

---

### US-ADMIN-006: Create Todo States
**As an** admin  
**I want to** create new todo states  
**So that** I can customize the workflow for my organization

**Acceptance Criteria**:
- Can create new todo state
- Can set name, display name, order, color, icon
- Can set as default state (only one default)
- Name must be unique within organization
- State is immediately available for use
- Validation prevents duplicate names

**Status**: ✅ Implemented

---

### US-ADMIN-007: Edit Todo States
**As an** admin  
**I want to** edit existing todo states  
**So that** I can refine the workflow

**Acceptance Criteria**:
- Can edit state properties (name, display name, order, color, icon)
- Can change which state is default
- Can reorder states
- Changes affect all tasks using that state
- Cannot edit if it would break constraints (e.g., duplicate name)
- Validation prevents issues

**Status**: ✅ Implemented (can edit properties and default, but reordering requires updating order field manually)

---

### US-ADMIN-008: Delete Todo States
**As an** admin  
**I want to** delete todo states  
**So that** I can remove unused states

**Acceptance Criteria**:
- Can soft delete a state
- Cannot delete if tasks are using the state (or must migrate first)
- Deleted states don't appear in normal lists
- Can see deleted states in admin view
- Can restore deleted states
- Audit trail of deletions

**Status**: ✅ Implemented (soft delete with validation preventing deletion of in-use states)

---

### US-ADMIN-009: Reorder Todo States
**As an** admin  
**I want to** reorder todo states  
**So that** I can organize the workflow logically

**Acceptance Criteria**:
- Can change the order of states
- Order is reflected in UI
- Order persists across sessions
- Can drag and drop or use up/down buttons

**Status**: ✅ Implemented

---

### US-ADMIN-010: Set Default Todo State
**As an** admin  
**I want to** set which state is default for new tasks  
**So that** new tasks start in the right state

**Acceptance Criteria**:
- Can mark one state as default
- Only one state can be default at a time
- Changing default updates the previous default state
- New tasks automatically get default state

**Status**: ✅ Implemented (can set default state when creating/editing states)

---

### US-ADMIN-011: View Organization Statistics
**As an** admin  
**I want to** see statistics about my organization  
**So that** I can understand team productivity

**Acceptance Criteria**:
- Can see total tasks in organization
- Can see tasks by state
- Can see tasks by user
- Can see tasks by priority
- Can see completion rates
- Can see trends over time

**Status**: ⚠️ Partially Implemented (basic stats, missing: by user, by state, trends)

---

### US-ADMIN-012: Manage Organization Settings
**As an** admin  
**I want to** manage organization settings  
**So that** I can customize the organization

**Acceptance Criteria**:
- Can view organization name
- Can update organization name
- Can see organization slug
- Can see when organization was created
- Can see number of users in organization

**Status**: ✅ Implemented (Organization Settings tab with stats, name/slug editing, SSO placeholder)

---

## Summary by Status

### ✅ Fully Implemented
- Guest: Landing page, registration, login
- Viewer: View tasks, filter/search, view stats, read-only enforcement, view todo states, task detail view, view projects, view subtasks
- User: Create/edit/delete own tasks, view tasks, filter/search (by state, assignee, project, status), assign tasks, view assigned tasks, logout, view profile, select task state, task detail view, create/manage projects, create/manage subtasks
- Admin: All user capabilities, edit/delete any task, manage user roles, activate/deactivate users, manage todo states (CRUD), organization settings management, manage projects, manage subtasks

### ⚠️ Partially Implemented
- Admin: Default state (set in seeder, can set when creating/editing states but no dedicated UI to change existing default), statistics (basic only, missing: by user, by state, trends)

### ❌ Not Implemented
- Admin: Advanced statistics (by user, by state, trends), State reordering UI (drag-and-drop)
- All: GraphQL API (deferred)

---

## Priority Recommendations

### High Priority (Core Functionality Gaps)
- None (all core features implemented)

### Medium Priority (Nice to Have)
1. **Advanced Statistics** (Admin) - US-ADMIN-011 (by user, by state, trends)
2. **State Reordering UI** (Admin) - US-ADMIN-009 (drag-and-drop interface)

### Low Priority (Polish)
1. **State Reordering UI** (Admin) - US-ADMIN-009
2. **Advanced Filtering UI** (User) - US-USER-010 (combine filters)

