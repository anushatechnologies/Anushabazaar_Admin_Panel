import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Divider,
  Grid,
} from '@mui/material';
import {
  Store as StoreIcon,
  Close as CloseIcon,
  ShoppingBag as OrderIcon,
  CurrencyRupee as IncomeIcon,
  CheckCircle as DeliveredIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useAppTheme } from '@contexts/ThemeContext';
import {
  GlassCard,
  GlassPageHeader,
  GradientText,
  GlassBadge,
} from '../../../components/glassmorphism/GlassComponents';
import EmptyState from '../../../components/empty-state/EmptyState';
import {
  useGetStoreDashboardQuery,
  useGetStoreOrdersQuery,
  useGetStoreIncomeQuery,
} from '../../admin/api/adminApi';

const formatRupee = (v?: number | string) =>
  `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getStatusColor = (status: string) => {
  const s = (status || '').toLowerCase();
  if (s === 'placed') return '#f59e0b';
  if (s === 'confirmed') return '#8b5cf6';
  if (s === 'assigned') return '#3b82f6';
  if (s === 'delivered') return '#059669';
  if (s === 'cancelled' || s === 'rejected') return '#ef4444';
  return '#6b7280';
};

// ── Store Details Dialog ─────────────────────────────────────────────────────

interface StoreDetailDialogProps {
  storeId: number | null;
  storeName: string;
  open: boolean;
  onClose: () => void;
}

const StoreDetailDialog: React.FC<StoreDetailDialogProps> = ({
  storeId,
  storeName,
  open,
  onClose,
}) => {
  const { currentTheme } = useAppTheme();
  const [tab, setTab] = useState(0);

  const { data: ordersData, isLoading: isLoadingOrders } = useGetStoreOrdersQuery(storeId!, {
    skip: !storeId,
  });
  const { data: incomeData, isLoading: isLoadingIncome } = useGetStoreIncomeQuery(storeId!, {
    skip: !storeId,
  });

  const orders: any[] = Array.isArray(ordersData) ? ordersData : [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 900,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <StoreIcon color="primary" />
          <Typography fontWeight={900}>{storeName}</Typography>
        </Stack>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ px: 3, borderBottom: `1px solid ${currentTheme.border}` }}
      >
        <Tab label="Orders" icon={<OrderIcon fontSize="small" />} iconPosition="start" />
        <Tab label="Income" icon={<IncomeIcon fontSize="small" />} iconPosition="start" />
      </Tabs>

      <DialogContent>
        {/* ── Orders tab ── */}
        {tab === 0 &&
          (isLoadingOrders ? (
            <CircularProgress />
          ) : orders.length === 0 ? (
            <EmptyState
              type="empty"
              title="No orders yet"
              description="This store has not fulfilled any orders."
            />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: `${currentTheme.border}30` }}>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Store Subtotal</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Placed At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.orderId} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {order.orderNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{order.customerName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.customerPhone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="success.main">
                          {formatRupee(order.storeSubtotal)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.orderStatus}
                          size="small"
                          sx={{
                            bgcolor: `${getStatusColor(order.orderStatus)}15`,
                            color: getStatusColor(order.orderStatus),
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(order.placedAt).format('DD MMM, hh:mm A')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ))}

        {/* ── Income tab ── */}
        {tab === 1 &&
          (isLoadingIncome ? (
            <CircularProgress />
          ) : incomeData ? (
            <Grid container spacing={3} sx={{ pt: 1 }}>
              {[
                { label: "Today's Income", value: incomeData.todayIncome, color: '#8b5cf6' },
                { label: 'This Week', value: incomeData.weekIncome, color: '#3b82f6' },
                { label: 'This Month', value: incomeData.monthIncome, color: '#f59e0b' },
                { label: 'Total Income', value: incomeData.totalIncome, color: '#059669' },
              ].map((item) => (
                <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      borderColor: `${item.color}40`,
                      background: `${item.color}08`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      textTransform="uppercase"
                    >
                      {item.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={900} sx={{ color: item.color, mt: 0.5 }}>
                      {formatRupee(item.value)}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
              <Grid size={12}>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                  <Typography color="text.secondary">Delivered Orders</Typography>
                  <Typography fontWeight={700}>{incomeData.deliveredOrders}</Typography>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <EmptyState
              type="empty"
              title="No income data"
              description="No delivered orders found for this store."
            />
          ))}
      </DialogContent>
    </Dialog>
  );
};

// ── Main StoreDashboard Page ──────────────────────────────────────────────────

const StoreDashboard: React.FC = () => {
  const { currentTheme } = useAppTheme();
  const [selectedStore, setSelectedStore] = useState<{ id: number; name: string } | null>(null);

  const { data: storesData, isLoading, isError } = useGetStoreDashboardQuery();
  const stores: any[] = Array.isArray(storesData) ? storesData : [];

  const totalOrders = stores.reduce((s, st) => s + (st.totalOrders || 0), 0);
  const totalDelivered = stores.reduce((s, st) => s + (st.deliveredOrders || 0), 0);
  const totalIncome = stores.reduce((s, st) => s + Number(st.totalIncome || 0), 0);

  if (isLoading)
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  if (isError)
    return (
      <Box p={4} textAlign="center">
        <Typography color="error">Failed to load store dashboard.</Typography>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: currentTheme.bg, minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassPageHeader>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                <GradientText>Store Dashboard</GradientText>
              </Typography>
              <Typography color="text.secondary">Per-store orders and income analytics</Typography>
            </Box>
            <GlassBadge statusColor={currentTheme.accent}>{stores.length} Stores</GlassBadge>
          </Box>
        </GlassPageHeader>
      </motion.div>

      {/* ── Summary row ─────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: 'Total Orders', value: totalOrders, color: '#8b5cf6', Icon: OrderIcon },
          {
            label: 'Delivered Orders',
            value: totalDelivered,
            color: '#059669',
            Icon: DeliveredIcon,
          },
          {
            label: 'Total Income',
            value: formatRupee(totalIncome),
            color: '#f59e0b',
            Icon: IncomeIcon,
          },
        ].map((stat) => (
          <Grid size={{ xs: 12, sm: 4 }} key={stat.label}>
            <GlassCard sx={{ p: 3, borderLeft: `4px solid ${stat.color}` }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{ bgcolor: `${stat.color}20`, color: stat.color, width: 48, height: 48 }}
                >
                  <stat.Icon />
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    textTransform="uppercase"
                  >
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={900} sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                </Box>
              </Stack>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {/* ── Store cards ────────────────────────────────────────────────── */}
      {stores.length === 0 ? (
        <GlassCard sx={{ p: 4 }}>
          <EmptyState
            type="empty"
            title="No stores found"
            description="Create stores first to see analytics here."
          />
        </GlassCard>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {stores.map((store: any, idx: number) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={store.storeId}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{ height: '100%' }}
                >
                  <GlassCard
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 32px ${currentTheme.accent}30`,
                      },
                    }}
                    onClick={() => setSelectedStore({ id: store.storeId, name: store.storeName })}
                  >
                    {/* Store header */}
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <Avatar
                        src={store.imageUrl}
                        variant="rounded"
                        sx={{ width: 52, height: 52, border: `2px solid ${currentTheme.border}` }}
                      >
                        <StoreIcon />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight={800}>
                          {store.storeName}
                        </Typography>
                        {store.storePhone && (
                          <Typography variant="caption" color="text.secondary">
                            {store.storePhone}
                          </Typography>
                        )}
                        <Chip
                          size="small"
                          label={store.active ? 'Active' : 'Inactive'}
                          color={store.active ? 'success' : 'default'}
                          sx={{ ml: 1, height: 18, fontSize: 10 }}
                        />
                      </Box>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    {/* Stats row */}
                    <Stack direction="row" justifyContent="space-between">
                      <Box textAlign="center">
                        <Typography variant="h6" fontWeight={900} color="primary">
                          {store.totalOrders}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Orders
                        </Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="h6" fontWeight={900} color="success.main">
                          {store.deliveredOrders}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Delivered
                        </Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="h6" fontWeight={900} sx={{ color: '#f59e0b' }}>
                          {formatRupee(store.totalIncome)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Income
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        textAlign: 'center',
                        mt: 2,
                        color: currentTheme.accent,
                        fontWeight: 700,
                      }}
                    >
                      Click to view orders & income →
                    </Typography>
                  </GlassCard>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      {/* ── Store detail dialog ──────────────────────────────────────────── */}
      {selectedStore && (
        <StoreDetailDialog
          storeId={selectedStore.id}
          storeName={selectedStore.name}
          open={!!selectedStore}
          onClose={() => setSelectedStore(null)}
        />
      )}
    </Box>
  );
};

export default StoreDashboard;
