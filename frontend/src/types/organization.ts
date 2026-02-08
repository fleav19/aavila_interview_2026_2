export interface Organization {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userCount: number;
  taskCount: number;
  activeTaskCount: number;
  todoStateCount: number;
}

export interface UpdateOrganizationDto {
  name: string;
  slug?: string;
  isActive?: boolean;
}

