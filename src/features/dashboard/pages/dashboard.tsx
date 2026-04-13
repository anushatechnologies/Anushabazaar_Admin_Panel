import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  TwoWheeler as BikeIcon,
  ShoppingCart as OrderIcon,
  CurrencyRupee as IncomeIcon,
  Cancel as CancelIcon,
  CheckCircle as DeliveredIcon,
  People as PeopleIcon,
  LocalShipping as DeliveryIcon,
  CheckCircle as CompletedIcon,
  PendingActions as PendingIcon,
  TrendingUp as TrendingIcon,
  PersonPin as RiderIcon,
} from '@mui/icons-material';
import {
  useGetDashboardSummaryQuery,
  useGetOrderAnalyticsQuery,
  useGetRecentOrdersQuery,
} from '../api/dashboardApi';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { GradientText } from '../../../components/glassmorphism/GlassComponents';

// ─── helpers ─────────────────────────────────────────────────────────────────

type Period = 'today' | 'week' | 'month' | 'all';

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  all: 'All Time',
};

const fmtNum = (v: number | undefined) => new Intl.NumberFormat('en-IN').format(Number(v ?? 0));

const fmtRupee = (v: number | undefined) =>
  `₹${Number(v ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const STATUS_COLORS: Record<string, string> = {
  placed: '#f59e0b',
  confirmed: '#8b5cf6',
  assigned: '#3b82f6',
  delivered: '#059669',
  cancelled: '#ef4444',
  rejected: '#dc2626',
  processing: '#06b6d4',
};

// ─── sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, sub, loading }) => {
  const { isDark } = useAppTheme();
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: `1.5px solid ${alpha(color, isDark ? 0.3 : 0.2)}`,
        background: isDark
          ? `linear-gradient(135deg, rgba(30,41,59,0.96) 0%, rgba(15,23,42,0.9) 100%)`
          : `linear-gradient(135deg, #fff 0%, ${alpha(color, 0.04)} 100%)`,
        boxShadow: `0 4px 20px ${alpha(color, isDark ? 0.14 : 0.08)}`,
        height: '100%',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} mb={1.5}>
        <Avatar sx={{ bgcolor: alpha(color, 0.15), color, width: 44, height: 44 }}>
          <Icon fontSize="small" />
        </Avatar>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          textTransform="uppercase"
          letterSpacing={0.8}
        >
          {label}
        </Typography>
      </Stack>
      {loading ? (
        <CircularProgress size={22} sx={{ color }} />
      ) : (
        <Typography variant="h4" fontWeight={900} sx={{ color }}>
          {value}
        </Typography>
      )}
      {sub && (
        <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
          {sub}
        </Typography>
      )}
    </Paper>
  );
};

// ─── main component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentTheme, isDark } = useAppTheme();
  const [period, setPeriod] = useState<Period>('today');

  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummaryQuery();
  const { data: analytics, isLoading: analyticsLoading } = useGetOrderAnalyticsQuery(period);
  const { data: recentOrders = [], isLoading: ordersLoading } = useGetRecentOrdersQuery();

  // ── period-aware values ───────────────────────────────────────────────────

  const orders = useMemo(() => {
    if (!summary) return { count: 0, cancelled: 0, delivered: 0 };
    switch (period) {
      case 'today':
        return {
          count: summary.todayOrders,
          cancelled: summary.cancelledToday,
          delivered: summary.deliveredToday,
        };
      case 'week':
        return {
          count: summary.weekOrders,
          cancelled: summary.cancelledWeek,
          delivered: summary.deliveredWeek,
        };
      case 'month':
        return {
          count: summary.monthOrders,
          cancelled: summary.cancelledMonth,
          delivered: summary.deliveredMonth,
        };
      default:
        return {
          count: summary.totalOrders,
          cancelled: summary.cancelledTotal,
          delivered: summary.deliveredTotal,
        };
    }
  }, [summary, period]);

  const income = useMemo(() => {
    if (!summary) return 0;
    switch (period) {
      case 'today':
        return summary.todayIncome;
      case 'week':
        return summary.weekIncome;
      case 'month':
        return summary.monthIncome;
      default:
        return summary.totalIncome;
    }
  }, [summary, period]);

  // ── style helpers ─────────────────────────────────────────────────────────

  const cardBg = isDark
    ? 'linear-gradient(180deg, rgba(30,41,59,0.97) 0%, rgba(15,23,42,0.92) 100%)'
    : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)';

  const sectionStyle = {
    p: 3,
    borderRadius: 4,
    background: cardBg,
    border: `1px solid ${currentTheme.border}`,
    boxShadow: isDark ? '0 8px 32px rgba(2,8,23,0.3)' : '0 4px 24px rgba(15,23,42,0.07)',
  };

  const analyticsStatuses = [
    'placed',
    'confirmed',
    'assigned',
    'delivered',
    'cancelled',
    'rejected',
  ] as const;

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <Paper sx={{ ...sectionStyle, p: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" fontWeight={900} mb={0.5}>
                <GradientText>Admin Dashboard</GradientText>
              </Typography>
              <Typography color="text.secondary" variant="body2">
                {dayjs().format('dddd, DD MMMM YYYY')} — Live operational overview
              </Typography>
            </Box>

            {/* Period Filter */}
            <ToggleButtonGroup
              value={period}
              exclusive
              onChange={(_, v) => v && setPeriod(v)}
              size="small"
              sx={{ flexShrink: 0 }}
            >
              {(['today', 'week', 'month', 'all'] as Period[]).map((p) => (
                <ToggleButton
                  key={p}
                  value={p}
                  sx={{
                    px: 2,
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    '&.Mui-selected': {
                      background: currentTheme.accent,
                      color: '#fff',
                      '&:hover': { background: currentTheme.accent },
                    },
                  }}
                >
                  {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        </Paper>
      </motion.div>

      {/* ── Section label ──────────────────────────────────────────────────── */}
      <Typography
        variant="subtitle1"
        fontWeight={800}
        color="text.secondary"
        textTransform="uppercase"
        letterSpacing={1}
        sx={{ mt: -1, mb: -1 }}
      >
        Orders — {PERIOD_LABELS[period]}
      </Typography>

      {/* ── Order Stat Cards ───────────────────────────────────────────────── */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Orders"
            value={fmtNum(orders.count)}
            icon={OrderIcon}
            color="#6366f1"
            sub={`${PERIOD_LABELS[period]}`}
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Delivered"
            value={fmtNum(orders.delivered)}
            icon={DeliveredIcon}
            color="#059669"
            sub={`${PERIOD_LABELS[period]}`}
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Cancelled"
            value={fmtNum(orders.cancelled)}
            icon={CancelIcon}
            color="#ef4444"
            sub={`${PERIOD_LABELS[period]}`}
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total Orders (All)"
            value={fmtNum(summary?.totalOrders)}
            icon={TrendingIcon}
            color="#8b5cf6"
            sub="All time"
            loading={summaryLoading}
          />
        </Grid>
      </Grid>

      {/* ── Income Stat Cards ──────────────────────────────────────────────── */}
      <Typography
        variant="subtitle1"
        fontWeight={800}
        color="text.secondary"
        textTransform="uppercase"
        letterSpacing={1}
        sx={{ mb: -1 }}
      >
        Income — {PERIOD_LABELS[period]}
      </Typography>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label={`${PERIOD_LABELS[period]} Income`}
            value={fmtRupee(income)}
            icon={IncomeIcon}
            color="#f59e0b"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Today Income"
            value={fmtRupee(summary?.todayIncome)}
            icon={IncomeIcon}
            color="#10b981"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="This Month"
            value={fmtRupee(summary?.monthIncome)}
            icon={IncomeIcon}
            color="#3b82f6"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total Income"
            value={fmtRupee(summary?.totalIncome)}
            icon={IncomeIcon}
            color="#6366f1"
            sub={`Razorpay: ${fmtRupee(summary?.razorpayIncome)} | COD: ${fmtRupee(summary?.codIncome)}`}
            loading={summaryLoading}
          />
        </Grid>
      </Grid>

      {/* ── Analytics + Delivery + Recent ─────────────────────────────────── */}
      <Grid container spacing={3}>
        {/* Order Status Breakdown */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={sectionStyle}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Order Analytics
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Status breakdown · {PERIOD_LABELS[period]}
                </Typography>
              </Box>
              <Chip
                label={`Total: ${analytics?.total ?? 0}`}
                color="primary"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            {analyticsLoading ? (
              <Box display="flex" justifyContent="center" py={5}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {analyticsStatuses.map((status) => {
                  const count = analytics?.[status] ?? 0;
                  const total = analytics?.total ?? 1;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const color = STATUS_COLORS[status] ?? '#6b7280';
                  return (
                    <Grid key={status} size={{ xs: 6, sm: 4, md: 2 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: `1.5px solid ${alpha(color, isDark ? 0.3 : 0.2)}`,
                          background: alpha(color, isDark ? 0.12 : 0.07),
                          textAlign: 'center',
                          height: '100%',
                        }}
                      >
                        <Typography variant="h5" fontWeight={900} sx={{ color }}>
                          {count}
                        </Typography>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          color="text.secondary"
                          textTransform="capitalize"
                        >
                          {status}
                        </Typography>
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ color: alpha(color, 0.8), fontWeight: 600 }}
                        >
                          {pct}%
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            {/* Payment split */}
            <Divider sx={{ my: 2.5 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box
                flex={1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha('#6366f1', isDark ? 0.12 : 0.06),
                  border: `1px solid ${alpha('#6366f1', 0.2)}`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  textTransform="uppercase"
                >
                  Razorpay Income
                </Typography>
                <Typography variant="h6" fontWeight={900} sx={{ color: '#6366f1' }}>
                  {fmtRupee(summary?.razorpayIncome)}
                </Typography>
              </Box>
              <Box
                flex={1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha('#059669', isDark ? 0.12 : 0.06),
                  border: `1px solid ${alpha('#059669', 0.2)}`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  textTransform="uppercase"
                >
                  COD Income
                </Typography>
                <Typography variant="h6" fontWeight={900} sx={{ color: '#059669' }}>
                  {fmtRupee(summary?.codIncome)}
                </Typography>
              </Box>
              <Box
                flex={1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha('#f59e0b', isDark ? 0.12 : 0.06),
                  border: `1px solid ${alpha('#f59e0b', 0.2)}`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  textTransform="uppercase"
                >
                  New Customers Today
                </Typography>
                <Typography variant="h6" fontWeight={900} sx={{ color: '#f59e0b' }}>
                  {fmtNum(summary?.newCustomers)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ ...sectionStyle, height: '100%' }}>
            <Typography variant="h6" fontWeight={800} mb={0.5}>
              Recent Orders
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Latest activity in the pipeline
            </Typography>

            {ordersLoading ? (
              <Box display="flex" justifyContent="center" py={5}>
                <CircularProgress />
              </Box>
            ) : recentOrders.length === 0 ? (
              <Box
                sx={{
                  minHeight: 180,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 3,
                  border: '1.5px dashed',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  fontWeight: 700,
                }}
              >
                No recent orders
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {recentOrders.slice(0, 6).map((order: any) => (
                  <motion.div key={order.id ?? order.orderNumber} whileHover={{ x: 3 }}>
                    <Box
                      onClick={() => order.id && navigate(`/admin/orders/${order.id}`)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: currentTheme.accent,
                          bgcolor: alpha(currentTheme.accent, 0.04),
                        },
                        transition: 'all 0.18s',
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: currentTheme.accent,
                          width: 36,
                          height: 36,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {order.customerName?.[0] ?? 'O'}
                      </Avatar>
                      <Box flex={1} minWidth={0}>
                        <Typography variant="body2" fontWeight={700} noWrap>
                          #{order.orderNumber ?? order.id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {order.customerName ?? 'Unknown'}
                        </Typography>
                      </Box>
                      <Box textAlign="right" flexShrink={0}>
                        <Typography variant="body2" fontWeight={800} color="success.main">
                          ₹
                          {Number(order.grandTotal ?? order.totalAmount ?? 0).toLocaleString(
                            'en-IN',
                          )}
                        </Typography>
                        <Chip
                          label={order.orderStatus ?? 'placed'}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: 10,
                            fontWeight: 700,
                            bgcolor: alpha(
                              STATUS_COLORS[order.orderStatus?.toLowerCase() ?? 'placed'] ??
                                '#6b7280',
                              0.15,
                            ),
                            color:
                              STATUS_COLORS[order.orderStatus?.toLowerCase() ?? 'placed'] ??
                              '#6b7280',
                          }}
                        />
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ── Delivery Section ───────────────────────────────────────────────── */}
      <Typography
        variant="subtitle1"
        fontWeight={800}
        color="text.secondary"
        textTransform="uppercase"
        letterSpacing={1}
        sx={{ mb: -1 }}
      >
        Delivery Operations
      </Typography>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            label="Online Riders"
            value={fmtNum(summary?.onlineDeliveryPersons)}
            icon={BikeIcon}
            color="#3b82f6"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            label="Active Deliveries"
            value={fmtNum(summary?.deliveryOrdersActive)}
            icon={DeliveryIcon}
            color="#f59e0b"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            label="Completed"
            value={fmtNum(summary?.deliveryOrdersCompleted)}
            icon={CompletedIcon}
            color="#059669"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            label="Total Delivery Orders"
            value={fmtNum(summary?.deliveryOrdersTotal)}
            icon={OrderIcon}
            color="#8b5cf6"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            label="Approved Riders"
            value={fmtNum(summary?.approvedDeliveryPersons)}
            icon={RiderIcon}
            color="#06b6d4"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <StatCard
            label="Pending Approvals"
            value={fmtNum(summary?.pendingApprovals)}
            icon={PendingIcon}
            color="#ef4444"
            loading={summaryLoading}
          />
        </Grid>
      </Grid>

      {/* ── Users ─────────────────────────────────────────────────────────── */}
      <Typography
        variant="subtitle1"
        fontWeight={800}
        color="text.secondary"
        textTransform="uppercase"
        letterSpacing={1}
        sx={{ mb: -1 }}
      >
        Users
      </Typography>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total Users"
            value={fmtNum(summary?.activeUsers)}
            icon={PeopleIcon}
            color="#6366f1"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="New Customers Today"
            value={fmtNum(summary?.newCustomers)}
            icon={TrendingIcon}
            color="#f59e0b"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total Delivery Persons"
            value={fmtNum(summary?.totalDeliveryPersons)}
            icon={RiderIcon}
            color="#3b82f6"
            loading={summaryLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total Cancelled (All)"
            value={fmtNum(summary?.cancelledTotal)}
            icon={CancelIcon}
            color="#dc2626"
            loading={summaryLoading}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
