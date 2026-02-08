import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { organizationApi } from '../services/organizationApi';
import type { Organization, UpdateOrganizationDto } from '../types/organization';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { formatDate } from '../utils/helpers';

interface OrganizationSettingsProps {
  onClose?: () => void;
}

export const OrganizationSettings = ({ onClose }: OrganizationSettingsProps) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateOrganizationDto>({
    defaultValues: {
      name: '',
      slug: '',
      isActive: true,
    },
  });

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await organizationApi.get();
        setOrganization(data);
        reset({
          name: data.name,
          slug: data.slug,
          isActive: data.isActive,
        });
      } catch (err: any) {
        console.error('Error loading organization:', err);
        let errorMessage = 'Failed to load organization';
        if (err.response?.status === 403) {
          errorMessage = 'Access denied. Admin role required.';
        } else if (err.response?.status === 401) {
          errorMessage = 'Unauthorized. Please login again.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadOrganization();
  }, [reset]);

  const onSubmit = async (data: UpdateOrganizationDto) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      const updated = await organizationApi.update(data);
      setOrganization(updated);
      setSuccessMessage('Organization updated successfully!');
      // Reset form with new values
      reset({
        name: updated.name,
        slug: updated.slug,
        isActive: updated.isActive,
      });
    } catch (err: any) {
      console.error('Error updating organization:', err);
      let errorMessage = 'Failed to update organization';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMessage = `Validation failed: ${Object.entries(errors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ')}`;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading organization settings..." />;
  }

  if (error && !organization) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <ErrorMessage message={error} />
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Organization Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your organization's information and view statistics.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-green-800 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      {organization && (
        <>
          {/* Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{organization.userCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Users</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{organization.taskCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Tasks</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{organization.activeTaskCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Tasks</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{organization.todoStateCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Todo States</div>
              </div>
            </div>
          </div>

          {/* SSO Integration Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SSO Integration</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">Coming Soon</p>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    You can integrate with your organization's SSO (Single Sign-On) provider to enable seamless authentication for your team members.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Organization Information */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Organization Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', {
                      required: 'Organization name is required',
                      minLength: { value: 1, message: 'Name must be at least 1 character' },
                      maxLength: { value: 200, message: 'Name must be less than 200 characters' },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Slug (optional)
                  </label>
                  <input
                    type="text"
                    {...register('slug', {
                      maxLength: { value: 100, message: 'Slug must be less than 100 characters' },
                      pattern: {
                        value: /^[a-z0-9-]+$/,
                        message: 'Slug must contain only lowercase letters, numbers, and hyphens',
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="organization-slug"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    URL-friendly identifier (lowercase letters, numbers, and hyphens only)
                  </p>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Organization is active</span>
                  </label>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p><strong>Created:</strong> {formatDate(organization.createdAt)}</p>
                  <p><strong>Last Updated:</strong> {formatDate(organization.updatedAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </div>
  );
};

