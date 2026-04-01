import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  name: string;
  bg: string;
  shell: string;
  cardBg: string;
  cardBgElevated: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentStrong: string;
  accentGradient: string;
  border: string;
  borderStrong: string;
  shadow: string;
  shadowSoft: string;
  glow: string;
  inputBg: string;
  chipBg: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  sidebarBg: string;
  sidebarEdge: string;
  headerBg: string;
  headerBorder: string;
}

const lightTheme: ThemeColors = {
  name: 'Light',
  bg: 'radial-gradient(circle at top left, #fff8eb 0%, #f6fbff 28%, #eef4ff 62%, #f8fafc 100%)',
  shell: '#f3f7fb',
  cardBg: 'rgba(255,255,255,0.86)',
  cardBgElevated: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textTertiary: '#94a3b8',
  accent: '#2563eb',
  accentStrong: '#1e40af',
  accentGradient: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 52%, #14b8a6 100%)',
  border: 'rgba(148,163,184,0.18)',
  borderStrong: 'rgba(100,116,139,0.24)',
  shadow: '0 24px 60px rgba(37,99,235,0.1)',
  shadowSoft: '0 12px 30px rgba(15,23,42,0.08)',
  glow: 'rgba(37,99,235,0.16)',
  inputBg: 'rgba(255,255,255,0.9)',
  chipBg: 'rgba(37,99,235,0.08)',
  success: '#059669',
  error: '#dc2626',
  warning: '#d97706',
  info: '#0284c7',
  sidebarBg: 'linear-gradient(180deg, #0f2f86 0%, #1743b3 38%, #2563eb 100%)',
  sidebarEdge: 'rgba(96,165,250,0.18)',
  headerBg: 'rgba(255,255,255,0.88)',
  headerBorder: 'rgba(148,163,184,0.16)',
};

const darkTheme: ThemeColors = {
  name: 'Dark',
  bg: 'radial-gradient(circle at top left, #155e75 0%, #0a1022 28%, #070b16 62%, #020617 100%)',
  shell: '#060b17',
  cardBg: 'rgba(10,16,34,0.8)',
  cardBgElevated: 'rgba(15,23,42,0.9)',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textTertiary: '#64748b',
  accent: '#22d3ee',
  accentStrong: '#06b6d4',
  accentGradient: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 48%, #a855f7 100%)',
  border: 'rgba(56,189,248,0.18)',
  borderStrong: 'rgba(125,211,252,0.3)',
  shadow: '0 24px 60px rgba(2,8,23,0.55)',
  shadowSoft: '0 16px 30px rgba(2,8,23,0.42)',
  glow: 'rgba(34,211,238,0.26)',
  inputBg: 'rgba(15,23,42,0.86)',
  chipBg: 'rgba(34,211,238,0.12)',
  success: '#10b981',
  error: '#fb7185',
  warning: '#f59e0b',
  info: '#38bdf8',
  sidebarBg: 'linear-gradient(180deg, rgba(2,6,23,0.98) 0%, rgba(8,15,35,0.98) 100%)',
  sidebarEdge: 'rgba(34,211,238,0.2)',
  headerBg: 'rgba(2,6,23,0.7)',
  headerBorder: 'rgba(34,211,238,0.14)',
};

const systemLightTheme: ThemeColors = {
  ...lightTheme,
  name: 'System',
};

const systemDarkTheme: ThemeColors = {
  ...darkTheme,
  name: 'System',
};

interface ThemeContextType {
  theme: ThemeMode;
  currentTheme: ThemeColors;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  effectiveMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('app-theme') as ThemeMode | null;
    return saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => setSystemIsDark(event.matches);

    setSystemIsDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const effectiveMode: 'light' | 'dark' =
    theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;
  const isDark = effectiveMode === 'dark';

  const currentTheme = useMemo((): ThemeColors => {
    if (theme === 'dark') return darkTheme;
    if (theme === 'light') return lightTheme;
    return systemIsDark ? systemDarkTheme : systemLightTheme;
  }, [theme, systemIsDark]);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? 'dark' : 'light',
          primary: { main: currentTheme.accent },
          success: { main: currentTheme.success },
          error: { main: currentTheme.error },
          warning: { main: currentTheme.warning },
          info: { main: currentTheme.info },
          text: {
            primary: currentTheme.text,
            secondary: currentTheme.textSecondary,
          },
          background: {
            default: currentTheme.shell,
            paper: currentTheme.cardBgElevated,
          },
        },
        shape: { borderRadius: 18 },
        typography: {
          fontFamily: '"Manrope", "Segoe UI", system-ui, sans-serif',
          h1: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700 },
          h2: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700 },
          h3: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700 },
          h4: { fontFamily: '"Space Grotesk", "Manrope", sans-serif', fontWeight: 700 },
          h5: { fontWeight: 700 },
          h6: { fontWeight: 700 },
          button: { fontWeight: 700 },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: currentTheme.shell,
                color: currentTheme.text,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                backgroundColor: currentTheme.cardBgElevated,
                border: `1px solid ${currentTheme.border}`,
                boxShadow: currentTheme.shadowSoft,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                backgroundColor: currentTheme.cardBgElevated,
                border: `1px solid ${currentTheme.border}`,
                boxShadow: currentTheme.shadowSoft,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 14,
                textTransform: 'none',
                fontWeight: 700,
              },
              contained: {
                background: currentTheme.accentGradient,
                boxShadow: `0 16px 30px ${currentTheme.glow}`,
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                background: currentTheme.inputBg,
                borderRadius: 14,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: currentTheme.border,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: currentTheme.borderStrong,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: currentTheme.accent,
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 999,
                fontWeight: 700,
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderColor: currentTheme.border,
              },
            },
          },
        },
      }),
    [currentTheme, isDark]
  );

  useEffect(() => {
    const root = document.documentElement;
    const appliedTheme = theme === 'system' ? effectiveMode : theme;

    root.setAttribute('data-theme', appliedTheme);
    root.style.setProperty('--accent', currentTheme.accent);
    root.style.setProperty('--accent-gradient', currentTheme.accentGradient);
    root.style.setProperty('--border', currentTheme.border);
    root.style.setProperty('--card-bg', currentTheme.cardBg);
    root.style.setProperty('--card-bg-elevated', currentTheme.cardBgElevated);
    root.style.setProperty('--text', currentTheme.text);
    root.style.setProperty('--text-secondary', currentTheme.textSecondary);
    root.style.setProperty('--text-tertiary', currentTheme.textTertiary);
    root.style.setProperty('--input-bg', currentTheme.inputBg);
    root.style.setProperty('--shadow', currentTheme.shadow);
    root.style.setProperty('--shadow-soft', currentTheme.shadowSoft);
    document.body.className = `${appliedTheme}-theme`;
  }, [currentTheme, effectiveMode, theme]);

  const setTheme = (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    localStorage.setItem('app-theme', nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, setTheme, isDark, effectiveMode }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within ThemeProvider');
  return context;
};
