import { KanbanTheme } from './types';

export const defaultTheme: KanbanTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    background: '#f8fafc',
    cardBackground: '#ffffff',
    columnBackground: '#f1f5f9',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
  borderRadius: '0.5rem',
  shadows: {
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    column: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

export const darkTheme: KanbanTheme = {
  colors: {
    primary: '#60a5fa',
    secondary: '#9ca3af',
    background: '#111827',
    cardBackground: '#1f2937',
    columnBackground: '#374151',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    border: '#4b5563',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
  },
  borderRadius: '0.5rem',
  shadows: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    column: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

export const colorfulTheme: KanbanTheme = {
  colors: {
    primary: '#8b5cf6',
    secondary: '#06b6d4',
    background: '#fef3c7',
    cardBackground: '#ffffff',
    columnBackground: '#fde68a',
    text: '#374151',
    textSecondary: '#6b7280',
    border: '#f59e0b',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
  borderRadius: '1rem',
  shadows: {
    card: '0 4px 6px -1px rgba(139, 92, 246, 0.1), 0 2px 4px -1px rgba(139, 92, 246, 0.06)',
    column: '0 10px 15px -3px rgba(245, 158, 11, 0.1), 0 4px 6px -2px rgba(245, 158, 11, 0.05)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

export const mergeTheme = (baseTheme: KanbanTheme, customTheme?: Partial<KanbanTheme>): KanbanTheme => {
  if (!customTheme) return baseTheme;

  return {
    colors: { ...baseTheme.colors, ...customTheme.colors },
    borderRadius: customTheme.borderRadius || baseTheme.borderRadius,
    shadows: { ...baseTheme.shadows, ...customTheme.shadows },
    spacing: { ...baseTheme.spacing, ...customTheme.spacing },
  };
};