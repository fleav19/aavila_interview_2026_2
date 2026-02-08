import { useAuth } from '../contexts/AuthContext';
import { TaskList } from './TaskList';
import { TaskStats } from './TaskStats';

export const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Todo App</h1>
            <p className="text-gray-600">
              Welcome, {user?.firstName} {user?.lastName} ({user?.role})
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </header>

        <TaskStats />
        <TaskList />
      </div>
    </div>
  );
};

