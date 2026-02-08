# Data Model Specification

## Overview
This document defines the complete data model for the Ezra TODO application, including existing models and planned additions for authentication, RBAC, and lifecycle state management.

---

## Existing Models (Current Implementation)

### 1. Task
**Purpose**: Core entity representing a todo task.

```csharp
public class Task
{
    public int Id { get; set; }                    // Primary key, auto-increment
    public string Title { get; set; }              // Required, max 200 chars
    public string? Description { get; set; }       // Optional, max 1000 chars
    public bool IsCompleted { get; set; }         // Completion status (to be replaced)
    public DateTime CreatedAt { get; set; }        // Creation timestamp
    public DateTime? DueDate { get; set; }        // Optional due date
    public TaskPriority Priority { get; set; }     // Priority level (enum)
    public DateTime? CompletedAt { get; set; }     // Completion timestamp (nullable)
}
```

**Database Configuration**:
- Primary Key: `Id`
- Indexes: `IsCompleted`, `CreatedAt`
- Constraints: `Title` required, max 200 chars; `Description` max 1000 chars

**Status**: ✅ Currently implemented

---

### 2. TaskPriority (Enum)
**Purpose**: Defines priority levels for tasks.

```csharp
public enum TaskPriority
{
    Low = 0,
    Medium = 1,
    High = 2
}
```

**Status**: ✅ Currently implemented

---

## Planned Models (To Be Implemented)

### 3. User
**Purpose**: Represents application users with authentication credentials.

```csharp
public class User
{
    public int Id { get; set; }                    // Primary key, auto-increment
    public string Email { get; set; }              // Required, unique, max 255 chars
    public string PasswordHash { get; set; }        // Required, hashed password
    public string FirstName { get; set; }          // Required, max 100 chars
    public string LastName { get; set; }           // Required, max 100 chars
    public int OrganizationId { get; set; }        // Foreign key to Organization
    public int RoleId { get; set; }                // Foreign key to Role
    public bool IsActive { get; set; }             // Active status flag (default: true)
    public bool IsDeleted { get; set; }             // Soft deletion flag (default: false)
    public DateTime? DeletedAt { get; set; }       // Soft deletion timestamp (nullable)
    public int? DeletedById { get; set; }          // User who deleted this record (nullable)
    public DateTime CreatedAt { get; set; }        // Account creation timestamp
    public DateTime UpdatedAt { get; set; }        // Last update timestamp
    public DateTime? LastLoginAt { get; set; }      // Last login timestamp (nullable)
    
    // Navigation properties
    public Organization Organization { get; set; } = null!;
    public Role Role { get; set; } = null!;
    public User? DeletedBy { get; set; }           // Navigation to user who deleted
    public ICollection<Task> CreatedTasks { get; set; } = new List<Task>();
    public ICollection<Task> AssignedTasks { get; set; } = new List<Task>();
}
```

**Database Configuration**:
- Primary Key: `Id`
- Unique Index: `Email`
- Indexes: `OrganizationId`, `RoleId`, `Email`
- Foreign Keys: `OrganizationId` → `Organization.Id`, `RoleId` → `Role.Id`

**Status**: 📋 Planned

---

### 4. Organization
**Purpose**: Represents a tenant/organization for multi-tenancy support.

```csharp
public class Organization
{
    public int Id { get; set; }                    // Primary key, auto-increment
    public string Name { get; set; }               // Required, max 200 chars
    public string Slug { get; set; }              // Required, unique, max 100 chars (URL-friendly)
    public bool IsActive { get; set; }             // Active status flag (default: true)
    public bool IsDeleted { get; set; }            // Soft deletion flag (default: false)
    public DateTime? DeletedAt { get; set; }       // Soft deletion timestamp (nullable)
    public int? DeletedById { get; set; }          // User who deleted this record (nullable)
    public DateTime CreatedAt { get; set; }        // Creation timestamp
    public DateTime UpdatedAt { get; set; }        // Last update timestamp
    
    // Navigation properties
    public User? DeletedBy { get; set; }           // Navigation to user who deleted
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<TodoState> TodoStates { get; set; } = new List<TodoState>();
    public ICollection<Task> Tasks { get; set; } = new List<Task>();
}
```

**Database Configuration**:
- Primary Key: `Id`
- Unique Index: `Slug`
- Index: `Name`

**Status**: 📋 Planned

---

### 5. Role
**Purpose**: Defines user roles for RBAC (Role-Based Access Control).

```csharp
public class Role
{
    public int Id { get; set; }                    // Primary key, auto-increment
    public string Name { get; set; }              // Required, unique, max 50 chars (Admin, User, Viewer)
    public string Description { get; set; }       // Optional, max 500 chars
    public DateTime CreatedAt { get; set; }        // Creation timestamp
    
    // Navigation properties
    public ICollection<User> Users { get; set; } = new List<User>();
}
```

**Database Configuration**:
- Primary Key: `Id`
- Unique Index: `Name`
- Seed Data: Admin, User, Viewer roles

**Status**: 📋 Planned

**Predefined Roles**:
- **Admin**: Full access, can manage users, organizations, and todo states
- **User**: Can create/read/update own todos, read organization todos
- **Viewer**: Read-only access to todos

---

### 6. TodoState
**Purpose**: Defines configurable lifecycle states for todos (replaces boolean `IsCompleted`).

```csharp
public class TodoState
{
    public int Id { get; set; }                    // Primary key, auto-increment
    public string Name { get; set; }              // Required, max 50 chars (e.g., "draft", "active")
    public string DisplayName { get; set; }       // Required, max 100 chars (e.g., "Draft", "Active")
    public int Order { get; set; }                // Display order (for UI sorting)
    public bool IsDefault { get; set; }            // Default state for new todos
    public string? Color { get; set; }             // Optional, hex color code for UI (e.g., "#3B82F6")
    public string? Icon { get; set; }               // Optional, icon name/identifier for UI (e.g., "check-circle")
    public int OrganizationId { get; set; }        // Foreign key to Organization (per-tenant)
    public bool IsDeleted { get; set; }            // Soft deletion flag (default: false)
    public DateTime? DeletedAt { get; set; }       // Soft deletion timestamp (nullable)
    public int? DeletedById { get; set; }          // User who deleted this record (nullable)
    public DateTime CreatedAt { get; set; }        // Creation timestamp
    public DateTime UpdatedAt { get; set; }        // Last update timestamp
    
    // Navigation properties
    public Organization Organization { get; set; } = null!;
    public User? DeletedBy { get; set; }           // Navigation to user who deleted
    public ICollection<Task> Tasks { get; set; } = new List<Task>();
}
```

**Database Configuration**:
- Primary Key: `Id`
- Indexes: `OrganizationId`, `Order`
- Foreign Key: `OrganizationId` → `Organization.Id`
- Unique Constraint: `(OrganizationId, Name)` - state names unique per organization

**Status**: 📋 Planned

**Default States** (to be seeded per organization):
1. **Draft** - Initial state for new todos
2. **Active** - Todo is active and being worked on
3. **In Progress** - Todo is currently being worked on
4. **Done** - Todo is completed

---

## Updated Models (Modifications to Existing)

### 7. Task (Updated)
**Purpose**: Updated to support user ownership, organization isolation, lifecycle states, assignment, and audit trail.

```csharp
public class Task
{
    public int Id { get; set; }                    // Primary key, auto-increment
    public string Title { get; set; }              // Required, max 200 chars
    public string? Description { get; set; }       // Optional, max 1000 chars
    public int TodoStateId { get; set; }          // Foreign key to TodoState (replaces IsCompleted)
    public int CreatedById { get; set; }           // Foreign key to User (creator)
    public int? AssignedToId { get; set; }        // Foreign key to User (assignee, nullable)
    public int OrganizationId { get; set; }        // Foreign key to Organization
    public DateTime CreatedAt { get; set; }       // Creation timestamp
    public DateTime UpdatedAt { get; set; }        // Last update timestamp
    public int? UpdatedById { get; set; }          // User who last updated this record (nullable)
    public DateTime? DueDate { get; set; }         // Optional due date
    public TaskPriority Priority { get; set; }     // Priority level (enum)
    public DateTime? CompletedAt { get; set; }    // Completion timestamp (nullable, set when state = "Done")
    public bool IsDeleted { get; set; }            // Soft deletion flag (default: false)
    public DateTime? DeletedAt { get; set; }       // Soft deletion timestamp (nullable)
    public int? DeletedById { get; set; }          // User who deleted this record (nullable)
    
    // Navigation properties
    public TodoState TodoState { get; set; } = null!;
    public User CreatedBy { get; set; } = null!;
    public User? AssignedTo { get; set; }          // Navigation to assigned user
    public User? UpdatedBy { get; set; }           // Navigation to user who last updated
    public User? DeletedBy { get; set; }           // Navigation to user who deleted
    public Organization Organization { get; set; } = null!;
}
```

**Changes from Current Model**:
- ❌ **Removed**: `IsCompleted` (boolean)
- ✅ **Added**: `TodoStateId` (foreign key to TodoState)
- ✅ **Added**: `CreatedById` (foreign key to User - creator)
- ✅ **Added**: `AssignedToId` (foreign key to User - assignee, nullable)
- ✅ **Added**: `OrganizationId` (foreign key to Organization)
- ✅ **Added**: `UpdatedAt` (audit trail)
- ✅ **Added**: `UpdatedById` (audit trail)
- ✅ **Added**: `IsDeleted`, `DeletedAt`, `DeletedById` (soft deletion)
- ✅ **Kept**: All other existing fields

**Database Configuration**:
- Primary Key: `Id`
- Indexes: `TodoStateId`, `CreatedById`, `AssignedToId`, `OrganizationId`, `CreatedAt`, `IsDeleted`
- Foreign Keys: 
  - `TodoStateId` → `TodoState.Id`
  - `CreatedById` → `User.Id`
  - `AssignedToId` → `User.Id` (nullable)
  - `UpdatedById` → `User.Id` (nullable)
  - `DeletedById` → `User.Id` (nullable)
  - `OrganizationId` → `Organization.Id`

**Status**: 📋 Planned (migration from current model)

---

## Entity Relationships

### Relationship Diagram

```
Organization (1) ────< (N) User
Organization (1) ────< (N) TodoState
Organization (1) ────< (N) Task

Role (1) ────< (N) User

TodoState (1) ────< (N) Task

User (1) ────< (N) Task (as CreatedBy)
User (1) ────< (N) Task (as AssignedTo, nullable)
User (1) ────< (N) Task (as UpdatedBy, nullable)
User (1) ────< (N) Task (as DeletedBy, nullable)

User (1) ────< (N) User (as DeletedBy, self-referential, nullable)
User (1) ────< (N) Organization (as DeletedBy, nullable)
User (1) ────< (N) TodoState (as DeletedBy, nullable)
```

### Detailed Relationships

1. **Organization → User** (One-to-Many)
   - One organization has many users
   - Each user belongs to one organization

2. **Organization → TodoState** (One-to-Many)
   - One organization has many todo states
   - Each todo state belongs to one organization (per-tenant states)

3. **Organization → Task** (One-to-Many)
   - One organization has many tasks
   - Each task belongs to one organization (multi-tenancy)

4. **Role → User** (One-to-Many)
   - One role has many users
   - Each user has one role

5. **TodoState → Task** (One-to-Many)
   - One todo state has many tasks
   - Each task has one todo state

6. **User → Task** (One-to-Many, as Creator)
   - One user creates many tasks
   - Each task has one creator

7. **User → Task** (One-to-Many, as Assignee)
   - One user can be assigned to many tasks
   - Each task can have one assignee (nullable)

8. **User → Task** (One-to-Many, as Updater)
   - One user can update many tasks
   - Each task tracks who last updated it (nullable)

9. **User → Task** (One-to-Many, as Deleter)
   - One user can delete many tasks
   - Each task tracks who deleted it (nullable, soft delete)

10. **User → User** (Self-referential, as Deleter)
    - One user can delete other users
    - Tracks who performed the deletion (nullable)

11. **User → Organization** (One-to-Many, as Deleter)
    - One user can delete organizations
    - Tracks who performed the deletion (nullable)

12. **User → TodoState** (One-to-Many, as Deleter)
    - One user can delete todo states
    - Tracks who performed the deletion (nullable)

---

## Database Schema Summary

### Tables

| Table Name | Primary Key | Key Relationships | Indexes |
|------------|-------------|-------------------|---------|
| `Organizations` | `Id` | - | `Slug` (unique), `Name` |
| `Roles` | `Id` | - | `Name` (unique) |
| `Users` | `Id` | `OrganizationId`, `RoleId`, `DeletedById` | `Email` (unique), `OrganizationId`, `RoleId`, `IsDeleted` |
| `TodoStates` | `Id` | `OrganizationId`, `DeletedById` | `OrganizationId`, `Order`, `IsDeleted`, `(OrganizationId, Name)` (unique) |
| `Tasks` | `Id` | `TodoStateId`, `CreatedById`, `AssignedToId`, `UpdatedById`, `DeletedById`, `OrganizationId` | `TodoStateId`, `CreatedById`, `AssignedToId`, `OrganizationId`, `CreatedAt`, `IsDeleted` |

### Enums

| Enum Name | Values |
|-----------|--------|
| `TaskPriority` | Low (0), Medium (1), High (2) |

---

## Data Migration Strategy

### Migration Steps

1. **Create New Tables**
   - Create `Organizations` table
   - Create `Roles` table (seed with Admin, User, Viewer)
   - Create `Users` table
   - Create `TodoStates` table

2. **Update Tasks Table**
   - Add `TodoStateId` column (nullable initially)
   - Add `CreatedById` column (nullable initially)
   - Add `OrganizationId` column (nullable initially)

3. **Data Migration**
   - Create default organization (or migrate existing data to default org)
   - Create default admin user for the organization
   - Create default todo states per organization (Draft, Active, In Progress, Done)
   - Migrate existing tasks:
     - Set `IsCompleted = false` → `TodoStateId = "Active"` state
     - Set `IsCompleted = true` → `TodoStateId = "Done"` state
     - Set `CreatedById` to default admin user
     - Set `OrganizationId` to default organization
     - Set `UpdatedAt` = `CreatedAt` (for existing records)
     - Set `IsDeleted` = false for all existing tasks

4. **Remove Old Columns**
   - Remove `IsCompleted` column after migration verified

5. **Add Constraints**
   - Make `TodoStateId`, `CreatedById`, `OrganizationId` NOT NULL
   - Add foreign key constraints

---

## Field Constraints and Validation

### User
- `Email`: Required, unique, max 255 chars, valid email format
- `PasswordHash`: Required, min 60 chars (bcrypt hash length)
- `FirstName`: Required, max 100 chars
- `LastName`: Required, max 100 chars
- `OrganizationId`: Required, valid foreign key
- `RoleId`: Required, valid foreign key
- `IsActive`: Boolean, default true
- `IsDeleted`: Boolean, default false
- `DeletedAt`: Optional, valid datetime
- `DeletedById`: Optional, valid foreign key to User

### Organization
- `Name`: Required, max 200 chars
- `Slug`: Required, unique, max 100 chars, URL-friendly (lowercase, alphanumeric, hyphens)
- `IsActive`: Boolean, default true
- `IsDeleted`: Boolean, default false
- `DeletedAt`: Optional, valid datetime
- `DeletedById`: Optional, valid foreign key to User

### Role
- `Name`: Required, unique, max 50 chars, predefined values (Admin, User, Viewer)
- `Description`: Optional, max 500 chars

### TodoState
- `Name`: Required, max 50 chars, unique per organization
- `DisplayName`: Required, max 100 chars
- `Order`: Required, integer >= 0
- `IsDefault`: Boolean, only one per organization can be true
- `Color`: Optional, max 7 chars (hex color code, e.g., "#3B82F6")
- `Icon`: Optional, max 50 chars (icon identifier/name)
- `OrganizationId`: Required, valid foreign key
- `IsDeleted`: Boolean, default false
- `DeletedAt`: Optional, valid datetime
- `DeletedById`: Optional, valid foreign key to User

### Task (Updated)
- `Title`: Required, max 200 chars
- `Description`: Optional, max 1000 chars
- `TodoStateId`: Required, valid foreign key
- `CreatedById`: Required, valid foreign key
- `AssignedToId`: Optional, valid foreign key to User
- `OrganizationId`: Required, valid foreign key
- `UpdatedAt`: Required, valid datetime
- `UpdatedById`: Optional, valid foreign key to User
- `DueDate`: Optional, valid date
- `Priority`: Required, enum value (Low, Medium, High)
- `IsDeleted`: Boolean, default false
- `DeletedAt`: Optional, valid datetime
- `DeletedById`: Optional, valid foreign key to User

---

## Indexes and Performance Considerations

### Recommended Indexes

1. **Users Table**
   - `Email` (unique index) - for login lookups
   - `OrganizationId` - for filtering users by organization
   - `RoleId` - for role-based queries

2. **Tasks Table**
   - `OrganizationId` - for multi-tenant isolation
   - `CreatedById` - for user's own tasks
   - `AssignedToId` - for assigned tasks
   - `TodoStateId` - for filtering by state
   - `CreatedAt` - for sorting by creation date
   - `IsDeleted` - for filtering out soft-deleted tasks
   - Composite: `(OrganizationId, TodoStateId)` - for org + state filtering
   - Composite: `(OrganizationId, IsDeleted)` - for org + deletion status filtering

3. **TodoStates Table**
   - `OrganizationId` - for per-tenant state queries
   - `Order` - for sorting states
   - `IsDeleted` - for filtering out soft-deleted states
   - Composite: `(OrganizationId, Name)` (unique) - for state uniqueness per org
   - Composite: `(OrganizationId, IsDeleted)` - for org + deletion status filtering

4. **Users Table**
   - `IsDeleted` - for filtering out soft-deleted users
   - `IsActive` - for filtering active users

5. **Organizations Table**
   - `IsDeleted` - for filtering out soft-deleted organizations
   - `IsActive` - for filtering active organizations

---

## Design Decisions Made

### ✅ Soft Deletion
- **Decision**: Implement soft deletion for all major entities
- **Implementation**: 
  - `IsDeleted` boolean flag (default: false)
  - `DeletedAt` timestamp (nullable)
  - `DeletedById` foreign key to User (nullable)
- **Entities**: User, Organization, TodoState, Task
- **Rationale**: Preserves data integrity, allows recovery, maintains audit trail

### ✅ Audit Trail
- **Decision**: Track who created, updated, and deleted records
- **Implementation**:
  - `CreatedAt` timestamp (all entities)
  - `UpdatedAt` timestamp (all entities)
  - `UpdatedById` foreign key to User (Task entity)
  - `CreatedById` foreign key to User (Task entity)
  - `DeletedById` foreign key to User (all entities)
- **Rationale**: Compliance, debugging, accountability

### ✅ Task Assignment
- **Decision**: Separate task creator from assignee
- **Implementation**:
  - `CreatedById` - who created the task
  - `AssignedToId` - who the task is assigned to (nullable)
- **Rationale**: Tasks can be created by one person and assigned to another

### ✅ Per-Tenant State Configuration
- **Decision**: Todo states are configurable per organization
- **Implementation**: `OrganizationId` foreign key on TodoState
- **Rationale**: Different organizations may have different workflows

### ⚠️ UI Enhancement Fields (Optional)
- **Decision**: Add optional color and icon fields for TodoState
- **Implementation**:
  - `Color` - hex color code (nullable, max 7 chars)
  - `Icon` - icon identifier (nullable, max 50 chars)
- **Rationale**: Enhances UI but not required for core functionality
- **Status**: Implemented as optional fields

---

## Sign-off

**Reviewer**: _________________  
**Date**: _________________  
**Status**: ☐ Approved  ☐ Needs Changes  
**Notes**: 

_________________________________________________
_________________________________________________
_________________________________________________

