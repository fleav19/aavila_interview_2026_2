export interface AdvancedStats {
  byUser: Record<string, UserTaskStats>;
  trends: TrendDataPoint[];
  byState: Record<string, number>;
}

export interface UserTaskStats {
  userId: number;
  userName: string;
  userEmail: string;
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  highPriorityTasks: number;
  stateCounts: Record<string, number>;
}

export interface TrendDataPoint {
  date: string;
  tasksCreated: number;
  tasksCompleted: number;
  totalTasks: number;
  stateCounts: Record<string, number>;
}

