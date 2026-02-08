import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { todoStateApi } from '../services/todoStateApi';
import type { TodoState } from '../types/todoState';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { TodoStateForm } from './TodoStateForm';

export const TodoStateList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [states, setStates] = useState<TodoState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingState, setEditingState] = useState<TodoState | undefined>(undefined);

  const fetchStates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoStateApi.getAll();
      setStates(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load todo states');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const handleEdit = (state: TodoState) => {
    setEditingState(state);
    setShowForm(true);
  };

  const handleDelete = async (id: number, displayName: string) => {
    if (!confirm(`Are you sure you want to delete the state "${displayName}"? This action cannot be undone if tasks are using this state.`)) {
      return;
    }

    try {
      await todoStateApi.delete(id);
      await fetchStates();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete state';
      alert(errorMsg);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingState(undefined);
    fetchStates();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingState(undefined);
  };

  if (loading && states.length === 0) {
    return <LoadingSpinner message="Loading todo states..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Todo States</h2>
          <p className="text-gray-600 mt-1">Manage workflow states for your organization</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            + New State
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      {showForm ? (
        <TodoStateForm
          state={editingState}
          onCancel={handleCancel}
          onSubmitSuccess={handleFormSuccess}
        />
      ) : (
        <>
          {states.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-lg">No todo states configured yet.</p>
              {isAdmin && (
                <p className="text-gray-400 mt-2">Create your first state to get started.</p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      State
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Default
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {states.map((state) => (
                    <tr key={state.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {state.color && (
                            <div
                              className="w-4 h-4 rounded-full mr-3"
                              style={{ backgroundColor: state.color }}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {state.displayName}
                            </div>
                            <div className="text-sm text-gray-500">{state.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {state.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {state.taskCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {state.isDefault && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(state)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(state.id, state.displayName)}
                            disabled={state.taskCount > 0}
                            className={`${
                              state.taskCount > 0
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-red-600 hover:text-red-900'
                            }`}
                            title={
                              state.taskCount > 0
                                ? 'Cannot delete state with active tasks'
                                : 'Delete state'
                            }
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

