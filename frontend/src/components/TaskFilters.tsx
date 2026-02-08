import { useState, useEffect } from 'react';
import { todoStateApi } from '../services/todoStateApi';
import { usersApi } from '../services/usersApi';
import { useAuth } from '../contexts/AuthContext';
import type { TodoState } from '../types/todoState';

interface TaskFiltersProps {
  filter: string;
  sortBy: string;
  isCompleted?: boolean;
  todoStateId?: number;
  assignedToId?: number;
  onFilterChange: (filter: string) => void;
  onSortChange: (sortBy: string) => void;
  onStatusChange: (isCompleted?: boolean) => void;
  onStateChange: (todoStateId?: number) => void;
  onAssigneeChange: (assignedToId?: number) => void;
}

export const TaskFilters = ({
  filter,
  sortBy,
  isCompleted,
  todoStateId,
  assignedToId,
  onFilterChange,
  onSortChange,
  onStatusChange,
  onStateChange,
  onAssigneeChange,
}: TaskFiltersProps) => {
  const [states, setStates] = useState<TodoState[]>([]);
  const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);

  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statesData, usersData] = await Promise.all([
          todoStateApi.getAll(),
          usersApi.getForAssignment(), // All authenticated users can get users for assignment
        ]);
        setStates(statesData.sort((a, b) => a.order - b.order));
        // Map users to { id, name } format
        setUsers(usersData.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` })));
      } catch (err) {
        console.error('Failed to load states or users:', err);
        // If users fail, just load states
        try {
          const statesData = await todoStateApi.getAll();
          setStates(statesData.sort((a, b) => a.order - b.order));
        } catch (stateErr) {
          console.error('Failed to load states:', stateErr);
        }
      }
    };
    loadData();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 space-y-4 border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

        {/* Assignee Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assignee
          </label>
          <select
            value={assignedToId || 'all'}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'me') {
                onAssigneeChange(user?.id);
              } else if (value === 'unassigned') {
                onAssigneeChange(-1); // Special value for unassigned
              } else {
                onAssigneeChange(value === 'all' ? undefined : Number(value));
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Assignees</option>
            <option value="me">Assigned to Me</option>
            <option value="unassigned">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
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

