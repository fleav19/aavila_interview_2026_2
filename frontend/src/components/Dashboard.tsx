import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { TaskList } from './TaskList';
import { TaskStats } from './TaskStats';
import { TodoStateList } from './TodoStateList';
import { ProjectList } from './ProjectList';
import { UserManagementList } from './UserManagementList';
import { OrganizationSettings } from './OrganizationSettings';
import { UserMenu } from './UserMenu';
import { Settings } from './Settings';
import { DevConsole } from './DevConsole';

export const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'Admin';
  const [showStatsSettings, setShowStatsSettings] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/users') return 'users';
    if (path === '/states') return 'states';
    if (path === '/projects') return 'projects';
    if (path === '/organization') return 'organization';
    return 'tasks'; // default
  };

  const activeTab = getActiveTab();

  // Handle tab navigation
  const handleTabChange = (tab: 'tasks' | 'users' | 'states' | 'projects' | 'organization') => {
    if (tab === 'tasks') {
      navigate('/tasks');
    } else if (tab === 'users' && isAdmin) {
      navigate('/users');
    } else if (tab === 'states' && isAdmin) {
      navigate('/states');
    } else if (tab === 'projects') {
      navigate('/projects');
    } else if (tab === 'organization' && isAdmin) {
      navigate('/organization');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('app.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('app.welcome')}, {user?.firstName} {user?.lastName}
            </p>
            {user?.organizationName && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                🏢 {user.organizationName}
              </p>
            )}
          </div>
          <UserMenu 
            onConfigureStats={() => setShowStatsSettings(true)}
            onOpenSettings={() => setShowSettings(true)}
          />
        </header>

        {/* Settings Modal */}
        {showSettings && (
          <div className="mb-6">
            <Settings onClose={() => setShowSettings(false)} />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => handleTabChange('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {t('nav.tasks')}
            </button>
            <button
              onClick={() => handleTabChange('projects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Projects
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => handleTabChange('users')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {t('nav.users')}
                </button>
                <button
                  onClick={() => handleTabChange('states')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'states'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {t('nav.todoStates')}
                </button>
                <button
                  onClick={() => handleTabChange('organization')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'organization'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  Organization
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'tasks' ? (
          <>
            <TaskStats showSettings={showStatsSettings} onSettingsClose={() => setShowStatsSettings(false)} />
            <TaskList />
          </>
        ) : activeTab === 'projects' ? (
          <ProjectList />
        ) : activeTab === 'users' ? (
          <UserManagementList />
        ) : activeTab === 'states' ? (
          <TodoStateList />
        ) : (
          <OrganizationSettings />
        )}

        {/* Dev Console (only shows if dev testing is enabled) */}
        <DevConsole />
      </div>
    </div>
  );
};

