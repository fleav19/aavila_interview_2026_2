export interface UserPreferences {
  visibleStats: string[];
  otherPreferences?: Record<string, any>;
}

export interface UpdateUserPreferences {
  visibleStats?: string[];
  otherPreferences?: Record<string, any>;
}

