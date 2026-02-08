import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/I18nContext';
import { TaskProvider } from './contexts/TaskContext';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ProtectedRoute, AdminRoute } from './routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <I18nProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />

              {/* Protected routes */}
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <TaskProvider>
                      <Dashboard />
                    </TaskProvider>
                  </ProtectedRoute>
                }
              />

              {/* Admin-only routes */}
              <Route
                path="/users"
                element={
                  <AdminRoute>
                    <TaskProvider>
                      <Dashboard />
                    </TaskProvider>
                  </AdminRoute>
                }
              />

              <Route
                path="/states"
                element={
                  <AdminRoute>
                    <TaskProvider>
                      <Dashboard />
                    </TaskProvider>
                  </AdminRoute>
                }
              />

              <Route
                path="/organization"
                element={
                  <AdminRoute>
                    <TaskProvider>
                      <Dashboard />
                    </TaskProvider>
                  </AdminRoute>
                }
              />

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </I18nProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
