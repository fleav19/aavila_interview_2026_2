import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { taskApi } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import type { AdvancedStats, UserTaskStats, TrendDataPoint } from '../types/advancedStats';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

export const AdvancedStats = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState<AdvancedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState<'byUser' | 'trends' | 'byState'>('byUser');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskApi.getAdvancedStats(days);
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load advanced statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchStats();
    }
  }, [days, user?.role]);

  if (user?.role !== 'Admin') {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">Advanced statistics are only available to administrators.</p>
      </div>
    );
  }

  if (loading && !stats) {
    return <LoadingSpinner message="Loading advanced statistics..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!stats) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const maxTrendValue = Math.max(
    ...stats.trends.map(t => Math.max(t.tasksCreated, t.tasksCompleted, t.totalTasks)),
    1
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Statistics</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Detailed analytics by user, trends, and state</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Days:
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="ml-2 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </label>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('byUser')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'byUser'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            By User
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'trends'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Trends
          </button>
          <button
            onClick={() => setActiveTab('byState')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'byState'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            By State
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'byUser' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    High Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(stats.byUser).map(([userName, userStats]) => {
                  const completionRate = userStats.totalTasks > 0
                    ? ((userStats.completedTasks / userStats.totalTasks) * 100).toFixed(1)
                    : '0.0';
                  return (
                    <tr key={userStats.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{userName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{userStats.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {userStats.totalTasks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {userStats.completedTasks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {userStats.activeTasks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {userStats.highPriorityTasks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-gray-100">{completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Creation & Completion Trends</h3>
            <div className="space-y-4">
              {stats.trends.map((trend, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(trend.date)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400 w-20">Created:</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div
                          className="bg-green-500 h-4 rounded-full"
                          style={{ width: `${(trend.tasksCreated / maxTrendValue) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-900 dark:text-gray-100 w-8">{trend.tasksCreated}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400 w-20">Completed:</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div
                          className="bg-blue-500 h-4 rounded-full"
                          style={{ width: `${(trend.tasksCompleted / maxTrendValue) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-900 dark:text-gray-100 w-8">{trend.tasksCompleted}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400 w-20">Total:</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div
                          className="bg-gray-500 h-4 rounded-full"
                          style={{ width: `${(trend.totalTasks / maxTrendValue) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-900 dark:text-gray-100 w-8">{trend.totalTasks}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'byState' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Task Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(stats.byState)
                  .sort(([, a], [, b]) => b - a)
                  .map(([stateName, count]) => {
                    const total = Object.values(stats.byState).reduce((sum, c) => sum + c, 0);
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={stateName} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{stateName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-gray-100">{percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

