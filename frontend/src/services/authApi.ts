import axios from 'axios';
import type { AuthResponse, LoginDto, RegisterDto, User } from '../types/auth';

const API_BASE_URL = 'http://localhost:5002/api';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await authApi.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterDto): Promise<AuthResponse> => {
    const response = await authApi.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (token: string): Promise<User> => {
    const response = await authApi.get<User>('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default authApi;

