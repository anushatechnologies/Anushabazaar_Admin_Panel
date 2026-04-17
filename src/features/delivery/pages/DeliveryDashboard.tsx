import React from 'react';
import { motion } from 'framer-motion';
import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material';
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
import { GlassBadge, GlassCard } from '../../../components/glassmorphism/GlassComponents';
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
          p: { xs: 2.25, md: 2.75 },
          background: isDark
            ? 'linear-gradient(180deg, rgba(15,23,42,0.94) 0%, rgba(15,23,42,0.88) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,247,255,0.98) 55%, rgba(238,242,255,0.96) 100%)',
          border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.24 : 0.12)}`,
          boxShadow: isDark ? '0 24px 48px rgba(2,6,23,0.38)' : '0 22px 40px rgba(79,70,229,0.10)',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 2.5,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gap: 2.25,
              gridTemplateColumns: {
                xs: '1fr',
                xl: 'minmax(0, 1.1fr) auto',
              },
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{ letterSpacing: 1.6, color: 'text.secondary', fontWeight: 800 }}
              >
                Delivery Control Tower
              </Typography>
              <Typography
                variant="h5"
                sx={{ mt: 0.35, fontWeight: 800, maxWidth: 700, lineHeight: 1.15 }}
              >
                Cleaner alignment for rider activity, approvals, and live dispatch.
              </Typography>
              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.9,
                  maxWidth: 780,
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  lineHeight: 1.65,
                }}
              >
                The page now starts with the data and actions that matter, without the oversized
                suggestion banner taking over the screen.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                sx={{ mt: 1.5 }}
              >
                <GlassBadge statusColor={theme.palette.primary.main}>
                  {approvalRate}% approved
                </GlassBadge>
                <GlassBadge statusColor={theme.palette.info.main}>
                  {liveCoverage}% live coverage
                </GlassBadge>
                <GlassBadge
                  statusColor={
                    stats.pendingOrders > 0
                      ? theme.palette.warning.main
                      : theme.palette.success.main
                  }
                >
                  {stats.pendingOrders} waiting
                </GlassBadge>
              </Stack>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row', xl: 'column' }}
              spacing={1.2}
              sx={{ width: '100%', maxWidth: { xl: 250 } }}
            >
              <Button
                variant="contained"
                endIcon={<ArrowOutwardIcon />}
                onClick={() => navigate('/delivery/personnel')}
                sx={{
                  minWidth: { xs: '100%', sm: 210 },
                  py: 1.15,
                  borderRadius: 999,
                  fontWeight: 700,
                }}
              >
                Delivery Persons
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/delivery/assignment-dashboard')}
                sx={{
                  minWidth: { xs: '100%', sm: 190 },
                  py: 1.15,
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
              display: 'grid',
              gap: 1.2,
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
              },
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
                helper: 'In progress',
                tone: theme.palette.info.main,
              },
              {
                label: 'Pending approvals',
                value: stats.pendingApprovals,
                helper: 'Needs review',
                tone: theme.palette.warning.main,
              },
              {
                label: 'Queue backlog',
                value: stats.pendingOrders,
                helper: stats.pendingOrders > 0 ? 'Needs movement' : 'Under control',
                tone:
                  stats.pendingOrders > 0 ? theme.palette.warning.main : theme.palette.success.main,
              },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  p: 1.6,
                  borderRadius: 3,
                  border: `1px solid ${alpha(item.tone, isDark ? 0.24 : 0.14)}`,
                  background: isDark
                    ? `linear-gradient(180deg, ${alpha(item.tone, 0.12)} 0%, rgba(15,23,42,0.72) 100%)`
                    : `linear-gradient(180deg, rgba(255,255,255,0.9) 0%, ${alpha(item.tone, 0.08)} 100%)`,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.35, fontWeight: 800, color: item.tone }}>
                  {item.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.helper}
                </Typography>
              </Box>
            ))}
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
          gridTemplateColumns: { xs: '1fr', xl: '1.18fr 0.92fr' },
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
                Priority actions for the current shift.
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))',
                  xl: 'repeat(3, minmax(0, 1fr))',
                },
              }}
            >
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
                Coverage and flow progress for this shift.
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
                display: 'grid',
                gap: 1.2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              }}
            >
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.22 : 0.14)}`,
                  background: isDark
                    ? 'linear-gradient(180deg, rgba(30,41,59,0.82) 0%, rgba(15,23,42,0.82) 100%)'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(241,245,255,0.94) 100%)',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Queue status
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.6, lineHeight: 1.6 }}
                >
                  {stats.pendingOrders > 0
                    ? `${stats.pendingOrders} orders are waiting to move.`
                    : 'No dispatch backlog right now.'}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.info.main, isDark ? 0.22 : 0.14)}`,
                  background: isDark
                    ? `linear-gradient(180deg, ${alpha(theme.palette.info.main, 0.12)} 0%, rgba(15,23,42,0.82) 100%)`
                    : `linear-gradient(180deg, rgba(255,255,255,0.92) 0%, ${alpha(theme.palette.info.main, 0.08)} 100%)`,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Live monitoring
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.6, lineHeight: 1.6 }}
                >
                  {stats.activeOrders > 0
                    ? `${stats.activeOrders} active assignments are still in motion.`
                    : 'No active assignments need follow-up at the moment.'}
                </Typography>
              </Box>
            </Box>
          </GlassCard>
        </motion.div>
      </Box>
    </Box>
  );
}
