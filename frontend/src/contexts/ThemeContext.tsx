import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { userPreferencesApi } from '../services/userPreferencesApi';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Apply theme to DOM
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Apply initial theme immediately to prevent flash
  useEffect(() => {
    // Check localStorage first (for non-authenticated users or before preferences load)
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      setThemeState(storedTheme);
      applyTheme(storedTheme);
    } else {
      // Use system preference as initial theme
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setThemeState(systemTheme);
      applyTheme(systemTheme);
    }
  }, []);

  // Load theme from preferences on mount and when user changes
  useEffect(() => {
    const loadTheme = async () => {
      if (!user) {
        // For non-authenticated users, check localStorage or use system preference
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
          setThemeState(storedTheme);
          applyTheme(storedTheme);
        } else {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          setThemeState(systemTheme);
          applyTheme(systemTheme);
        }
        setIsLoading(false);
        return;
      }

      try {
        const preferences = await userPreferencesApi.get();
        const savedTheme = (preferences.theme || 'light') as Theme;
        console.log('Loaded theme from preferences:', savedTheme, 'Full preferences:', preferences);
        setThemeState(savedTheme);
        applyTheme(savedTheme);
        // Also save to localStorage as backup
        localStorage.setItem('theme', savedTheme);
      } catch (err) {
        console.error('Failed to load theme preferences:', err);
        // Use localStorage or system preference as fallback
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
          setThemeState(storedTheme);
          applyTheme(storedTheme);
        } else {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          setThemeState(systemTheme);
          applyTheme(systemTheme);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [user]);

  const setTheme = async (newTheme: Theme) => {
    console.log('Setting theme to:', newTheme);
    setThemeState(newTheme);
    applyTheme(newTheme);
    
    // Always save to localStorage immediately for instant UI update
    localStorage.setItem('theme', newTheme);
    console.log('Theme saved to localStorage:', newTheme);

    // Save to preferences (only if authenticated)
    if (user) {
      try {
        const updated = await userPreferencesApi.update({ theme: newTheme });
        console.log('Theme saved to preferences:', newTheme, 'Response:', updated);
        // Only update if the response has a valid theme and it's different
        // This prevents overwriting with null/undefined
        if (updated && updated.theme && (updated.theme === 'light' || updated.theme === 'dark')) {
          const responseTheme = updated.theme as Theme;
          if (responseTheme !== newTheme) {
            console.log('Response theme differs from requested, updating:', responseTheme);
            setThemeState(responseTheme);
            applyTheme(responseTheme);
            localStorage.setItem('theme', responseTheme);
          }
        }
      } catch (err) {
        console.error('Failed to save theme preference:', err);
        // Theme is already applied and saved to localStorage, so UI will still work
      }
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    await setTheme(newTheme);
  };

  if (isLoading) {
    return <>{children}</>; // Render children while loading to avoid flash
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

