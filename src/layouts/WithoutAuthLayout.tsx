import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAppTheme } from '@contexts/ThemeContext';
import ThemeSwitcher from '@components/ThemeSwitcher';

const WithoutAuthLayout: React.FC = () => {
  const { currentTheme, isDark } = useAppTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        background: currentTheme.bg,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(circle at top right, rgba(34,211,238,0.2) 0%, transparent 28%), radial-gradient(circle at bottom left, rgba(59,130,246,0.2) 0%, transparent 34%)'
            : 'radial-gradient(circle at top right, rgba(37,99,235,0.14) 0%, transparent 26%), radial-gradient(circle at bottom left, rgba(20,184,166,0.16) 0%, transparent 30%)',
        }}
      />
      <Box sx={{ position: 'absolute', top: 24, right: 32, zIndex: 10 }}>
        <ThemeSwitcher />
      </Box>
      <Outlet />
    </Box>
  );
};

export default WithoutAuthLayout;
