import { useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import type { Task } from '../types/task';
import { formatDate, isOverdue, getPriorityColor } from '../utils/helpers';
import { PRIORITY_LABELS } from '../types/task';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskItem = ({ task, onEdit }: TaskItemProps) => {
  const { toggleTask, deleteTask } = useTasks();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      await deleteTask(task.id);
      setIsDeleting(false);
    }
  };

  const priorityColor = getPriorityColor(task.priority);
  const overdue = isOverdue(task.dueDate);

  return (
    <div
      className={`bg-white border rounded-lg p-4 shadow-sm transition-all ${
        task.isCompleted ? 'opacity-60' : ''
      } ${isDeleting ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={() => toggleTask(task.id)}
          className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-semibold text-lg ${
                task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {task.title}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded border ${priorityColor} whitespace-nowrap`}
            >
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>
          {task.description && (
            <p
              className={`mt-2 text-sm ${
                task.isCompleted ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            {task.dueDate && (
              <span className={overdue && !task.isCompleted ? 'text-red-600 font-medium' : ''}>
                Due: {formatDate(task.dueDate)}
                {overdue && !task.isCompleted && ' (Overdue)'}
              </span>
            )}
            {task.completedAt && (
              <span>Completed: {formatDate(task.completedAt)}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
            disabled={isDeleting}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
            disabled={isDeleting}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

