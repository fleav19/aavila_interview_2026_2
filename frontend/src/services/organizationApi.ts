import api from './api';
import type { Organization, UpdateOrganizationDto } from '../types/organization';

export const organizationApi = {
  // Get current organization (Admin only)
  get: async (): Promise<Organization> => {
    const response = await api.get<Organization>('/organization');
    return response.data;
  },

  // Update organization (Admin only)
  update: async (organization: UpdateOrganizationDto): Promise<Organization> => {
    const response = await api.put<Organization>('/organization', organization);
    return response.data;
  },
};

