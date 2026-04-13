import React from 'react';
import { motion } from 'framer-motion';
import { Box, Button, Divider, LinearProgress, Stack, Typography } from '@mui/material';
import {
  ArrowOutward as ArrowOutwardIcon,
  Assignment as AssignmentIcon,
  CheckCircle as ApprovedIcon,
  Description as DocumentsIcon,
  LocalShipping as OrdersIcon,
  Pending as PendingIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useGetDeliveryDashboardStatsQuery, type DeliveryDashboardStats } from '../api/deliveryApi';
import { StatCard } from '../../../components/cards/StatCard';
import {
  SkeletonPageHeader,
  SkeletonStatCards,
} from '../../../components/skeletons/LoadingSkeletons';
import EmptyState from '../../../components/empty-state/EmptyState';
import {
  GlassBadge,
  GlassCard,
  GradientText,
} from '../../../components/glassmorphism/GlassComponents';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { useAppTheme } from '../../../contexts/ThemeContext';

type DashboardPayload = Partial<DeliveryDashboardStats> & {
  assignedOrders?: number;
  pickedUpOrders?: number;
  deliveredOrders?: number;
  pendingOrders?: number;
};

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const percent = (numerator: number, denominator: number) => {
  if (denominator <= 0) return 0;
  return Math.min(100, Math.round((numerator / denominator) * 100));
};

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDark } = useAppTheme();
  const { data, isLoading, isError, error } = useGetDeliveryDashboardStatsQuery();
  const { handleError } = useErrorHandler();

  React.useEffect(() => {
    if (isError && error) {
      handleError(error);
    }
  }, [isError, error, handleError]);

  const rawStats = (data?.statistics ?? {}) as DashboardPayload;

  const stats = React.useMemo(
    () => ({
      totalDeliveryPersons: toNumber(rawStats.totalDeliveryPersons),
      approvedDeliveryPersons: toNumber(rawStats.approvedDeliveryPersons),
      onlineDeliveryPersons: toNumber(rawStats.onlineDeliveryPersons),
      pendingApprovals: toNumber(rawStats.pendingApprovals),
      totalOrders: toNumber(rawStats.totalOrders),
      activeOrders:
        rawStats.activeOrders !== undefined
          ? toNumber(rawStats.activeOrders)
          : toNumber(rawStats.assignedOrders) + toNumber(rawStats.pickedUpOrders),
      completedOrders:
        rawStats.completedOrders !== undefined
          ? toNumber(rawStats.completedOrders)
          : toNumber(rawStats.deliveredOrders),
      pendingOrders: toNumber(rawStats.pendingOrders),
    }),
    [rawStats],
  );

  const approvalRate = percent(stats.approvedDeliveryPersons, stats.totalDeliveryPersons);
  const liveCoverage = percent(stats.onlineDeliveryPersons, stats.approvedDeliveryPersons);
  const completionRate = percent(stats.completedOrders, stats.totalOrders);
  const activeShare = percent(stats.activeOrders, stats.totalOrders);

  const statCards = [
    {
      title: 'Delivery Persons',
      value: stats.totalDeliveryPersons,
      icon: <PeopleIcon />,
      color: 'primary' as const,
      subtitle: 'Registered delivery staff',
      trend: { value: 12, isPositive: true, label: 'team growth' },
      onClick: () => navigate('/delivery/personnel'),
    },
    {
      title: 'Approved Staff',
      value: stats.approvedDeliveryPersons,
      icon: <ApprovedIcon />,
      color: 'success' as const,
      subtitle: 'Ready for live assignments',
      trend: { value: approvalRate, isPositive: true, label: 'approval rate' },
      onClick: () => navigate('/delivery/personnel'),
    },
    {
      title: 'Online Staff',
      value: stats.onlineDeliveryPersons,
      icon: <TrendingUpIcon />,
      color: 'info' as const,
      subtitle: 'Currently taking orders',
      trend: { value: liveCoverage, isPositive: true, label: 'coverage today' },
      onClick: () => navigate('/delivery/live-map'),
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: <PendingIcon />,
      color: 'warning' as const,
      subtitle: 'Profiles waiting for admin review',
      onClick: () => navigate('/delivery/documents'),
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <OrdersIcon />,
      color: 'info' as const,
      subtitle: 'Orders routed through delivery',
      trend: { value: completionRate, isPositive: true, label: 'completed share' },
      onClick: () => navigate('/delivery/assignment-dashboard'),
    },
    {
      title: 'Active Assignments',
      value: stats.activeOrders,
      icon: <AssignmentIcon />,
      color: 'secondary' as const,
      subtitle: 'Orders still in progress',
      trend: { value: activeShare, isPositive: stats.activeOrders > 0, label: 'of total flow' },
      onClick: () => navigate('/delivery/assignment-dashboard'),
    },
  ];

  const quickActions = [
    {
      title: 'Manage Delivery Persons',
      description: 'Review rider profiles, approval status, and online availability.',
      count: stats.totalDeliveryPersons,
      tone: theme.palette.primary.main,
      icon: <PeopleIcon />,
      path: '/delivery/personnel',
    },
    {
      title: 'Review Documents',
      description: 'Clear document submissions and unblock pending onboarding.',
      count: stats.pendingApprovals,
      tone: theme.palette.warning.main,
      icon: <DocumentsIcon />,
      path: '/delivery/documents',
    },
    {
      title: 'Open Assignments',
      description: 'Monitor active orders and keep dispatch flow moving smoothly.',
      count: stats.activeOrders,
      tone: theme.palette.info.main,
      icon: <AssignmentIcon />,
      path: '/delivery/assignment-dashboard',
    },
  ];

  const healthRows = [
    {
      label: 'Approval readiness',
      helper: `${stats.approvedDeliveryPersons} approved of ${stats.totalDeliveryPersons} total riders`,
      value: approvalRate,
      tone: theme.palette.success.main,
    },
    {
      label: 'Live rider coverage',
      helper: `${stats.onlineDeliveryPersons} riders online right now`,
      value: liveCoverage,
      tone: theme.palette.info.main,
    },
    {
      label: 'Order completion',
      helper: `${stats.completedOrders} completed from ${stats.totalOrders} total orders`,
      value: completionRate,
      tone: theme.palette.primary.main,
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <SkeletonPageHeader />
        <SkeletonStatCards count={6} />
      </Box>
    );
  }

  if (isError && !data) {
    return (
      <Box sx={{ p: 4 }}>
        <EmptyState
          type="error"
          title="Failed to load delivery dashboard"
          description="There was an error loading delivery operations data. Please try again."
          secondaryActionLabel="Retry"
          onSecondaryAction={() => window.location.reload()}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, display: 'grid', gap: { xs: 2.5, lg: 3 } }}>
      <GlassCard
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          position: 'relative',
          overflow: 'hidden',
          background: isDark
            ? 'linear-gradient(180deg, rgba(15,23,42,0.94) 0%, rgba(15,23,42,0.88) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,247,255,0.98) 55%, rgba(238,242,255,0.96) 100%)',
          border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.24 : 0.12)}`,
          boxShadow: isDark ? '0 24px 48px rgba(2,6,23,0.38)' : '0 22px 40px rgba(79,70,229,0.10)',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 240,
            height: 240,
            right: -70,
            top: -90,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.18)} 0%, transparent 72%)`,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 220,
            height: 220,
            left: -100,
            bottom: -120,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.14)} 0%, transparent 74%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              xl: 'minmax(0, 1.55fr) minmax(320px, 0.95fr)',
            },
          }}
        >
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} useFlexGap flexWrap="wrap">
              <GlassBadge statusColor={theme.palette.success.main}>Live operations</GlassBadge>
              <GlassBadge statusColor={theme.palette.primary.main}>
                {approvalRate}% team approved
              </GlassBadge>
              <GlassBadge statusColor={theme.palette.info.main}>
                {liveCoverage}% online coverage
              </GlassBadge>
            </Stack>

            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.05,
                  fontSize: { xs: '2rem', md: '2.6rem' },
                  maxWidth: 780,
                }}
              >
                <GradientText>
                  Delivery operations with cleaner visibility and faster actions
                </GradientText>
              </Typography>
              <Typography
                color="text.secondary"
                sx={{
                  mt: 1.2,
                  maxWidth: 760,
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  lineHeight: 1.7,
                }}
              >
                Keep approvals, rider coverage, and active assignments in one compact view. The
                layout now uses the page width properly so the dashboard feels filled, balanced, and
                easier to scan.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                endIcon={<ArrowOutwardIcon />}
                onClick={() => navigate('/delivery/personnel')}
                sx={{
                  minWidth: { xs: '100%', sm: 220 },
                  py: 1.2,
                  borderRadius: 999,
                  fontWeight: 700,
                }}
              >
                Open Delivery Persons
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/delivery/assignment-dashboard')}
                sx={{
                  minWidth: { xs: '100%', sm: 200 },
                  py: 1.2,
                  borderRadius: 999,
                  fontWeight: 700,
                }}
              >
                View Assignments
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              borderRadius: 4,
              p: 2.5,
              display: 'grid',
              gap: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.24 : 0.14)}`,
              background: isDark
                ? 'linear-gradient(180deg, rgba(30,41,59,0.82) 0%, rgba(15,23,42,0.84) 100%)'
                : 'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(241,245,255,0.92) 100%)',
              boxShadow: isDark
                ? 'inset 0 1px 0 rgba(255,255,255,0.03)'
                : '0 14px 28px rgba(79,70,229,0.08)',
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{ letterSpacing: 1.2, color: 'text.secondary', fontWeight: 700 }}
              >
                Shift Snapshot
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Dispatch health at a glance
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))', xl: '1fr' },
              }}
            >
              {[
                {
                  label: 'Online riders',
                  value: stats.onlineDeliveryPersons,
                  helper: 'Live now',
                  tone: theme.palette.success.main,
                },
                {
                  label: 'Active orders',
                  value: stats.activeOrders,
                  helper: 'Needs monitoring',
                  tone: theme.palette.info.main,
                },
                {
                  label: 'Pending approvals',
                  value: stats.pendingApprovals,
                  helper: 'Needs review',
                  tone: theme.palette.warning.main,
                },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: alpha(item.tone, isDark ? 0.12 : 0.08),
                    border: `1px solid ${alpha(item.tone, isDark ? 0.24 : 0.16)}`,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.4 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: item.tone }}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.helper}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Orders waiting to move
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {stats.pendingOrders}
                </Typography>
              </Box>
              <GlassBadge
                statusColor={
                  stats.pendingOrders > 0 ? theme.palette.warning.main : theme.palette.success.main
                }
              >
                {stats.pendingOrders > 0 ? 'Attention needed' : 'Queue is healthy'}
              </GlassBadge>
            </Box>
          </Box>
        </Box>
      </GlassCard>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        {statCards.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            subtitle={stat.subtitle}
            trend={stat.trend}
            delay={index}
            onClick={stat.onClick}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', xl: '1.25fr 0.95fr' },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <GlassCard sx={{ p: { xs: 2.5, md: 3 }, height: '100%', display: 'grid', gap: 2.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Action Center
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Use the extra dashboard space for real actions, not empty gaps.
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {quickActions.map((action) => (
                <Box
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  sx={{
                    p: 2,
                    borderRadius: 3.5,
                    display: 'grid',
                    gap: 1.25,
                    cursor: 'pointer',
                    border: `1px solid ${alpha(action.tone, isDark ? 0.24 : 0.16)}`,
                    background: isDark
                      ? `linear-gradient(180deg, ${alpha(action.tone, 0.12)} 0%, rgba(15,23,42,0.55) 100%)`
                      : `linear-gradient(180deg, rgba(255,255,255,0.95) 0%, ${alpha(action.tone, 0.08)} 100%)`,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 18px 32px ${alpha(action.tone, isDark ? 0.16 : 0.12)}`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2.75,
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        background: `linear-gradient(135deg, ${action.tone} 0%, ${alpha(action.tone, 0.76)} 100%)`,
                        boxShadow: `0 12px 24px ${alpha(action.tone, 0.24)}`,
                      }}
                    >
                      {action.icon}
                    </Box>
                    <GlassBadge statusColor={action.tone}>{action.count} items</GlassBadge>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                      {action.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22 }}
        >
          <GlassCard sx={{ p: { xs: 2.5, md: 3 }, height: '100%', display: 'grid', gap: 2.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Operations Health
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Progress indicators for approvals, coverage, and delivery flow.
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gap: 2 }}>
              {healthRows.map((row) => (
                <Box key={row.label}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      gap: 2,
                      mb: 0.8,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {row.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: row.tone }}>
                      {row.value}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={row.value}
                    sx={{
                      height: 10,
                      borderRadius: 999,
                      backgroundColor: alpha(row.tone, isDark ? 0.18 : 0.08),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                        background: `linear-gradient(90deg, ${row.tone} 0%, ${alpha(row.tone, 0.7)} 100%)`,
                      },
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                    {row.helper}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.22 : 0.14)}`,
                background: isDark
                  ? 'linear-gradient(180deg, rgba(30,41,59,0.82) 0%, rgba(15,23,42,0.82) 100%)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(241,245,255,0.94) 100%)',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Dispatch note
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.7, lineHeight: 1.7 }}>
                Approved riders, active assignments, and completed orders are now grouped into one
                compact visual flow so the page feels cleaner and more useful on large screens.
              </Typography>
            </Box>
          </GlassCard>
        </motion.div>
      </Box>
    </Box>
  );
}
