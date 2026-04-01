import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Box, IconButton, Typography, keyframes } from '@mui/material';
import notificationSound from '../../features/notifications/universfield-new-notification-036-485897.mp3';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const toastConfig = {
  success: {
    icon: SuccessIcon,
    gradient: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22c55e',
  },
  error: {
    icon: ErrorIcon,
    gradient: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
  },
  warning: {
    icon: WarningIcon,
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#f59e0b',
  },
  info: {
    icon: InfoIcon,
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
  },
};

class ToastManager {
  private listeners: ((toasts: Toast[]) => void)[] = [];
  private toasts: Toast[] = [];

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.toasts));
  }

  private playSound() {
    try {
      const audio = new Audio(notificationSound);
      audio.play().catch(err => console.debug('Audio play blocked or failed:', err));
    } catch (e) {
      console.error('Error playing notification sound:', e);
    }
  }

  add(options: ToastOptions) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = {
      id,
      message: options.message,
      type: options.type || 'info',
      duration: options.duration || 5000,
      action: options.action,
    };

    this.toasts = [...this.toasts, toast];
    this.notify();
    this.playSound();

    if (toast.duration > 0) {
      setTimeout(() => this.remove(id), toast.duration);
    }

    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }
}

export const toastManager = new ToastManager();

export const toast = {
  success: (message: string, duration?: number) =>
    toastManager.add({ message, type: 'success', duration }),
  error: (message: string, duration?: number) =>
    toastManager.add({ message, type: 'error', duration }),
  warning: (message: string, duration?: number) =>
    toastManager.add({ message, type: 'warning', duration }),
  info: (message: string, duration?: number) =>
    toastManager.add({ message, type: 'info', duration }),
  custom: (options: ToastOptions) => toastManager.add(options),
  clear: () => toastManager.clear(),
};

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({
  toast: toastItem,
  onRemove,
}) => {
  const config = toastConfig[toastItem.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={{
        marginBottom: 12,
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 2,
          minWidth: 320,
          maxWidth: 420,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: `1px solid ${config.borderColor}`,
          boxShadow: `0 10px 40px ${config.bgColor}, 0 4px 12px rgba(0,0,0,0.1)`,
          position: 'relative',
          overflow: 'hidden',
          animation: `${slideIn} 0.3s ease-out`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: 4,
            height: '100%',
            background: config.gradient,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: config.bgColor,
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 20, color: config.borderColor }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: 'text.primary',
              lineHeight: 1.5,
            }}
          >
            {toastItem.message}
          </Typography>

          {toastItem.action && (
            <Box sx={{ mt: 1 }}>
              <Typography
                component="button"
                onClick={() => {
                  toastItem.action?.onClick();
                  onRemove(toastItem.id);
                }}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: config.borderColor,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {toastItem.action.label}
              </Typography>
            </Box>
          )}
        </Box>

        <IconButton
          size="small"
          onClick={() => onRemove(toastItem.id)}
          sx={{
            p: 0.5,
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              backgroundColor: 'action.hover',
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>

        {/* Progress bar */}
        {toastItem.duration && toastItem.duration > 0 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: config.gradient,
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
              animation: `shrink ${toastItem.duration}ms linear forwards`,
              '@keyframes shrink': {
                from: { transform: 'scaleX(1)' },
                to: { transform: 'scaleX(0)' },
              },
            }}
          />
        )}
      </Box>
    </motion.div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  const handleRemove = useCallback((id: string) => {
    toastManager.remove(id);
  }, []);

  const positionStyles = {
    'top-right': { top: 24, right: 24 },
    'top-left': { top: 24, left: 24 },
    'bottom-right': { bottom: 24, right: 24 },
    'bottom-left': { bottom: 24, left: 24 },
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 9999,
        ...positionStyles[position],
        display: 'flex',
        flexDirection: position.includes('bottom') ? 'column-reverse' : 'column',
        gap: 1,
        pointerEvents: 'none',
        '& > *': {
          pointerEvents: 'auto',
        },
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={handleRemove} />
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default ToastContainer;
