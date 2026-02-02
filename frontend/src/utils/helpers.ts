import type { TaskPriority } from '../types/task';

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isOverdue = (dueDate: string | null): boolean => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date() && !dueDate.includes('T00:00:00');
};

export const getPriorityColor = (priority: TaskPriority): string => {
  const colors: Record<TaskPriority, string> = {
    0: 'bg-gray-100 text-gray-800 border-gray-300',
    1: 'bg-blue-100 text-blue-800 border-blue-300',
    2: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[priority];
};

