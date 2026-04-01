import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Button, keyframes } from '@mui/material';
import {
  Inbox as EmptyIcon,
  SearchOff as NotFoundIcon,
  WifiOff as OfflineIcon,
  ErrorOutline as ErrorIcon,
  CloudOff as CloudOffIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

type EmptyStateType = 'empty' | 'not-found' | 'offline' | 'error' | 'no-data';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const emptyStateConfig = {
  empty: {
    icon: EmptyIcon,
    defaultTitle: 'No items yet',
    defaultDescription: 'Get started by creating your first item.',
    color: '#9ca3af',
    bgColor: 'rgba(156, 163, 175, 0.1)',
  },
  'not-found': {
    icon: NotFoundIcon,
    defaultTitle: 'No results found',
    defaultDescription: 'Try adjusting your search or filters to find what you\'re looking for.',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  offline: {
    icon: OfflineIcon,
    defaultTitle: 'You\'re offline',
    defaultDescription: 'Please check your internet connection and try again.',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
  },
  error: {
    icon: ErrorIcon,
    defaultTitle: 'Something went wrong',
    defaultDescription: 'An error occurred while loading the data. Please try again.',
    color: '#dc2626',
    bgColor: 'rgba(220, 38, 38, 0.1)',
  },
  'no-data': {
    icon: CloudOffIcon,
    defaultTitle: 'No data available',
    defaultDescription: 'There is no data to display at the moment.',
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'empty',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const config = emptyStateConfig[type] || emptyStateConfig.empty;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 4,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: config.bgColor,
            mb: 3,
            animation: `${float} 3s ease-in-out infinite`,
          }}
        >
          <Icon
            sx={{
              fontSize: 56,
              color: config.color,
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          />
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 1,
          }}
        >
          {title || config.defaultTitle}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            maxWidth: 400,
            mb: 3,
          }}
        >
          {description || config.defaultDescription}
        </Typography>

        {(actionLabel || secondaryActionLabel) && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            {actionLabel && onAction && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAction}
                sx={{
                  px: 4,
                  py: 1.2,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #653e8f 100%)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  },
                }}
              >
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onSecondaryAction}
                sx={{
                  px: 4,
                  py: 1.2,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                {secondaryActionLabel}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

export default EmptyState;
