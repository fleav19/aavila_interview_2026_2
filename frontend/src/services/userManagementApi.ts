import api from './api';
import type { UserManagement, UpdateUserDto } from '../types/userManagement';

export const userManagementApi = {
  // Get all users in organization (Admin only)
  getAll: async (): Promise<UserManagement[]> => {
    const response = await api.get<UserManagement[]>('/usermanagement');
    return response.data;
  },

  // Get user by ID (Admin only)
  getById: async (id: number): Promise<UserManagement> => {
    const response = await api.get<UserManagement>(`/usermanagement/${id}`);
    return response.data;
  },

  // Update user (Admin only)
  update: async (id: number, user: UpdateUserDto): Promise<UserManagement> => {
    const response = await api.put<UserManagement>(`/usermanagement/${id}`, user);
    return response.data;
  },
};

