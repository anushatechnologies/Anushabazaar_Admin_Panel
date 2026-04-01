import { useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Custom React Hook for deeply integrating the Light, Dark, and System theme system.
 * Syncs the current selection with `localStorage` and applies matching
 * `<theme>-theme` body classes for CSS Variables to detect effortlessly.
 */
export function useTheme(): [ThemeMode, (newTheme: ThemeMode) => void] {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // 1. Check local storage
    const savedTheme = localStorage.getItem('website-theme');
    // If they had 'light' previously, effortlessly upgrade them to 'system'
    if (savedTheme === 'light') return 'system';
    if (savedTheme && ['dark', 'system'].includes(savedTheme)) {
      return savedTheme as ThemeMode;
    }
    return 'system'; // Default back to system
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (currentTheme: ThemeMode, isSystemDark: boolean) => {
      document.body.classList.remove('light-theme', 'dark-theme');

      let effectiveTheme = currentTheme;
      if (currentTheme === 'system') {
        effectiveTheme = isSystemDark ? 'dark' : 'light';
      }

      document.body.classList.add(`${effectiveTheme}-theme`);
    };

    // Apply initially
    applyTheme(theme, mediaQuery.matches);
    localStorage.setItem('website-theme', theme);

    // Listener for system changes if strictly in 'system' mode
    const handler = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyTheme('system', e.matches);
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    // Smooth responsive document pop effect specifically requested
    document.body.style.transform = 'scale(0.99)';
    document.body.style.transition = 'transform 0.2s';
    setTimeout(() => {
      document.body.style.transform = 'scale(1)';
    }, 200);
  };

  return [theme, setTheme];
}
