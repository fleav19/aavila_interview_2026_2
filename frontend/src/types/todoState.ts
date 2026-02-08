export interface TodoState {
  id: number;
  name: string;
  displayName: string;
  order: number;
  isDefault: boolean;
  color?: string;
  icon?: string;
  organizationId: number;
  taskCount: number;
}

export interface CreateTodoStateDto {
  name: string;
  displayName: string;
  order: number;
  isDefault: boolean;
  color?: string;
  icon?: string;
}

export interface UpdateTodoStateDto {
  name?: string;
  displayName?: string;
  order?: number;
  isDefault?: boolean;
  color?: string;
  icon?: string;
}

