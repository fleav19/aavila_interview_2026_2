import api from './api';

export interface UserForAssignment {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export const usersApi = {
  // Get users for task assignment (all authenticated users)
  getForAssignment: async (): Promise<UserForAssignment[]> => {
    const response = await api.get<UserForAssignment[]>('/users/for-assignment');
    return response.data;
  },
};

