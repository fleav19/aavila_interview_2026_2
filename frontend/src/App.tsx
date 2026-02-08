import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/I18nContext';
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
      <I18nProvider>
        <TaskProvider>
          <Dashboard />
        </TaskProvider>
      </I18nProvider>
    </AuthGuard>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <I18nProvider>
          <AppContent />
        </I18nProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
