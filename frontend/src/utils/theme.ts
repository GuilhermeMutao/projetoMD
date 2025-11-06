export type Theme = 'light' | 'dark';

export const themes = {
  light: {
    background: '#fafafa',
    surface: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    border: '#e0e0e0',
    primary: '#2196F3',
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#ff6b6b',
    hover: '#f5f5f5',
    code: '#f0f0f0',
    codeBg: '#f0f0f0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    background: '#0f0f0f',
    surface: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#e0e0e0',
    textTertiary: '#cccccc',
    border: '#404040',
    primary: '#64B5F6',
    success: '#66BB6A',
    warning: '#FFA726',
    danger: '#EF5350',
    hover: '#2a2a2a',
    code: '#0d0d0d',
    codeBg: '#0d0d0d',
    shadow: 'rgba(0, 0, 0, 0.6)',
  },
};

export const getTheme = (theme: Theme) => themes[theme];

export const toggleTheme = (current: Theme): Theme => {
  return current === 'light' ? 'dark' : 'light';
};

export const saveThemePreference = (theme: Theme) => {
  localStorage.setItem('mdproject_theme', theme);
};

export const getThemePreference = (): Theme => {
  const saved = localStorage.getItem('mdproject_theme') as Theme | null;
  if (saved) return saved;

  // Detectar preferência do sistema
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};
