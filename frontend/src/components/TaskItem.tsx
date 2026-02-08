import { useState, useEffect } from 'react';
import { useTasks } from '../contexts/TaskContext';
import type { Task } from '../types/task';
import { formatDate, isOverdue, getPriorityColor } from '../utils/helpers';
import { PRIORITY_LABELS } from '../types/task';
import { todoStateApi } from '../services/todoStateApi';
import type { TodoState } from '../types/todoState';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
}

export const TaskItem = ({ task, onEdit, onView }: TaskItemProps) => {
  const { updateTask, deleteTask } = useTasks();
  const [isDeleting, setIsDeleting] = useState(false);
  const [states, setStates] = useState<TodoState[]>([]);
  const [changingState, setChangingState] = useState(false);

  // Load states on mount
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

  const currentState = states.find(s => s.id === task.todoStateId);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      await deleteTask(task.id);
      setIsDeleting(false);
    }
  };

  const handleStateChange = async (newStateId: number) => {
    if (newStateId === task.todoStateId) return;
    
    setChangingState(true);
    try {
      await updateTask(task.id, { 
        title: task.title,
        description: task.description || undefined,
        dueDate: task.dueDate || undefined,
        priority: task.priority,
        todoStateId: newStateId 
      });
    } catch (err) {
      console.error('Failed to update task state:', err);
    } finally {
      setChangingState(false);
    }
  };

  const priorityColor = getPriorityColor(task.priority);
  const overdue = isOverdue(task.dueDate);

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm transition-all cursor-pointer hover:shadow-md ${
        task.isCompleted ? 'opacity-60' : ''
      } ${isDeleting ? 'opacity-50' : ''}`}
      onClick={() => onView(task)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-semibold text-lg ${
                task.isCompleted 
                  ? 'line-through text-gray-500 dark:text-gray-400' 
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {task.title}
            </h3>
            <div className="flex gap-2 items-center">
              {currentState && (
                <span
                  className="px-2 py-1 text-xs font-medium rounded border whitespace-nowrap"
                  style={{
                    backgroundColor: currentState.color ? `${currentState.color}20` : '#F3F4F6',
                    borderColor: currentState.color || '#D1D5DB',
                    color: currentState.color || '#374151',
                  }}
                >
                  {currentState.displayName}
                </span>
              )}
              <span
                className={`px-2 py-1 text-xs font-medium rounded border ${priorityColor} whitespace-nowrap`}
              >
                {PRIORITY_LABELS[task.priority]}
              </span>
            </div>
          </div>
          {task.description && (
            <p
              className={`mt-2 text-sm ${
                task.isCompleted 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
            {task.projectName && (
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                📁 {task.projectName}
              </span>
            )}
            {task.assignedToName && (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Assigned to: {task.assignedToName}
              </span>
            )}
            {!task.assignedToName && (
              <span className="text-gray-400 dark:text-gray-500 italic">
                Unassigned
              </span>
            )}
            {task.dueDate && (
              <span className={overdue && !task.isCompleted ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                Due: {formatDate(task.dueDate)}
                {overdue && !task.isCompleted && ' (Overdue)'}
              </span>
            )}
            <span className="text-gray-400 dark:text-gray-500">
              Created by: {task.createdByName}
            </span>
            {task.completedAt && (
              <span>Completed: {formatDate(task.completedAt)}</span>
            )}
          </div>
          {states.length > 0 && (
            <div className="mt-2">
              <select
                value={task.todoStateId}
                onChange={(e) => handleStateChange(Number(e.target.value))}
                disabled={changingState}
                className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                style={{ fontSize: '0.75rem' }}
              >
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.displayName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            disabled={isDeleting}
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            disabled={isDeleting}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

