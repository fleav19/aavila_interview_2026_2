import api from './api';
import type { Project, CreateProjectDto, UpdateProjectDto } from '../types/project';

export const projectApi = {
  // Get all projects for organization
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  // Get project by ID
  getById: async (id: number): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  // Create a new project (Admin and User only)
  create: async (project: CreateProjectDto): Promise<Project> => {
    const response = await api.post<Project>('/projects', project);
    return response.data;
  },

  // Update an existing project (Admin and User only)
  update: async (id: number, project: UpdateProjectDto): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, project);
    return response.data;
  },

  // Delete a project (Admin and User only)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

