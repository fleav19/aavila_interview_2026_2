import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { projectApi } from '../services/projectApi';
import type { Project, CreateProjectDto, UpdateProjectDto } from '../types/project';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';

interface ProjectFormProps {
  project?: Project;
  onCancel: () => void;
  onSuccess?: () => void;
}

type FormData = CreateProjectDto;

export const ProjectForm = ({ project, onCancel, onSuccess }: ProjectFormProps) => {
  const isEditMode = !!project;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: project
      ? {
          name: project.name,
          description: project.description || '',
        }
      : {
          name: '',
          description: '',
        },
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || '',
      });
    }
  }, [project, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      setLoading(true);

      if (isEditMode && project) {
        const updateData: UpdateProjectDto = {
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
        };
        await projectApi.update(project.id, updateData);
      } else {
        const createData: CreateProjectDto = {
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
        };
        await projectApi.create(createData);
      }

      reset();
      onSuccess?.();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.response?.data?.errors
          ? Object.entries(err.response.data.errors)
              .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('; ')
          : 'Failed to save project';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        {isEditMode ? 'Edit Project' : 'Create New Project'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name *
          </label>
          <input
            type="text"
            {...register('name', {
              required: 'Name is required',
              maxLength: { value: 200, message: 'Name must be less than 200 characters' },
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="My Project"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            {...register('description', {
              maxLength: { value: 1000, message: 'Description must be less than 1000 characters' },
            })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Project description..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
          )}
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {loading || isSubmitting ? (
              <LoadingSpinner size="sm" message="" />
            ) : isEditMode ? (
              'Update Project'
            ) : (
              'Create Project'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

