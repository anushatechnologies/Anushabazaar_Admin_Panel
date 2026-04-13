import React, { useMemo, useState } from 'react';
import { Avatar, Button, Chip, CircularProgress, Grid, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  useGetActiveUsersQuery,
  useGetDashboardSummaryQuery,
  useGetOrderAnalyticsQuery,
  useGetRecentOrdersQuery,
} from '../api/dashboardApi';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { GradientText } from '../../../components/glassmorphism/GlassComponents';

const fmt = (value: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(value || 0));

const statCards = [
  { key: 'orders', label: 'Total Orders', icon: ShoppingBag, color: '#22c55e' },
  { key: 'users', label: 'Active Users', icon: Users, color: '#38bdf8' },
  { key: 'revenue', label: 'Today Revenue', icon: IndianRupee, color: '#f59e0b' },
  { key: 'customers', label: 'New Customers', icon: TrendingUp, color: '#a855f7' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentTheme, isDark } = useAppTheme();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummaryQuery();
  const { data: activeUsers, isLoading: usersLoading } = useGetActiveUsersQuery();
  const { data: analytics, isLoading: analyticsLoading } = useGetOrderAnalyticsQuery(period);
  const { data: recentOrders, isLoading: ordersLoading } = useGetRecentOrdersQuery();

  const summaryStats = (summary as any)?.summary ?? summary ?? {};

  const recentOrdersList = useMemo(() => {
    if (!recentOrders) return [];
    if (Array.isArray(recentOrders)) return recentOrders;
    if (Array.isArray((recentOrders as any).orders)) return (recentOrders as any).orders;
    return [];
  }, [recentOrders]);

  const analyticsCards = [
    { label: 'Pending', value: (analytics as any)?.pending ?? 0, tone: '#f59e0b', icon: Clock3 },
    {
      label: 'Confirmed',
      value: (analytics as any)?.confirmed ?? 0,
      tone: '#38bdf8',
      icon: CheckCircle2,
    },
    {
      label: 'Delivered',
      value: (analytics as any)?.delivered ?? 0,
      tone: '#22c55e',
      icon: Package,
    },
    {
      label: 'Cancelled',
      value: (analytics as any)?.cancelled ?? 0,
      tone: '#fb7185',
      icon: TrendingUp,
    },
  ];

  const formatCurrency = (value: number) => `Rs ${fmt(value)}`;
  const heroBackground = isDark
    ? 'linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,41,59,0.84) 100%)'
    : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(238,242,255,0.96) 100%)';
  const sectionBackground = isDark
    ? 'linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(11,17,32,0.86) 100%)'
    : 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(249,251,255,0.96) 100%)';

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section
        className="admin-card"
        style={{
          padding: 28,
          display: 'grid',
          gap: 24,
          background: heroBackground,
          borderRadius: 28,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <Typography
              className="panel-title"
              sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 800 }}
            >
              <GradientText>Admin control center</GradientText>
            </Typography>
            <div style={{ fontSize: 15, color: 'var(--color-text-muted)', marginTop: 8 }}>
              Live operational overview for orders, customers, delivery, and revenue on{' '}
              {dayjs().format('DD MMMM YYYY')}.
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
              <Chip label="Operations live" color="success" size="small" variant="outlined" />
              <Chip label={`Snapshot ${period}`} color="primary" size="small" variant="outlined" />
            </div>
          </div>
          <Button
            onClick={() => navigate('/admin/orders')}
            variant="contained"
            endIcon={<ArrowRight size={16} />}
            sx={{
              px: 2.5,
              py: 1.3,
              borderRadius: 999,
              minWidth: { xs: '100%', sm: 'auto' },
            }}
          >
            Open order desk
          </Button>
        </div>

        <Grid container spacing={2.5}>
          {statCards.map((card) => {
            const Icon = card.icon;
            const value =
              card.key === 'orders'
                ? (summaryStats?.totalOrders ?? 0)
                : card.key === 'users'
                  ? (activeUsers?.count ?? summaryStats?.activeUsers ?? 0)
                  : card.key === 'revenue'
                    ? formatCurrency(summaryStats?.todayRevenue ?? 0)
                    : (summaryStats?.newCustomers ?? 0);

            return (
              <Grid key={card.key} size={{ xs: 12, sm: 6, lg: 3 }}>
                <div
                  className="admin-card"
                  style={{
                    padding: 20,
                    display: 'grid',
                    gap: 18,
                    minHeight: 160,
                    border: `1px solid ${alpha(card.color, isDark ? 0.26 : 0.16)}`,
                    boxShadow: isDark
                      ? `0 16px 30px ${alpha('#020617', 0.28)}`
                      : `0 14px 30px ${alpha(card.color, 0.1)}`,
                    background: isDark
                      ? 'linear-gradient(180deg, rgba(30,41,59,0.94) 0%, rgba(15,23,42,0.9) 100%)'
                      : 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
                    borderRadius: 24,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 18,
                        background: alpha(card.color, isDark ? 0.22 : 0.16),
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Icon size={20} color={card.color} />
                    </div>
                    <div
                      style={{ fontSize: 12, color: 'var(--color-text-subtle)', fontWeight: 700 }}
                    >
                      LIVE
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        color: 'var(--color-text-muted)',
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      {card.label}
                    </div>
                    <div
                      className="panel-title"
                      style={{ fontSize: 30, color: 'var(--color-text)' }}
                    >
                      {summaryLoading || usersLoading ? <CircularProgress size={24} /> : value}
                    </div>
                  </div>
                </div>
              </Grid>
            );
          })}
        </Grid>
      </section>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <section
            className="admin-card"
            style={{
              padding: 24,
              display: 'grid',
              gap: 20,
              height: '100%',
              background: sectionBackground,
              borderRadius: 28,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div className="panel-title" style={{ fontSize: 24, color: 'var(--color-text)' }}>
                  Order analytics
                </div>
                <div style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Status performance snapshot
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['today', 'week', 'month'] as const).map((item) => (
                  <Button
                    key={item}
                    onClick={() => setPeriod(item)}
                    variant={period === item ? 'contained' : 'outlined'}
                    sx={{
                      minWidth: 0,
                      px: 2,
                      py: 1,
                      color: period === item ? '#fff' : 'var(--color-text)',
                      background:
                        period === item
                          ? 'var(--color-accent-grad)'
                          : isDark
                            ? 'rgba(255,255,255,0.02)'
                            : alpha(currentTheme.accent, 0.03),
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>

            {analyticsLoading ? (
              <div style={{ display: 'grid', placeItems: 'center', minHeight: 220 }}>
                <CircularProgress />
              </div>
            ) : (
              <Grid container spacing={2}>
                {analyticsCards.map(({ label, value, tone, icon: Icon }) => (
                  <Grid key={label} size={{ xs: 6, md: 3 }}>
                    <div
                      style={{
                        borderRadius: 18,
                        padding: 18,
                        border: '1px solid var(--color-border)',
                        background: isDark ? alpha(tone, 0.14) : alpha(tone, 0.1),
                        minHeight: 124,
                        boxShadow: `0 10px 24px ${alpha(tone, isDark ? 0.16 : 0.12)}`,
                      }}
                    >
                      <Icon size={18} color={tone} />
                      <div
                        className="panel-title"
                        style={{ fontSize: 28, marginTop: 16, color: 'var(--color-text)' }}
                      >
                        {value}
                      </div>
                      <div
                        style={{ color: 'var(--color-text-muted)', fontWeight: 700, marginTop: 4 }}
                      >
                        {label}
                      </div>
                    </div>
                  </Grid>
                ))}
              </Grid>
            )}
          </section>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <section
            className="admin-card"
            style={{
              padding: 24,
              display: 'grid',
              gap: 18,
              height: '100%',
              background: sectionBackground,
              borderRadius: 28,
            }}
          >
            <div>
              <div className="panel-title" style={{ fontSize: 24, color: 'var(--color-text)' }}>
                Recent orders
              </div>
              <div style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
                Latest activity in the pipeline
              </div>
            </div>

            {ordersLoading ? (
              <div style={{ display: 'grid', placeItems: 'center', minHeight: 220 }}>
                <CircularProgress />
              </div>
            ) : recentOrdersList.length === 0 ? (
              <div
                style={{
                  minHeight: 220,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 18,
                  border: '1px dashed var(--color-border)',
                  color: 'var(--color-text-muted)',
                  fontWeight: 700,
                }}
              >
                Recent orders will appear here
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {recentOrdersList.slice(0, 5).map((order: any) => (
                  <motion.button
                    key={order.id ?? order.orderNumber}
                    whileHover={{ y: -2 }}
                    onClick={() => order.id && navigate(`/admin/orders/${order.id}`)}
                    style={{
                      textAlign: 'left',
                      borderRadius: 18,
                      padding: 14,
                      border: '1px solid var(--color-border)',
                      background: isDark
                        ? 'linear-gradient(180deg, rgba(30,41,59,0.92) 0%, rgba(15,23,42,0.84) 100%)'
                        : 'var(--color-card)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      boxShadow: isDark
                        ? '0 12px 24px rgba(2,8,23,0.22)'
                        : '0 10px 22px rgba(15,23,42,0.05)',
                    }}
                  >
                    <Avatar
                      sx={{ bgcolor: 'var(--color-accent)', width: 38, height: 38, fontSize: 14 }}
                    >
                      {order.customerName?.[0] ?? 'O'}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'var(--color-text)', fontWeight: 800 }}>
                        #{order.orderNumber ?? order.id}
                      </div>
                      <div
                        style={{
                          color: 'var(--color-text-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {order.customerName ?? 'Unknown customer'}
                      </div>
                    </div>
                    <div style={{ color: 'var(--color-text)', fontWeight: 700 }}>
                      {formatCurrency(order.grandTotal ?? order.totalAmount ?? 0)}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </section>
        </Grid>
      </Grid>
    </div>
  );
}
