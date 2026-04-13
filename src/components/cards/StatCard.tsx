import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
  onClick?: () => void;
  delay?: number;
}

const colorSchemes = {
  primary: {
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    tone: '#4f46e5',
  },
  success: {
    gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
    tone: '#10b981',
  },
  warning: {
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    tone: '#f59e0b',
  },
  error: {
    gradient: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    tone: '#ef4444',
  },
  info: {
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    tone: '#3b82f6',
  },
  secondary: {
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
    tone: '#7c3aed',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
  onClick,
  delay = 0,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scheme = colorSchemes[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      style={{ height: '100%' }}
    >
      <Card
        onClick={onClick}
        sx={{
          height: '100%',
          borderRadius: 4.5,
          background: isDark
            ? 'linear-gradient(180deg, rgba(30,41,59,0.94) 0%, rgba(15,23,42,0.9) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(scheme.tone, isDark ? 0.22 : 0.12)}`,
          boxShadow: isDark
            ? `0 18px 34px ${alpha('#020617', 0.34)}, inset 0 1px 0 rgba(255,255,255,0.03)`
            : `0 14px 28px ${alpha(scheme.tone, 0.08)}`,
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: isDark
              ? `0 22px 42px ${alpha('#020617', 0.42)}`
              : `0 18px 34px ${alpha(scheme.tone, 0.14)}`,
            transform: 'translateY(-4px)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: scheme.gradient,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at top right, ${alpha(scheme.tone, isDark ? 0.18 : 0.08)} 0%, transparent 32%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: 'text.secondary',
                  mb: 0.5,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  background: scheme.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '2rem',
                }}
              >
                {value}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: 3,
                background: scheme.gradient,
                boxShadow: `0 14px 26px ${alpha(scheme.tone, 0.28)}`,
                color: '#ffffff',
                '& svg': {
                  fontSize: 28,
                },
              }}
            >
              {icon}
            </Box>
          </Box>

          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mb: trend ? 1 : 0,
              }}
            >
              {subtitle}
            </Typography>
          )}

          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                size="small"
                label={`${trend.isPositive ? '+' : ''}${trend.value}%`}
                sx={{
                  backgroundColor: trend.isPositive
                    ? alpha('#10b981', 0.14)
                    : alpha('#ef4444', 0.14),
                  color: trend.isPositive ? '#10b981' : '#ef4444',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
              {trend.label && (
                <Typography variant="caption" color="text.secondary">
                  {trend.label}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface StatCardGroupProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 6;
}

export const StatCardGroup: React.FC<StatCardGroupProps> = ({ children, columns = 4 }) => {
  const gridTemplateColumns = {
    2: 'repeat(2, 1fr)',
    3: 'repeat(3, 1fr)',
    4: 'repeat(4, 1fr)',
    6: 'repeat(6, 1fr)',
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: gridTemplateColumns[columns],
        },
        gap: 3,
        mb: 4,
      }}
    >
      {children}
    </Box>
  );
};

export const AnimatedNumber: React.FC<{
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}> = ({ value, duration = 1, prefix = '', suffix = '' }) => {
  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {prefix}
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration }}>
        {value}
      </motion.span>
      {suffix}
    </motion.span>
  );
};

export default StatCard;
