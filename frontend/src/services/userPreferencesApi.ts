import api from './api';
import type { UserPreferences, UpdateUserPreferences } from '../types/userPreferences';

export const userPreferencesApi = {
  // Get current user's preferences
  get: async (): Promise<UserPreferences> => {
    const response = await api.get<UserPreferences>('/userpreferences');
    return response.data;
  },

  // Update current user's preferences
  update: async (preferences: UpdateUserPreferences): Promise<UserPreferences> => {
    const response = await api.put<UserPreferences>('/userpreferences', preferences);
    return response.data;
  },
};

