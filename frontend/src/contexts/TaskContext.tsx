import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { taskApi } from '../services/api';
import type { Task, CreateTaskDto, UpdateTaskDto, TaskStats } from '../types/task';

interface TaskContextType {
  tasks: Task[];
  stats: TaskStats | null;
  loading: boolean;
  error: string | null;
  fetchTasks: (filter?: string, sortBy?: string, isCompleted?: boolean) => Promise<void>;
  createTask: (task: CreateTaskDto) => Promise<void>;
  updateTask: (id: number, task: UpdateTaskDto) => Promise<void>;
  toggleTask: (id: number) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  fetchStats: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async (filter?: string, sortBy?: string, isCompleted?: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskApi.getAll({ filter, sortBy, isCompleted });
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (task: CreateTaskDto) => {
    try {
      setLoading(true);
      setError(null);
      const newTask = await taskApi.create(task);
      setTasks((prev) => [...prev, newTask]);
      await fetchStats();
    } catch (err: any) {
      // Extract error message from response
      let errorMessage = 'Failed to create task';
      if (err.response?.data) {
        if (err.response.data.errors) {
          // Validation errors
          const errors = err.response.data.errors;
          errorMessage = `Validation failed: ${Object.entries(errors)
            .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ')}`;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: number, task: UpdateTaskDto) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await taskApi.update(id, task);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await taskApi.toggleStatus(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await taskApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await taskApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch tasks and stats on mount
  useEffect(() => {
    fetchTasks();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,
        loading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        toggleTask,
        deleteTask,
        fetchStats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

