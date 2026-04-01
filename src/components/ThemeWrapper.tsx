import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import { useAppTheme } from '@contexts/ThemeContext';

interface ThemeWrapperProps {
  children: ReactNode;
}

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { currentTheme, isDark, theme } = useAppTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: currentTheme.bg,
        transition: 'all 0.5s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background particles for dark theme */}
      {isDark && (
        <>
          <Box
            sx={{
              position: 'fixed',
              top: '10%',
              left: '10%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(0,245,255,0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(40px)',
              animation: 'pulse 8s ease-in-out infinite',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: 'fixed',
              top: '60%',
              right: '10%',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(255,0,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(60px)',
              animation: 'pulse 10s ease-in-out infinite reverse',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: 'fixed',
              bottom: '10%',
              left: '30%',
              width: '250px',
              height: '250px',
              background: 'radial-gradient(circle, rgba(123,44,191,0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(50px)',
              animation: 'pulse 12s ease-in-out infinite',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.2); opacity: 1; }
            }
          `}</style>
        </>
      )}

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </Box>
    </Box>
  );
};

export default ThemeWrapper;
