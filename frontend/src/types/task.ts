export interface Task {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean; // Kept for backward compatibility
  todoStateId: number;
  todoStateName: string;
  todoStateDisplayName: string;
  todoStateColor?: string;
  createdAt: string;
  dueDate: string | null;
  priority: 0 | 1 | 2; // Low, Medium, High
  completedAt: string | null;
  assignedToId?: number | null;
  assignedToName?: string | null;
  assignedToEmail?: string | null;
  createdById: number;
  createdByName: string;
  updatedAt: string;
  updatedById?: number | null;
  updatedByName?: string | null;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  priority: 0 | 1 | 2;
  todoStateId?: number;
  assignedToId?: number | null;
}

export interface UpdateTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  priority: 0 | 1 | 2;
  todoStateId?: number;
  assignedToId?: number | null;
}

export interface TaskStats {
  total: number;
  completed: number;
  active: number;
  highPriority: number;
  stateCounts?: Record<string, number>;
}

export type TaskPriority = 0 | 1 | 2;

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  0: 'Low',
  1: 'Medium',
  2: 'High',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  0: 'gray',
  1: 'blue',
  2: 'red',
};

