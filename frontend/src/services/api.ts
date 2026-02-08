import axios from 'axios';
import type { Task, CreateTaskDto, UpdateTaskDto, TaskStats } from '../types/task';

const API_BASE_URL = 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('todo_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth and redirect to login
      localStorage.removeItem('todo_auth_token');
      localStorage.removeItem('todo_user');
      window.location.href = '/';
    }
    // Log other errors for debugging
    if (error.response?.status === 403) {
      console.error('Forbidden (403):', error.response.data);
    }
    return Promise.reject(error);
  }
);

export const taskApi = {
  // Get all tasks with optional filtering and sorting
  getAll: async (params?: {
    filter?: string;
    sortBy?: string;
    isCompleted?: boolean;
    todoStateId?: number;
    assignedToId?: number;
    unassignedOnly?: boolean;
    projectId?: number;
  }): Promise<Task[]> => {
    const response = await api.get<Task[]>('/tasks', { params });
    return response.data;
  },

  // Get task by ID
  getById: async (id: number): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  // Create a new task
  create: async (task: CreateTaskDto): Promise<Task> => {
    const response = await api.post<Task>('/tasks', task);
    return response.data;
  },

  // Update an existing task
  update: async (id: number, task: UpdateTaskDto): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, task);
    return response.data;
  },

  // Toggle task completion status
  toggleStatus: async (id: number): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}/status`);
    return response.data;
  },

  // Delete a task
  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // Get task statistics
  getStats: async (): Promise<TaskStats> => {
    const response = await api.get<TaskStats>('/tasks/stats');
    return response.data;
  },
};

export default api;

