export interface UserPreferences {
  visibleStats: string[];
  theme?: 'light' | 'dark';
  language?: string;
  otherPreferences?: Record<string, any>;
}

export interface UpdateUserPreferences {
  visibleStats?: string[];
  theme?: 'light' | 'dark';
  language?: string;
  otherPreferences?: Record<string, any>;
}

