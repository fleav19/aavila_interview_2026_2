import { useState, useEffect } from 'react';
import { todoStateApi } from '../services/todoStateApi';
import type { TodoState } from '../types/todoState';

interface TaskFiltersProps {
  filter: string;
  sortBy: string;
  isCompleted?: boolean;
  todoStateId?: number;
  onFilterChange: (filter: string) => void;
  onSortChange: (sortBy: string) => void;
  onStatusChange: (isCompleted?: boolean) => void;
  onStateChange: (todoStateId?: number) => void;
}

export const TaskFilters = ({
  filter,
  sortBy,
  isCompleted,
  todoStateId,
  onFilterChange,
  onSortChange,
  onStatusChange,
  onStateChange,
}: TaskFiltersProps) => {
  const [states, setStates] = useState<TodoState[]>([]);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const data = await todoStateApi.getAll();
        setStates(data.sort((a, b) => a.order - b.order));
      } catch (err) {
        console.error('Failed to load states:', err);
      }
    };
    loadStates();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 space-y-4 border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <input
            type="text"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            placeholder="Search tasks..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* State Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            State
          </label>
          <select
            value={todoStateId || 'all'}
            onChange={(e) => {
              const value = e.target.value;
              onStateChange(value === 'all' ? undefined : Number(value));
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All States</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter (Legacy - kept for backward compatibility) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={isCompleted === undefined ? 'all' : isCompleted ? 'completed' : 'active'}
            onChange={(e) => {
              const value = e.target.value;
              onStatusChange(
                value === 'all' ? undefined : value === 'completed'
              );
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tasks</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created">Newest First</option>
            <option value="title">Title</option>
            <option value="priority">Priority</option>
            <option value="duedate">Due Date</option>
          </select>
        </div>
      </div>
    </div>
  );
};

