# Todo App - Frontend

A React + TypeScript frontend for the Todo API, built with Vite, Tailwind CSS, and React Hook Form.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running on `http://localhost:5002`

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete tasks)
- ✅ Task filtering (All, Active, Completed)
- ✅ Task search (title and description)
- ✅ Task sorting (title, priority, due date, created date)
- ✅ Task priorities (Low, Medium, High) with visual indicators
- ✅ Due dates with overdue detection
- ✅ Task statistics dashboard
- ✅ Form validation with React Hook Form
- ✅ Loading states and error handling
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Clean, modern UI with Tailwind CSS

## Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── TaskList.tsx
│   │   ├── TaskItem.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskFilters.tsx
│   │   ├── TaskStats.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   ├── contexts/         # React Context for state
│   │   └── TaskContext.tsx
│   ├── services/         # API client
│   │   └── api.ts
│   ├── types/           # TypeScript types
│   │   └── task.ts
│   ├── utils/           # Helper functions
│   │   └── helpers.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Technology Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client for API calls
- **React Context API** - State management

## API Configuration

The frontend is configured to connect to the backend API at:
- Base URL: `http://localhost:5002/api`

To change the API URL, update `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:5002/api';
```

## Development Notes

- The app uses React Context for global state management
- All API calls are centralized in `src/services/api.ts`
- Form validation is handled by React Hook Form
- Styling uses Tailwind CSS utility classes
- The app is fully responsive and works on mobile, tablet, and desktop

## Assumptions & Trade-offs

### Assumptions
1. Single-user application (no authentication)
2. Backend API is always available
3. Modern browser support (ES6+)

### Trade-offs
1. **Context API vs Redux**: Chosen for simplicity (no need for complex state management)
2. **Tailwind vs Component Library**: Chosen for flexibility and speed
3. **Axios vs Fetch**: Chosen for better error handling and interceptors
4. **No routing**: Single-page app doesn't need React Router

## Future Enhancements

### Short-term
- Add toast notifications for success/error messages
- Add keyboard shortcuts
- Add drag-and-drop reordering
- Add task categories/tags

### Medium-term
- Add dark mode toggle
- Add task templates
- Add export functionality (CSV, JSON)
- Add task comments/notes

### Long-term
- Add user authentication
- Add task sharing and collaboration
- Add mobile app (React Native)
- Add offline support (PWA)
