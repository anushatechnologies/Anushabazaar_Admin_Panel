import React from 'react';
import { motion } from 'framer-motion';
import { Box, Button, Typography, Grid } from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  LocalShipping as OrdersIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useGetDeliveryDashboardStatsQuery, type DeliveryDashboardStats } from '../api/deliveryApi';
import { StatCard } from '../../../components/cards/StatCard';
import {
  SkeletonStatCards,
  SkeletonPageHeader,
} from '../../../components/skeletons/LoadingSkeletons';
import EmptyState from '../../../components/empty-state/EmptyState';
import { GlassPageHeader, GradientText } from '../../../components/glassmorphism/GlassComponents';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { useNavigate } from 'react-router-dom';

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetDeliveryDashboardStatsQuery();
  const { handleError } = useErrorHandler();

  const stats: DeliveryDashboardStats = data?.statistics || {
    totalDeliveryPersons: 0,
    approvedDeliveryPersons: 0,
    pendingApprovals: 0,
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
  };

  React.useEffect(() => {
    if (isError && error) {
      handleError(error);
    }
  }, [isError, error, handleError]);

  const statCards = [
    {
      title: 'Delivery Persons',
      value: stats.totalDeliveryPersons || 0,
      icon: <PeopleIcon />,
      color: 'primary' as const,
      subtitle: 'Active delivery staff',
      trend: { value: 12, isPositive: true, label: 'vs last month' },
    },
    {
      title: 'Approved Staff',
      value: stats.approvedDeliveryPersons || 0,
      icon: <ApprovedIcon />,
      color: 'success' as const,
      subtitle: 'Verified & approved',
      trend: { value: 8, isPositive: true, label: 'vs last month' },
    },
    {
      title: 'Online Staff',
      value: stats.onlineDeliveryPersons || 0,
      icon: <PeopleIcon />,
      color: 'info' as const,
      subtitle: 'Currently active',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals || 0,
      icon: <PendingIcon />,
      color: 'warning' as const,
      subtitle: 'Awaiting review',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: <OrdersIcon />,
      color: 'info' as const,
      subtitle: 'All time deliveries',
    },
    {
      title: 'Active Assignments',
      value: stats.activeOrders || 0,
      icon: <AssignmentIcon />,
      color: 'secondary' as const,
      subtitle: 'In progress now',
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <SkeletonPageHeader />
        <SkeletonStatCards count={5} />
      </Box>
    );
  }

  if (isError && !data) {
    return (
      <Box sx={{ p: 4 }}>
        <EmptyState
          type="error"
          title="Failed to load dashboard"
          description="There was an error loading the dashboard data. Please try again."
          secondaryActionLabel="Retry"
          onSecondaryAction={() => window.location.reload()}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassPageHeader>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                }}
              >
                <GradientText>Delivery Overview</GradientText>
              </Typography>
              <Typography color="text.secondary" variant="body1">
                Real-time delivery operations and staff metrics
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.5,
                  borderRadius: 20,
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#22c55e',
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>
                  Live
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate('/delivery/personnel')}
                sx={{
                  borderRadius: 999,
                  px: 2.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                }}
              >
                Open Delivery Persons
              </Button>
            </Box>
          </Box>
        </GlassPageHeader>
      </motion.div>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: index < 3 ? 4 : 6 }} key={stat.title}>
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              subtitle={stat.subtitle}
              trend={stat.trend}
              delay={index}
            />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {[
              {
                label: 'Pending Approvals',
                count: stats.pendingApprovals || 0,
                color: '#f59e0b',
                path: '/delivery/personnel',
              },
              {
                label: 'Documents Queue',
                count: stats.pendingApprovals || 0,
                color: '#3b82f6',
                path: '/delivery/documents',
              },
              {
                label: 'Delivery Persons',
                count: stats.totalDeliveryPersons || 0,
                color: '#8b5cf6',
                path: '/delivery/personnel',
              },
            ].map((action) => (
              <Grid size={{ xs: 12, sm: 4 }} key={action.label}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Box
                    onClick={() => navigate(action.path)}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,250,255,0.96) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.45)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 4px 20px ${action.color}20`,
                      },
                    }}
                  >
                    <Typography variant="body1" fontWeight={500}>
                      {action.label}
                    </Typography>
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        background: `${action.color}15`,
                        color: action.color,
                        fontWeight: 700,
                        fontSize: '0.875rem',
                      }}
                    >
                      {action.count}
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>
    </Box>
  );
}
