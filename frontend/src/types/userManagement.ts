export interface UserManagement {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  taskCount: number;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
}

