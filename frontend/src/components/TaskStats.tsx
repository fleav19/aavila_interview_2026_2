import { useTasks } from '../contexts/TaskContext';
import { useState, useEffect } from 'react';
import { todoStateApi } from '../services/todoStateApi';
import { userPreferencesApi } from '../services/userPreferencesApi';
import { useTheme } from '../contexts/ThemeContext';
import type { TodoState } from '../types/todoState';
import type { UserPreferences } from '../types/userPreferences';
import { StatsSettings } from './StatsSettings';

interface TaskStatsProps {
  showSettings?: boolean;
  onSettingsClose?: () => void;
}

export const TaskStats = ({ showSettings: externalShowSettings, onSettingsClose }: TaskStatsProps = { showSettings: false }) => {
  const { stats } = useTasks();
  const { theme } = useTheme();
  const [states, setStates] = useState<TodoState[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [internalShowSettings, setInternalShowSettings] = useState(false);
  
  // Use external showSettings if provided, otherwise use internal state
  const showSettings = externalShowSettings !== undefined ? externalShowSettings : internalShowSettings;
  const setShowSettings = externalShowSettings !== undefined 
    ? (value: boolean) => { if (!value && onSettingsClose) onSettingsClose(); }
    : setInternalShowSettings;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statesData, prefs] = await Promise.all([
          todoStateApi.getAll(),
          userPreferencesApi.get().catch(() => null), // Fallback to null if preferences don't exist yet
        ]);
        setStates(statesData.sort((a, b) => a.order - b.order));
        setPreferences(prefs);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    loadData();
  }, []);

  // Get visible stats from preferences or use defaults
  const visibleStats = preferences?.visibleStats || ['Total', 'High Priority'];

  if (!stats) return null;

  // Ensure stateCounts exists - handle both camelCase and PascalCase, or if it's missing
  const stateCounts = stats.stateCounts || (stats as any).StateCounts || {};

  // Helper function to convert hex to rgba with opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Build all available stats with dark mode support
  const isDark = theme === 'dark';
  const coreStats = [
    { 
      id: 'Total', 
      label: 'Total', 
      value: stats.total, 
      bgColor: isDark ? '#374151' : '#F3F4F6', 
      textColor: isDark ? '#F9FAFB' : '#1F2937' 
    },
    { 
      id: 'High Priority', 
      label: 'High Priority', 
      value: stats.highPriority, 
      bgColor: isDark ? '#7F1D1D' : '#FEE2E2', 
      textColor: isDark ? '#FCA5A5' : '#991B1B' 
    },
  ];

  // Build state stats list from ALL states, including those with 0 tasks
  // This ensures selected stats always show, even if they have 0 tasks
  const stateStatsList = states.map(state => {
    const count = stateCounts[state.displayName] || 0;
    const stateColor = state.color || '#6B7280';
    
    // For dark mode, use the state color as background with white text
    // For light mode, use transparent background with state color as text
    return {
      id: state.displayName,
      label: state.displayName,
      value: count,
      bgColor: isDark ? stateColor : stateColor, // Will be handled in rendering
      textColor: isDark ? '#FFFFFF' : stateColor, // White text in dark mode for contrast
      originalColor: stateColor, // Keep original for border
    };
  });

  // Filter to only show selected stats, maintaining order
  const allAvailableStats = [...coreStats, ...stateStatsList];
  const allStats = visibleStats
    .map(statId => allAvailableStats.find(s => s.id === statId))
    .filter((s): s is typeof allAvailableStats[0] => s !== undefined);

  const handleCloseSettings = () => {
    if (externalShowSettings !== undefined && onSettingsClose) {
      onSettingsClose();
    } else {
      setInternalShowSettings(false);
    }
  };

  const handleSettingsSave = async () => {
    // Reload preferences immediately after save
    try {
      const updatedPrefs = await userPreferencesApi.get();
      setPreferences(updatedPrefs);
      // Force a small delay to ensure state update propagates
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.error('Failed to reload preferences:', err);
    }
  };

  return (
    <div className="mb-6">
      {showSettings ? (
        <StatsSettings
          onClose={handleCloseSettings}
          onSave={handleSettingsSave}
        />
      ) : (
        <>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {allStats.map((item) => {
        // Check if this is a state stat (has originalColor) or core stat
        const itemWithOriginal = item as typeof item & { originalColor?: string };
        const isStateStat = !!itemWithOriginal.originalColor;
        const originalColor = itemWithOriginal.originalColor || item.bgColor;
        
        // For dark mode:
        // - Core stats: solid darker backgrounds with light text
        // - State stats: use original color as solid background with white text
        // For light mode:
        // - Core stats: transparent backgrounds with dark text
        // - State stats: transparent backgrounds with state color text
        let bgColor: string;
        let textColor: string;
        let borderColor: string;
        
        if (isStateStat) {
          // State stat card
          if (isDark) {
            bgColor = originalColor; // Solid state color background
            textColor = '#FFFFFF'; // White text for contrast
            borderColor = hexToRgba(originalColor, 0.8); // Slightly transparent border
          } else {
            bgColor = hexToRgba(originalColor, 0.1); // Light transparent background
            textColor = originalColor; // State color text
            borderColor = originalColor; // State color border
          }
        } else {
          // Core stat card (Total, High Priority)
          if (isDark) {
            bgColor = item.bgColor; // Already set to dark mode color
            textColor = item.textColor; // Already set to light color
            borderColor = hexToRgba(item.bgColor, 0.5);
          } else {
            bgColor = hexToRgba(item.bgColor, 0.1);
            textColor = item.textColor;
            borderColor = item.bgColor;
          }
        }
        
        return (
          <div
            key={item.label}
            className="p-4 rounded-lg shadow-sm text-center border"
            style={{
              backgroundColor: bgColor,
              borderColor: borderColor,
              color: textColor,
            }}
          >
            <div className="text-2xl font-bold" style={{ color: textColor }}>
              {item.value}
            </div>
            <div className="text-sm mt-1 font-medium" style={{ color: textColor }}>
              {item.label}
            </div>
          </div>
        );
      })}
          </div>
        </>
      )}
    </div>
  );
};

