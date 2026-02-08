import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AuthGuard } from './components/AuthGuard';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Loading handled by AuthGuard
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <AuthGuard>
      <TaskProvider>
        <Dashboard />
      </TaskProvider>
    </AuthGuard>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
