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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);

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

  const handleDragStart = (index: number) => {
    if (!isAdmin) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isAdmin || draggedIndex === null) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    if (!isAdmin || draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    e.preventDefault();

    // Reorder states locally
    const newStates = [...states];
    const [draggedState] = newStates.splice(draggedIndex, 1);
    newStates.splice(dropIndex, 0, draggedState);
    setStates(newStates);

    // Update order in backend
    try {
      setIsReordering(true);
      const stateIds = newStates.map(s => s.id);
      await todoStateApi.reorder(stateIds);
      await fetchStates(); // Refresh to get updated order
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to reorder states';
      alert(errorMsg);
      await fetchStates(); // Revert on error
    } finally {
      setIsReordering(false);
      setDraggedIndex(null);
      setDragOverIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (loading && states.length === 0) {
    return <LoadingSpinner message="Loading todo states..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Todo States</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage workflow states for your organization</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
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
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No todo states configured yet.</p>
              {isAdmin && (
                <p className="text-gray-400 dark:text-gray-500 mt-2">Create your first state to get started.</p>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              {isAdmin && states.length > 1 && (
                <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 Drag and drop states to reorder them
                  </p>
                </div>
              )}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {states.map((state, index) => (
                  <div
                    key={state.id}
                    draggable={isAdmin && !isReordering}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`px-6 py-4 flex items-center justify-between transition-colors ${
                      draggedIndex === index
                        ? 'opacity-50 bg-gray-100 dark:bg-gray-700'
                        : dragOverIndex === index
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    } ${isAdmin && !isReordering ? 'cursor-move' : ''}`}
                  >
                    <div className="flex items-center flex-1">
                      {isAdmin && !isReordering && (
                        <div className="mr-4 text-gray-400 dark:text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                        </div>
                      )}
                      {state.color && (
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: state.color }}
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {state.displayName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{state.name}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Order: <span className="font-medium text-gray-900 dark:text-gray-100">{state.order}</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Tasks: <span className="font-medium text-gray-900 dark:text-gray-100">{state.taskCount}</span>
                        </div>
                        {state.isDefault && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-3 ml-4">
                        <button
                          onClick={() => handleEdit(state)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm font-medium"
                          disabled={isReordering}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(state.id, state.displayName)}
                          disabled={state.taskCount > 0 || isReordering}
                          className={`text-sm font-medium ${
                            state.taskCount > 0 || isReordering
                              ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              : 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300'
                          }`}
                          title={
                            state.taskCount > 0
                              ? 'Cannot delete state with active tasks'
                              : 'Delete state'
                          }
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {isReordering && (
                <div className="px-6 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Saving new order...
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

