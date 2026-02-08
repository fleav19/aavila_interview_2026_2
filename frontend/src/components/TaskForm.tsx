import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTasks } from '../contexts/TaskContext';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';

interface TaskFormProps {
  task?: Task;
  onCancel: () => void;
  onSubmitSuccess?: () => void;
}

type FormData = CreateTaskDto;

export const TaskForm = ({ task, onCancel, onSubmitSuccess }: TaskFormProps) => {
  const { createTask, updateTask } = useTasks();
  const isEditMode = !!task;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: task
      ? {
          title: task.title,
          description: task.description || '',
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
          priority: task.priority,
        }
      : {
          title: '',
          description: '',
          dueDate: '',
          priority: 1,
        },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        priority: task.priority,
      });
    }
  }, [task, reset]);

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
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">
        {isEditMode ? 'Edit Task' : 'Create New Task'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            {...register('title', {
              required: 'Title is required',
              maxLength: { value: 200, message: 'Title must be less than 200 characters' },
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description', {
              maxLength: { value: 1000, message: 'Description must be less than 1000 characters' },
            })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority *
            </label>
            <select
              {...register('priority', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

