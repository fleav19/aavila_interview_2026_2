import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTasks } from '../contexts/TaskContext';
import { todoStateApi } from '../services/todoStateApi';
import { usersApi } from '../services/usersApi';
import { projectApi } from '../services/projectApi';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';
import type { TodoState } from '../types/todoState';
import type { Project } from '../types/project';

interface TaskFormProps {
  task?: Task;
  onCancel: () => void;
  onSubmitSuccess?: () => void;
}

type TaskFormData = CreateTaskDto;

export const TaskForm = ({ task, onCancel, onSubmitSuccess }: TaskFormProps) => {
  const { createTask, updateTask } = useTasks();
  // isEditMode is true only if task exists AND has a valid id (not 0, which indicates new subtask)
  const isEditMode = !!task && task.id > 0;
  const [states, setStates] = useState<TodoState[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [users, setUsers] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Load todo states, users, and projects
  useEffect(() => {
    const loadData = async () => {
      try {
        const [statesData, usersData, projectsData] = await Promise.all([
          todoStateApi.getAll(),
          usersApi.getForAssignment(), // All authenticated users can get users for assignment
          projectApi.getAll(),
        ]);
        setStates(statesData.sort((a, b) => a.order - b.order));
        setUsers(usersData.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` })));
        setProjects(projectsData);
      } catch (err) {
        console.error('Failed to load todo states, users, or projects:', err);
      } finally {
        setLoadingStates(false);
        setLoadingUsers(false);
        setLoadingProjects(false);
      }
    };
    loadData();
  }, []);

  const defaultState = states.find(s => s.isDefault);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<TaskFormData & { todoStateId?: number; assignedToId?: number | null; projectId?: number | null; parentTaskId?: number | null; dueDate?: string }>({
    mode: 'onChange', // Validate on change for real-time feedback
    reValidateMode: 'onChange', // Re-validate on change
    defaultValues: task
      ? {
          title: task.title,
          description: task.description || '',
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
          priority: task.priority,
          todoStateId: task.todoStateId,
          assignedToId: task.assignedToId || null,
          projectId: task.projectId || null,
          parentTaskId: task.parentTaskId || null,
        }
      : {
          title: '',
          description: '',
          dueDate: '',
          priority: 1,
          todoStateId: defaultState?.id,
          assignedToId: null,
          projectId: null,
          parentTaskId: task?.parentTaskId || null, // Allow creating subtask from TaskDetail
        },
  });

  const titleValue = watch('title');
  const descriptionValue = watch('description');
  const dueDateValue = watch('dueDate');

  useEffect(() => {
    if (task && states.length > 0) {
      reset({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        priority: task.priority,
        todoStateId: task.todoStateId,
        assignedToId: task.assignedToId || null,
        projectId: task.projectId || null,
        parentTaskId: task.parentTaskId || null,
      });
    } else if (task && task.parentTaskId && !task.id) {
      // Creating a new subtask (task has parentTaskId but no id)
      reset({
        title: '',
        description: '',
        dueDate: '',
        priority: 1,
        todoStateId: defaultState?.id,
        assignedToId: null,
        projectId: task.projectId || null, // Inherit project from parent
        parentTaskId: task.parentTaskId,
      });
    }
  }, [task, states, reset, defaultState]);

  const onSubmit = async (data: TaskFormData) => {
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

      // Add assignee if provided
      if (data.assignedToId !== undefined) {
        taskData.assignedToId = data.assignedToId || null;
      }

      // Add project if provided
      if (data.projectId !== undefined) {
        taskData.projectId = data.projectId || null;
      }

      // Add parentTaskId if provided (only for new tasks, or when explicitly changing)
      if (!isEditMode && data.parentTaskId) {
        taskData.parentTaskId = data.parentTaskId;
      } else if (isEditMode && task && data.parentTaskId !== undefined) {
        // Allow removing parent (making it a top-level task) or changing parent
        taskData.parentTaskId = data.parentTaskId || null;
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
        {isEditMode ? 'Edit Task' : task?.parentTaskId ? 'Create New Subtask' : 'Create New Task'}
      </h2>
      {!isEditMode && task?.parentTaskId && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📋 Creating a subtask for: <strong>{task.title || 'Parent Task'}</strong>
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 1, message: 'Title cannot be empty' },
              maxLength: { value: 200, message: 'Title must be less than 200 characters' },
              validate: {
                notWhitespace: (value) => {
                  if (!value || value.trim().length === 0) {
                    return 'Title cannot be only whitespace';
                  }
                  return true;
                },
              },
            })}
            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors ${
              errors.title
                ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
            placeholder="Enter task title..."
          />
          <div className="flex justify-between items-center mt-1">
            {errors.title ? (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {titleValue?.trim().length || 0} / 200 characters
              </p>
            )}
          </div>
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
            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors ${
              errors.description
                ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
            placeholder="Enter task description (optional)..."
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description ? (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {descriptionValue?.length || 0} / 1000 characters
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              Project
            </label>
            {loadingProjects ? (
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                Loading projects...
              </div>
            ) : (
              <select
                {...register('projectId', { 
                  setValueAs: (value) => value === '' || value === 'none' ? null : Number(value)
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">No Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignee
            </label>
            {loadingUsers ? (
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                Loading users...
              </div>
            ) : (
              <select
                {...register('assignedToId', { 
                  setValueAs: (value) => value === '' || value === 'none' ? null : Number(value)
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
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
              {...register('dueDate', {
                validate: {
                  notPast: (value) => {
                    if (!value) return true; // Optional field
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate < today) {
                      return 'Due date cannot be in the past';
                    }
                    return true;
                  },
                  validDate: (value) => {
                    if (!value) return true; // Optional field
                    const date = new Date(value);
                    return !isNaN(date.getTime()) || 'Please enter a valid date';
                  },
                },
              })}
              min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates in date picker
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                errors.dueDate
                  ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dueDate.message}</p>
            )}
            {dueDateValue && !errors.dueDate && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Due: {new Date(dueDateValue).toLocaleDateString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              {...register('priority', { 
                required: 'Priority is required',
                valueAsNumber: true,
              })}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                errors.priority
                  ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
            >
              <option value={0}>Low</option>
              <option value={1}>Medium</option>
              <option value={2}>High</option>
            </select>
            {errors.priority && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.priority.message}</p>
            )}
          </div>
        </div>

        {/* Validation Summary - Only show if there are errors and user has interacted */}
        {Object.keys(errors).length > 0 && Object.keys(touchedFields).length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
              Please fix the following errors:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
              {errors.title && <li>{errors.title.message}</li>}
              {errors.description && <li>{errors.description.message}</li>}
              {errors.dueDate && <li>{errors.dueDate.message}</li>}
              {errors.priority && <li>{errors.priority.message}</li>}
            </ul>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || (!isEditMode && (!isValid || !titleValue?.trim()))}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : isEditMode ? (
              'Update Task'
            ) : (
              'Create Task'
            )}
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


