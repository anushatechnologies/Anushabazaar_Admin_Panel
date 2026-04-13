import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { alpha, createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
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
  bg: 'radial-gradient(circle at top left, rgba(79,70,229,0.08) 0%, transparent 32%), linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
  shell: '#f8fafc',
  cardBg: 'rgba(255,255,255,0.82)',
  cardBgElevated: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textTertiary: '#94a3b8',
  accent: '#4f46e5',
  accentStrong: '#4338ca',
  accentGradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  border: 'rgba(148,163,184,0.22)',
  borderStrong: 'rgba(79,70,229,0.28)',
  shadow: '0 24px 64px rgba(79,70,229,0.14)',
  shadowSoft: '0 10px 28px rgba(15,23,42,0.08)',
  glow: 'rgba(79,70,229,0.24)',
  inputBg: 'rgba(255,255,255,0.92)',
  chipBg: 'rgba(79,70,229,0.08)',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  sidebarBg: 'linear-gradient(180deg, #111827 0%, #1f2a44 54%, #312e81 100%)',
  sidebarEdge: 'rgba(99,102,241,0.18)',
  headerBg: 'rgba(255,255,255,0.88)',
  headerBorder: 'rgba(148,163,184,0.18)',
};

const darkTheme: ThemeColors = {
  name: 'Dark',
  bg: 'radial-gradient(circle at top left, rgba(99,102,241,0.24) 0%, transparent 34%), radial-gradient(circle at bottom right, rgba(124,58,237,0.16) 0%, transparent 30%), linear-gradient(180deg, #0b1120 0%, #111827 100%)',
  shell: '#0b1120',
  cardBg: 'rgba(15,23,42,0.82)',
  cardBgElevated: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',
  accent: '#6366f1',
  accentStrong: '#4f46e5',
  accentGradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  border: 'rgba(71,85,105,0.72)',
  borderStrong: 'rgba(99,102,241,0.34)',
  shadow: '0 28px 80px rgba(2,6,23,0.58)',
  shadowSoft: '0 14px 36px rgba(0,0,0,0.36)',
  glow: 'rgba(99,102,241,0.32)',
  inputBg: 'rgba(15,23,42,0.86)',
  chipBg: 'rgba(99,102,241,0.14)',
  success: '#10b981',
  error: '#f87171',
  warning: '#f59e0b',
  info: '#60a5fa',
  sidebarBg: 'linear-gradient(180deg, #111827 0%, #1e293b 100%)',
  sidebarEdge: 'rgba(99,102,241,0.22)',
  headerBg: 'rgba(11,17,32,0.76)',
  headerBorder: 'rgba(99,102,241,0.16)',
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

const getPreferredMode = (): 'light' | 'dark' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('app-theme') as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') return saved;
    return getPreferredMode();
  });

  const [systemIsDark, setSystemIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => setSystemIsDark(event.matches);

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
          secondary: { main: '#7c3aed' },
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
          fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
          h1: {
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.04em',
          },
          h2: {
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.04em',
          },
          h3: {
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.035em',
          },
          h4: {
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.03em',
          },
          h5: {
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.025em',
          },
          h6: {
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          },
          subtitle1: {
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
          subtitle2: {
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.01em',
          },
          body1: {
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            fontWeight: 500,
            lineHeight: 1.65,
          },
          body2: {
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            fontWeight: 500,
            lineHeight: 1.6,
          },
          button: {
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            fontWeight: 700,
            textTransform: 'none',
            letterSpacing: '-0.015em',
          },
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
                background: currentTheme.cardBgElevated,
                border: `1px solid ${currentTheme.border}`,
                boxShadow: currentTheme.shadowSoft,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                background: currentTheme.cardBgElevated,
                border: `1px solid ${currentTheme.border}`,
                boxShadow: currentTheme.shadowSoft,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 700,
                paddingInline: 18,
                paddingBlock: 10,
                position: 'relative',
                overflow: 'hidden',
                isolation: 'isolate',
                backdropFilter: 'blur(18px) saturate(160%)',
                WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                transition:
                  'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, filter 0.2s ease',
                '& > *': {
                  position: 'relative',
                  zIndex: 1,
                },
                '& .MuiButton-startIcon, & .MuiButton-endIcon': {
                  position: 'relative',
                  zIndex: 1,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 1,
                  borderRadius: 999,
                  background: isDark
                    ? 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 38%, rgba(255,255,255,0) 100%)'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.18) 38%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none',
                  zIndex: 0,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: '12%',
                  right: '12%',
                  bottom: 2,
                  height: '46%',
                  borderRadius: 999,
                  background: isDark
                    ? 'radial-gradient(ellipse at bottom, rgba(165,180,252,0.22) 0%, rgba(165,180,252,0.06) 48%, transparent 80%)'
                    : 'radial-gradient(ellipse at bottom, rgba(79,70,229,0.18) 0%, rgba(79,70,229,0.04) 48%, transparent 82%)',
                  filter: 'blur(10px)',
                  pointerEvents: 'none',
                  zIndex: 0,
                },
                '&:hover': {
                  transform: 'translateY(-2px) scale(1.01)',
                },
                '&:active': {
                  transform: 'translateY(0) scale(0.985)',
                },
                '&.Mui-disabled': {
                  opacity: 0.58,
                  boxShadow: 'none',
                  filter: 'grayscale(0.08)',
                },
              },
              contained: {
                background: `${
                  isDark
                    ? 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 34%, rgba(255,255,255,0) 100%)'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.46) 0%, rgba(255,255,255,0.14) 34%, rgba(255,255,255,0) 100%)'
                }, ${currentTheme.accentGradient}`,
                border: `1px solid ${alpha('#ffffff', isDark ? 0.16 : 0.22)}`,
                boxShadow: isDark
                  ? `0 20px 40px ${alpha('#020617', 0.42)}, inset 0 1px 0 ${alpha('#ffffff', 0.18)}, inset 0 -10px 18px ${alpha('#1e1b4b', 0.22)}, 0 0 0 1px ${alpha(currentTheme.accent, 0.08)}`
                  : `0 18px 34px ${currentTheme.glow}, inset 0 1px 0 ${alpha('#ffffff', 0.58)}, inset 0 -10px 18px ${alpha('#312e81', 0.18)}, 0 0 0 1px ${alpha('#ffffff', 0.22)}`,
                color: '#ffffff',
                '&:hover': {
                  background: `${
                    isDark
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 34%, rgba(255,255,255,0) 100%)'
                      : 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.16) 34%, rgba(255,255,255,0) 100%)'
                  }, ${currentTheme.accentGradient}`,
                  boxShadow: isDark
                    ? `0 24px 46px ${alpha('#020617', 0.48)}, inset 0 1px 0 ${alpha('#ffffff', 0.2)}, inset 0 -12px 20px ${alpha('#1e1b4b', 0.24)}`
                    : `0 22px 40px ${alpha(currentTheme.accent, 0.3)}, inset 0 1px 0 ${alpha('#ffffff', 0.64)}, inset 0 -12px 20px ${alpha('#312e81', 0.2)}`,
                  filter: 'saturate(1.08)',
                },
              },
              outlined: {
                color: isDark ? '#eef2ff' : currentTheme.text,
                borderColor: isDark ? alpha('#a5b4fc', 0.22) : alpha('#ffffff', 0.78),
                background: isDark
                  ? 'linear-gradient(180deg, rgba(30,41,59,0.82) 0%, rgba(15,23,42,0.72) 100%)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(238,242,255,0.84) 100%)',
                boxShadow: isDark
                  ? `0 14px 28px ${alpha('#020617', 0.28)}, inset 0 1px 0 ${alpha('#ffffff', 0.1)}, inset 0 -10px 18px ${alpha(currentTheme.accent, 0.1)}`
                  : `0 12px 24px ${alpha(currentTheme.accent, 0.1)}, inset 0 1px 0 ${alpha('#ffffff', 0.96)}, inset 0 -8px 16px ${alpha(currentTheme.accent, 0.06)}`,
                '&:hover': {
                  borderColor: alpha(currentTheme.accent, 0.52),
                  background: isDark
                    ? 'linear-gradient(180deg, rgba(37,47,76,0.9) 0%, rgba(15,23,42,0.78) 100%)'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(224,231,255,0.88) 100%)',
                  boxShadow: isDark
                    ? `0 18px 34px ${alpha('#020617', 0.34)}, inset 0 1px 0 ${alpha('#ffffff', 0.12)}, inset 0 -12px 20px ${alpha(currentTheme.accent, 0.12)}`
                    : `0 16px 30px ${alpha(currentTheme.accent, 0.14)}, inset 0 1px 0 ${alpha('#ffffff', 1)}, inset 0 -10px 18px ${alpha(currentTheme.accent, 0.08)}`,
                },
              },
              text: {
                border: `1px solid ${alpha(currentTheme.accent, isDark ? 0.12 : 0.08)}`,
                background: isDark ? alpha('#ffffff', 0.02) : alpha('#ffffff', 0.52),
                boxShadow: isDark
                  ? `inset 0 1px 0 ${alpha('#ffffff', 0.06)}`
                  : `inset 0 1px 0 ${alpha('#ffffff', 0.8)}`,
                '&:hover': {
                  background: isDark
                    ? alpha(currentTheme.accent, 0.14)
                    : alpha(currentTheme.accent, 0.08),
                },
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
                backdropFilter: 'blur(10px)',
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderColor: currentTheme.border,
                paddingTop: 18,
                paddingBottom: 18,
              },
              head: {
                fontWeight: 700,
                color: currentTheme.textSecondary,
                background: isDark ? alpha('#0f172a', 0.35) : alpha('#eef2ff', 0.72),
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: isDark
                    ? alpha(currentTheme.accent, 0.08)
                    : alpha(currentTheme.accent, 0.04),
                },
              },
            },
          },
        },
      }),
    [currentTheme, isDark],
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
    const normalizedTheme = nextTheme === 'system' ? getPreferredMode() : nextTheme;
    setThemeState(normalizedTheme);
    localStorage.setItem('app-theme', normalizedTheme);
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
