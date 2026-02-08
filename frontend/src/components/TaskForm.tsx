import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTasks } from '../contexts/TaskContext';
import { todoStateApi } from '../services/todoStateApi';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';
import type { TodoState } from '../types/todoState';

interface TaskFormProps {
  task?: Task;
  onCancel: () => void;
  onSubmitSuccess?: () => void;
}

type FormData = CreateTaskDto;

export const TaskForm = ({ task, onCancel, onSubmitSuccess }: TaskFormProps) => {
  const { createTask, updateTask } = useTasks();
  const isEditMode = !!task;
  const [states, setStates] = useState<TodoState[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);

  // Load todo states
  useEffect(() => {
    const loadStates = async () => {
      try {
        const data = await todoStateApi.getAll();
        setStates(data.sort((a, b) => a.order - b.order));
      } catch (err) {
        console.error('Failed to load todo states:', err);
      } finally {
        setLoadingStates(false);
      }
    };
    loadStates();
  }, []);

  const defaultState = states.find(s => s.isDefault);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormData & { todoStateId?: number }>({
    defaultValues: task
      ? {
          title: task.title,
          description: task.description || '',
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
          priority: task.priority,
          todoStateId: task.todoStateId,
        }
      : {
          title: '',
          description: '',
          dueDate: '',
          priority: 1,
          todoStateId: defaultState?.id,
        },
  });

  useEffect(() => {
    if (task && states.length > 0) {
      reset({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        priority: task.priority,
        todoStateId: task.todoStateId,
      });
    }
  }, [task, states, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      // Format dueDate properly - only include if provided
      let dueDate: string | undefined = undefined;
      if (data.dueDate && data.dueDate.trim() !== '') {
        // Convert date to ISO string (YYYY-MM-DDTHH:mm:ssZ)
        // Parse the date string (YYYY-MM-DD) and convert to ISO
        const dateStr = data.dueDate.trim();
        const date = new Date(dateStr + 'T00:00:00');
        if (!isNaN(date.getTime())) {
          dueDate = date.toISOString();
        }
      }

      // Build task data, only including fields that have values
      const taskData: CreateTaskDto | UpdateTaskDto = {
        title: data.title.trim(),
        priority: data.priority,
      };

      // Only add description if it has a value
      if (data.description && data.description.trim() !== '') {
        taskData.description = data.description.trim();
      }

      // Only add dueDate if it was successfully parsed
      if (dueDate) {
        taskData.dueDate = dueDate;
      }

      // Add state if provided (or use default for new tasks)
      if (data.todoStateId) {
        taskData.todoStateId = data.todoStateId;
      } else if (!isEditMode && defaultState) {
        // For new tasks, use default state if none selected
        taskData.todoStateId = defaultState.id;
      }

      if (isEditMode && task) {
        await updateTask(task.id, taskData);
      } else {
        await createTask(taskData);
      }
      reset();
      onSubmitSuccess?.();
    } catch (error: any) {
      console.error('Error submitting task:', error);
      // Error is already handled in TaskContext and displayed via ErrorMessage component
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        {isEditMode ? 'Edit Task' : 'Create New Task'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            {...register('title', {
              required: 'Title is required',
              maxLength: { value: 200, message: 'Title must be less than 200 characters' },
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            {...register('description', {
              maxLength: { value: 1000, message: 'Description must be less than 1000 characters' },
            })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State
            </label>
            {loadingStates ? (
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                Loading states...
              </div>
            ) : (
              <select
                {...register('todoStateId', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.displayName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority *
            </label>
            <select
              {...register('priority', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Low</option>
              <option value={1}>Medium</option>
              <option value={2}>High</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

