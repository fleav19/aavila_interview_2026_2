import { useState, useEffect } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { taskApi } from '../services/api';
import { formatDate, isOverdue, getPriorityColor } from '../utils/helpers';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../types/task';
import type { Task } from '../types/task';
import { useTheme } from '../contexts/ThemeContext';

interface TaskDetailProps {
  taskId: number;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onCreateSubtask?: (parentTaskId: number) => void;
}

export const TaskDetail = ({ taskId, onClose, onEdit, onCreateSubtask }: TaskDetailProps) => {
  const { deleteTask } = useTasks();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await taskApi.getById(taskId);
        setTask(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load task');
        console.error('Error loading task:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTask();
  }, [taskId]);

  const handleDelete = async () => {
    if (!task) return;
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      try {
        await deleteTask(task.id);
        onClose();
      } catch (err) {
        console.error('Error deleting task:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = () => {
    if (task) {
      onEdit(task);
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading task...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Task not found'}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const overdue = isOverdue(task.dueDate);
  const priorityColor = getPriorityColor(task.priority);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'dark' : ''}`}>
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{task.title}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="px-3 py-1 text-sm font-medium rounded border"
                style={{
                  backgroundColor: task.todoStateColor ? `${task.todoStateColor}20` : '#F3F4F6',
                  borderColor: task.todoStateColor || '#D1D5DB',
                  color: task.todoStateColor || '#374151',
                }}
              >
                {task.todoStateDisplayName}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded border ${priorityColor}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Description
              </h3>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Project */}
          {task.projectName && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Project
              </h3>
              <p className="text-gray-900 dark:text-white">
                <span className="text-purple-600 dark:text-purple-400 font-medium">
                  📁 {task.projectName}
                </span>
              </p>
            </div>
          )}

          {/* Parent Task */}
          {task.parentTaskTitle && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Parent Task
              </h3>
              <p className="text-gray-900 dark:text-white">
                <span className="text-gray-600 dark:text-gray-400">
                  ↳ {task.parentTaskTitle}
                </span>
              </p>
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Subtasks ({task.subtasks.length})
              </h3>
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ↳ {subtask.title}
                        </p>
                        {subtask.todoStateDisplayName && (
                          <span
                            className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded border"
                            style={{
                              backgroundColor: subtask.todoStateColor ? `${subtask.todoStateColor}20` : '#F3F4F6',
                              borderColor: subtask.todoStateColor || '#D1D5DB',
                              color: subtask.todoStateColor || '#374151',
                            }}
                          >
                            {subtask.todoStateDisplayName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assignee */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Assignee
              </h3>
              <p className="text-gray-900 dark:text-white">
                {task.assignedToName ? (
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    👤 {task.assignedToName}
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 italic">Unassigned</span>
                )}
              </p>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  Due Date
                </h3>
                <p className={`${overdue && !task.isCompleted ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-900 dark:text-white'}`}>
                  📅 {formatDate(task.dueDate)}
                  {overdue && !task.isCompleted && ' (Overdue)'}
                </p>
              </div>
            )}

            {/* Created */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Created
              </h3>
              <p className="text-gray-900 dark:text-white">
                <span className="text-gray-600 dark:text-gray-400">By:</span> {task.createdByName}
                <br />
                <span className="text-gray-600 dark:text-gray-400">On:</span> {formatDate(task.createdAt)}
              </p>
            </div>

            {/* Last Updated */}
            {task.updatedAt && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  Last Updated
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {task.updatedByName && (
                    <>
                      <span className="text-gray-600 dark:text-gray-400">By:</span> {task.updatedByName}
                      <br />
                    </>
                  )}
                  <span className="text-gray-600 dark:text-gray-400">On:</span> {formatDate(task.updatedAt)}
                </p>
              </div>
            )}

            {/* Completed */}
            {task.completedAt && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                  Completed
                </h3>
                <p className="text-gray-900 dark:text-white">
                  📅 {formatDate(task.completedAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

