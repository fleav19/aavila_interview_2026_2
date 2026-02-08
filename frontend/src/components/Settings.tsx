import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import { userPreferencesApi } from '../services/userPreferencesApi';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';

interface SettingsProps {
  onClose: () => void;
}

export const Settings = ({ onClose }: SettingsProps) => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, availableLanguages, t } = useI18n();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    try {
      setSaving(true);
      setError(null);
      console.log('Settings: Changing theme to', newTheme);
      await setTheme(newTheme);
      console.log('Settings: Theme changed successfully');
    } catch (err: any) {
      console.error('Settings: Error changing theme', err);
      setError(err.response?.data?.message || 'Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    try {
      setSaving(true);
      setError(null);
      await setLanguage(newLanguage as any);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save language');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('settings.title')}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="space-y-6">
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('settings.theme')}
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => handleThemeChange('light')}
              disabled={saving || theme === 'light'}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="font-medium">{t('settings.theme.light')}</span>
              </div>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              disabled={saving || theme === 'dark'}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="font-medium">{t('settings.theme.dark')}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('settings.language')}
          </label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={saving}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {availableLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {saving && (
          <div className="flex items-center justify-center py-2">
            <LoadingSpinner size="sm" message="" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{t('common.loading')}</span>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {t('common.save')}
        </button>
      </div>
    </div>
  );
};

