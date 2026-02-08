import { useState, useEffect } from 'react';
import { userPreferencesApi } from '../services/userPreferencesApi';
import { todoStateApi } from '../services/todoStateApi';
import type { UserPreferences, UpdateUserPreferences } from '../types/userPreferences';
import type { TodoState } from '../types/todoState';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface StatsSettingsProps {
  onClose: () => void;
  onSave: () => Promise<void>;
}

const AVAILABLE_STATS = [
  { id: 'Total', label: 'Total', default: true },
  { id: 'High Priority', label: 'High Priority', default: true },
];

export const StatsSettings = ({ onClose, onSave }: StatsSettingsProps) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [states, setStates] = useState<TodoState[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStats, setSelectedStats] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [prefs, statesData] = await Promise.all([
          userPreferencesApi.get(),
          todoStateApi.getAll(),
        ]);
        setPreferences(prefs);
        setStates(statesData.sort((a, b) => a.order - b.order));
        
        // Initialize selected stats from preferences or defaults
        const defaultStats = AVAILABLE_STATS.filter(s => s.default).map(s => s.id);
        setSelectedStats(prefs.visibleStats?.length > 0 ? prefs.visibleStats : defaultStats);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggleStat = (statId: string) => {
    setSelectedStats(prev =>
      prev.includes(statId)
        ? prev.filter(id => id !== statId)
        : [...prev, statId]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const updateDto: UpdateUserPreferences = {
        visibleStats: selectedStats,
      };
      const updatedPrefs = await userPreferencesApi.update(updateDto);
      // Update local state with the response
      setPreferences(updatedPrefs);
      // Notify parent to reload preferences
      await onSave();
      onClose();
    } catch (err: any) {
      console.error('StatsSettings - Save error:', err);
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <LoadingSpinner message="Loading settings..." />
      </div>
    );
  }

  const allAvailableStats = [
    ...AVAILABLE_STATS,
    ...states.map(s => ({ id: s.displayName, label: s.displayName, default: false })),
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configure Stats Banner</h2>
        <button
          onClick={onClose}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Select which statistics to display in the stats banner at the top of your dashboard.
      </p>

      {error && <ErrorMessage message={error} />}

      <div className="space-y-3 mb-6">
        {allAvailableStats.map((stat) => (
          <label
            key={stat.id}
            className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer bg-white dark:bg-gray-800"
          >
            <input
              type="checkbox"
              checked={selectedStats.includes(stat.id)}
              onChange={() => handleToggleStat(stat.id)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-700 dark:text-gray-300">{stat.label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={saving || selectedStats.length === 0}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

