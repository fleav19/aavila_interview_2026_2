import api from './api';
import type { TodoState, CreateTodoStateDto, UpdateTodoStateDto } from '../types/todoState';

export const todoStateApi = {
  // Get all todo states for organization
  getAll: async (): Promise<TodoState[]> => {
    const response = await api.get<TodoState[]>('/todostates');
    return response.data;
  },

  // Get todo state by ID
  getById: async (id: number): Promise<TodoState> => {
    const response = await api.get<TodoState>(`/todostates/${id}`);
    return response.data;
  },

  // Create a new todo state (Admin only)
  create: async (state: CreateTodoStateDto): Promise<TodoState> => {
    const response = await api.post<TodoState>('/todostates', state);
    return response.data;
  },

  // Update an existing todo state (Admin only)
  update: async (id: number, state: UpdateTodoStateDto): Promise<TodoState> => {
    const response = await api.put<TodoState>(`/todostates/${id}`, state);
    return response.data;
  },

  // Delete a todo state (Admin only)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/todostates/${id}`);
  },
};

