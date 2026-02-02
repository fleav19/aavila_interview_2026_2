# Todo API - Current State

## Base URL
`http://localhost:5002`

## Available Endpoints

### 1. Get All Tasks
**GET** `/api/tasks`

**Query Parameters:**
- `filter` (string, optional): Search in title and description
- `sortBy` (string, optional): Sort by `"title"`, `"priority"`, `"duedate"`, or `"created"` (default)
- `isCompleted` (bool, optional): Filter by completion status

**Example Request:**
```bash
curl http://localhost:5002/api/tasks
curl http://localhost:5002/api/tasks?isCompleted=false
curl http://localhost:5002/api/tasks?filter=test&sortBy=priority
```

**Example Response:**
```json
[
  {
    "id": 1,
    "title": "Test Task",
    "description": "My first task",
    "isCompleted": false,
    "createdAt": "2026-02-02T15:50:24.497061",
    "dueDate": null,
    "priority": 1,
    "completedAt": null
  }
]
```

---

### 2. Get Task Statistics
**GET** `/api/tasks/stats`

**Example Request:**
```bash
curl http://localhost:5002/api/tasks/stats
```

**Example Response:**
```json
{
  "total": 1,
  "completed": 0,
  "active": 1,
  "highPriority": 0
}
```

---

### 3. Get Task by ID
**GET** `/api/tasks/{id}`

**Example Request:**
```bash
curl http://localhost:5002/api/tasks/1
```

**Example Response:**
```json
{
  "id": 1,
  "title": "Test Task",
  "description": "My first task",
  "isCompleted": false,
  "createdAt": "2026-02-02T15:50:24.497061",
  "dueDate": null,
  "priority": 1,
  "completedAt": null
}
```

**Error Response (404):**
```json
{
  "message": "Task with ID 999 not found"
}
```

---

### 4. Create Task
**POST** `/api/tasks`

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description (optional)",
  "dueDate": "2024-12-31T00:00:00Z",
  "priority": 1
}
```

**Priority Values:**
- `0` = Low
- `1` = Medium
- `2` = High

**Example Request:**
```bash
curl -X POST http://localhost:5002/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "description": "Finish the todo app",
    "priority": 2
  }'
```

**Example Response (201 Created):**
```json
{
  "id": 2,
  "title": "Complete project",
  "description": "Finish the todo app",
  "isCompleted": false,
  "createdAt": "2026-02-02T16:00:00.000000Z",
  "dueDate": null,
  "priority": 2,
  "completedAt": null
}
```

---

### 5. Update Task
**PUT** `/api/tasks/{id}`

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "dueDate": "2024-12-31T00:00:00Z",
  "priority": 2
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:5002/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Task",
    "description": "New description",
    "priority": 2
  }'
```

**Example Response (200 OK):**
```json
{
  "id": 1,
  "title": "Updated Task",
  "description": "New description",
  "isCompleted": false,
  "createdAt": "2026-02-02T15:50:24.497061",
  "dueDate": null,
  "priority": 2,
  "completedAt": null
}
```

---

### 6. Toggle Task Status
**PATCH** `/api/tasks/{id}/status`

Toggles the completion status of a task (complete ↔ incomplete).

**Example Request:**
```bash
curl -X PATCH http://localhost:5002/api/tasks/1/status
```

**Example Response (200 OK):**
```json
{
  "id": 1,
  "title": "Test Task",
  "description": "My first task",
  "isCompleted": true,
  "createdAt": "2026-02-02T15:50:24.497061",
  "dueDate": null,
  "priority": 1,
  "completedAt": "2026-02-02T16:05:00.000000Z"
}
```

---

### 7. Delete Task
**DELETE** `/api/tasks/{id}`

**Example Request:**
```bash
curl -X DELETE http://localhost:5002/api/tasks/1
```

**Response:** `204 No Content` (no body)

---

## Data Models

### TaskDto
```typescript
{
  id: number
  title: string
  description: string | null
  isCompleted: boolean
  createdAt: string (ISO 8601)
  dueDate: string | null (ISO 8601)
  priority: 0 | 1 | 2  // Low, Medium, High
  completedAt: string | null (ISO 8601)
}
```

### CreateTaskDto / UpdateTaskDto
```typescript
{
  title: string (required, 1-200 chars)
  description: string | null (optional, max 1000 chars)
  dueDate: string | null (optional, ISO 8601)
  priority: 0 | 1 | 2 (default: 1)
}
```

### TaskStatsDto
```typescript
{
  total: number
  completed: number
  active: number
  highPriority: number
}
```

---

## Interactive API Documentation

**Swagger UI** is available at:
- `http://localhost:5002/swagger` (when running in HTTP mode)
- `https://localhost:5001/swagger` (when running in HTTPS mode)

This provides an interactive interface to test all endpoints directly in your browser.

---

## Features

✅ Full CRUD operations
✅ Task filtering (by completion status)
✅ Task search (title and description)
✅ Task sorting (title, priority, due date, created date)
✅ Task priorities (Low, Medium, High)
✅ Due dates support
✅ Task statistics endpoint
✅ Input validation
✅ Error handling with proper HTTP status codes
✅ CORS configured for React frontend
✅ Swagger/OpenAPI documentation

---

## Current Status

- ✅ API is running on `http://localhost:5002`
- ✅ Database (SQLite) is created and working
- ✅ All endpoints are functional
- ✅ 1 test task exists in the database

