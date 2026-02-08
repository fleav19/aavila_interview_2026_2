export interface Project {
  id: number;
  name: string;
  description?: string | null;
  organizationId: number;
  organizationName: string;
  createdById: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  updatedById?: number | null;
  updatedByName?: string | null;
  taskCount: number;
  activeTaskCount: number;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}

