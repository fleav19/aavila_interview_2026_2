import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TaskList } from './TaskList';
import { TaskStats } from './TaskStats';
import { TodoStateList } from './TodoStateList';
import { UserManagementList } from './UserManagementList';
import { UserMenu } from './UserMenu';
import { DevConsole } from './DevConsole';

export const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [activeTab, setActiveTab] = useState<'tasks' | 'users' | 'states'>('tasks');
  const [showStatsSettings, setShowStatsSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Todo App</h1>
            <p className="text-gray-600">
              Welcome, {user?.firstName} {user?.lastName}
            </p>
          </div>
          <UserMenu onConfigureStats={() => setShowStatsSettings(true)} />
        </header>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tasks
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('states')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'states'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Todo States
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
        ) : activeTab === 'users' ? (
          <UserManagementList />
        ) : (
          <TodoStateList />
        )}

        {/* Dev Console (only shows if dev testing is enabled) */}
        <DevConsole />
      </div>
    </div>
  );
};

