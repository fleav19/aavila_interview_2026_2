import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { authService } from '../services/authApi';
import type { AuthResponse } from '../types/auth';

export const DevConsole = () => {
  const { user, token } = useAuth();
  const [isDevTesting, setIsDevTesting] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState(user?.role || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if dev testing is enabled
    const checkDevSettings = async () => {
      try {
        const response = await api.get('/users/dev-settings');
        setIsDevTesting(response.data.isDevTesting);
        setAvailableRoles(response.data.availableRoles || []);
      } catch (err) {
        // Dev settings not available - hide console
        setIsDevTesting(false);
      }
    };

    checkDevSettings();
  }, []);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleRoleChange = async () => {
    if (selectedRole === user?.role) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>('/users/me/role', { role: selectedRole });
      
      // Update auth context with new token and user
      localStorage.setItem('todo_auth_token', response.data.token);
      localStorage.setItem('todo_user', JSON.stringify(response.data.user));
      
      // Reload page to refresh auth context
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  if (!isDevTesting) {
    return null;
  }

  return (
    <>
      {/* Toggle Button - Fixed position */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors z-50"
        title="Dev Console"
      >
        {isOpen ? '▼' : '⚙️'} Dev
      </button>

      {/* Console Panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 w-96 bg-white border-2 border-purple-500 rounded-lg shadow-2xl z-50">
          <div className="bg-purple-600 text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">Dev Console</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current User: {user?.firstName} {user?.lastName}
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Role: <span className="font-bold text-blue-600">{user?.role}</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Change Role:
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleRoleChange}
              disabled={loading || selectedRole === user?.role}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update Role'}
            </button>

            <div className="text-xs text-gray-500 pt-2 border-t">
              <p>⚠️ Dev Testing Mode</p>
              <p>This console is only visible in development.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

