import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  keyframes,
} from '@mui/material';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

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
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    bgColor: 'rgba(102, 126, 234, 0.1)',
    iconBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  success: {
    gradient: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    iconBg: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
  },
  warning: {
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    iconBg: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  },
  error: {
    gradient: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    iconBg: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
  },
  info: {
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    iconBg: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
  },
  secondary: {
    gradient: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    iconBg: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
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
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `0 4px 20px ${scheme.bgColor}, 0 1px 3px rgba(0,0,0,0.1)`,
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 12px 40px ${scheme.bgColor}, 0 4px 12px rgba(0,0,0,0.15)`,
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
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
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
                background: scheme.iconBg,
                animation: `${float} 3s ease-in-out infinite`,
                boxShadow: `0 4px 15px ${scheme.bgColor}`,
                color: 'white',
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
                  backgroundColor: trend.isPositive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: trend.isPositive ? '#16a34a' : '#dc2626',
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
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
      >
        {value}
      </motion.span>
      {suffix}
    </motion.span>
  );
};

export default StatCard;
