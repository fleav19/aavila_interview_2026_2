import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { todoStateApi } from '../services/todoStateApi';
import type { TodoState, CreateTodoStateDto, UpdateTodoStateDto } from '../types/todoState';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';

interface TodoStateFormProps {
  state?: TodoState;
  onCancel: () => void;
  onSubmitSuccess?: () => void;
}

type FormData = CreateTodoStateDto;

export const TodoStateForm = ({ state, onCancel, onSubmitSuccess }: TodoStateFormProps) => {
  const isEditMode = !!state;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: state
      ? {
          name: state.name,
          displayName: state.displayName,
          order: state.order,
          isDefault: state.isDefault,
          color: state.color || '',
          icon: state.icon || '',
        }
      : {
          name: '',
          displayName: '',
          order: 0,
          isDefault: false,
          color: '',
          icon: '',
        },
  });

  useEffect(() => {
    if (state) {
      reset({
        name: state.name,
        displayName: state.displayName,
        order: state.order,
        isDefault: state.isDefault,
        color: state.color || '',
        icon: state.icon || '',
      });
    }
  }, [state, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      setLoading(true);

      if (isEditMode && state) {
        const updateData: UpdateTodoStateDto = {
          name: data.name.trim(),
          displayName: data.displayName.trim(),
          order: data.order,
          isDefault: data.isDefault,
          color: data.color?.trim() || undefined,
          icon: data.icon?.trim() || undefined,
        };
        await todoStateApi.update(state.id, updateData);
      } else {
        const createData: CreateTodoStateDto = {
          name: data.name.trim(),
          displayName: data.displayName.trim(),
          order: data.order,
          isDefault: data.isDefault,
          color: data.color?.trim() || undefined,
          icon: data.icon?.trim() || undefined,
        };
        await todoStateApi.create(createData);
      }

      reset();
      onSubmitSuccess?.();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.response?.data?.errors
          ? Object.entries(err.response.data.errors)
              .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('; ')
          : 'Failed to save todo state';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">
        {isEditMode ? 'Edit Todo State' : 'Create New Todo State'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (internal) *
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'Name is required',
                maxLength: { value: 50, message: 'Name must be less than 50 characters' },
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: 'Name must be lowercase letters, numbers, and hyphens only',
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="active"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name *
            </label>
            <input
              type="text"
              {...register('displayName', {
                required: 'Display name is required',
                maxLength: { value: 100, message: 'Display name must be less than 100 characters' },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Active"
            />
            {errors.displayName && (
              <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order *
            </label>
            <input
              type="number"
              {...register('order', {
                required: 'Order is required',
                min: { value: 0, message: 'Order must be 0 or greater' },
                valueAsNumber: true,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.order && <p className="mt-1 text-sm text-red-600">{errors.order.message}</p>}
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('isDefault')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Set as default state</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color (hex)
            </label>
            <input
              type="text"
              {...register('color', {
                pattern: {
                  value: /^#[0-9A-Fa-f]{6}$/,
                  message: 'Color must be a valid hex code (e.g., #3B82F6)',
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#3B82F6"
            />
            {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon
            </label>
            <input
              type="text"
              {...register('icon', {
                maxLength: { value: 50, message: 'Icon must be less than 50 characters' },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="check-circle"
            />
            {errors.icon && <p className="mt-1 text-sm text-red-600">{errors.icon.message}</p>}
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading || isSubmitting ? (
              <LoadingSpinner size="sm" message="" />
            ) : isEditMode ? (
              'Update State'
            ) : (
              'Create State'
            )}
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

