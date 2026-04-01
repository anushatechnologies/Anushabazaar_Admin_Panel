import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Paper, Card } from '@mui/material';
import { motion } from 'framer-motion';

/** ─── Glassmorphism Card (theme-aware) ────────────────── */
export const GlassCard = styled(motion.create(Card))(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(13, 21, 41, 0.85)'
    : theme.palette.background.paper,
  backdropFilter: theme.palette.mode === 'dark' ? 'blur(20px)' : 'blur(8px)',
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
})) as any;

/** ─── Glass Paper ─────────────────────────────────────── */
export const GlassPaper = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(13, 21, 41, 0.85)'
    : theme.palette.background.paper,
  backdropFilter: 'blur(20px)',
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[2],
}));

/** ─── Gradient Text ───────────────────────────────────── */
export const GradientText = styled('span')<{ gradient?: string }>(({ theme, gradient }) => ({
  background: gradient || `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.dark} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 800,
}));

/** ─── Glass Page Header ───────────────────────────────── */
export const GlassPageHeader = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(13, 21, 41, 0.7)'
    : theme.palette.background.paper,
  backdropFilter: 'blur(20px)',
  borderRadius: 16,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[1],
}));

/** ─── Glass Badge ─────────────────────────────────────── */
export const GlassBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'statusColor',
})<{ statusColor?: string; sx?: any }>(({ statusColor = '#22c55e' }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 10px',
  borderRadius: 20,
  background: `${statusColor}20`,
  border: `1px solid ${statusColor}50`,
  color: statusColor,
  fontSize: '0.72rem',
  fontWeight: 700,
  gap: 5,
  whiteSpace: 'nowrap',
  '&::before': {
    content: '""',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: statusColor,
    flexShrink: 0,
  },
}));

/** ─── Stat Card (gradient border) ────────────────────── */
export const StatCard = styled(Box)<{ accent?: string }>(({ theme, accent = theme.palette.primary.main }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(13, 21, 41, 0.85)'
    : '#ffffff',
  borderRadius: 16,
  padding: theme.spacing(3),
  border: `1px solid ${accent}30`,
  boxShadow: `0 4px 20px ${accent}15`,
  backdropFilter: 'blur(16px)',
  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'default',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 40px ${accent}25`,
    borderColor: `${accent}60`,
  },
}));

/** ─── Gradient Card (colored) ─────────────────────────── */
export const GradientCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'gradient',
})<{ gradient?: string }>(({ gradient = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }) => ({
  background: gradient,
  borderRadius: 16,
  color: 'white',
  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
    pointerEvents: 'none',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 16px 40px rgba(102, 126, 234, 0.4)',
  },
}));

/** ─── Floating Container ──────────────────────────────── */
export const FloatingContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

/** ─── Animated Gradient Border ────────────────────────── */
export const AnimatedGradientBorder = styled(Box)(() => ({
  position: 'relative',
  borderRadius: 16,
  background: 'linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82)',
  backgroundSize: '300% 300%',
  animation: 'gradientShift 5s ease alternate infinite',
  padding: 3,
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
  '& > *': {
    borderRadius: 14,
  },
}));

/** ─── Gradient Button styled ───────────────────────────── */
export const GradientButton = styled('button')<{ gradient?: string }>(({ gradient = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }) => ({
  background: gradient,
  color: 'white',
  border: 'none',
  padding: '11px 22px',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: '0.875rem',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
  fontFamily: 'inherit',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
  },
  '&:active': { transform: 'translateY(0)' },
}));

/** ─── Glow Card ────────────────────────────────────────── */
export const GlowCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'glowColor',
})<{ glowColor?: string }>(({ theme, glowColor = 'rgba(99,102,241,0.5)' }) => ({
  background: theme.palette.mode === 'dark' ? 'rgba(13, 21, 41, 0.85)' : '#ffffff',
  backdropFilter: 'blur(20px)',
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: `0 4px 20px ${glowColor}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 8px 40px ${glowColor}`,
    transform: 'translateY(-4px)',
  },
}));

export const NeumorphicCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? '#1e293b' : '#f0f4f8',
  borderRadius: 20,
  boxShadow: theme.palette.mode === 'dark'
    ? '8px 8px 16px #0a0f1a, -8px -8px 16px #243147'
    : '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
  border: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

export default {
  GlassCard,
  GlassPaper,
  GradientCard,
  GlowCard,
  GradientText,
  GlassPageHeader,
  FloatingContainer,
  NeumorphicCard,
  GradientButton,
  GlassBadge,
  AnimatedGradientBorder,
  StatCard,
};
