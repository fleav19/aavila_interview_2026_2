import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { userManagementApi } from '../services/userManagementApi';
import type { UserManagement, UpdateUserDto } from '../types/userManagement';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';

interface UserManagementFormProps {
  user: UserManagement;
  onCancel: () => void;
  onSubmitSuccess?: () => void;
}

type FormData = UpdateUserDto;

export const UserManagementForm = ({ user, onCancel, onSubmitSuccess }: UserManagementFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const availableRoles = ['Admin', 'User', 'Viewer'];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    },
  });

  useEffect(() => {
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    });
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      setLoading(true);

      const updateData: UpdateUserDto = {
        firstName: data.firstName?.trim() || undefined,
        lastName: data.lastName?.trim() || undefined,
        role: data.role || undefined,
        isActive: data.isActive,
      };

      await userManagementApi.update(user.id, updateData);
      onSubmitSuccess?.();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.response?.data?.errors
          ? Object.entries(err.response.data.errors)
              .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('; ')
          : 'Failed to update user';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Edit User</h2>
      <div className="mb-4 text-sm text-gray-600">
        <p>Email: {user.email}</p>
        <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              {...register('firstName', {
                maxLength: { value: 100, message: 'First name must be less than 100 characters' },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={user.firstName}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              {...register('lastName', {
                maxLength: { value: 100, message: 'Last name must be less than 100 characters' },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={user.lastName}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              {...register('role', { required: 'Role is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('isActive')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">User is active</span>
            </label>
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
            ) : (
              'Update User'
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

