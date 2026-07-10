import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Stack,
  Avatar,
  Tabs,
  Tab,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from '@mui/material';
import {
  LocalShipping as LocalShippingIcon,
  RemoveRedEye as ViewIcon,
  Person as PersonIcon,
  Assignment as OrderIcon,
  Schedule as TimeIcon,
  VpnKey as OtpIcon,
  Close as CloseIcon,
  Store as StoreIcon,
  Send as SendIcon,
  CellTower as BroadcastIcon,
  CurrencyRupee as RefundIcon,
} from '@mui/icons-material';
import {
  useGetAdminOrdersQuery,
  useGetAdminOrderByIdQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useAssignDeliveryMutation,
  useGenerateDeliveryOtpMutation,
  useSendStorePickupOtpMutation,
  useNotifyStoreMutation,
  useBroadcastOrderMutation,
  useRefundAdminOrderMutation,
} from '../api/orderApi';
import { useGetAvailableDeliveryPersonsQuery } from '../../delivery/api/deliveryApi';
import { AdminOrderSummaryDto, CustomerAddressDto } from '../types/index';

type VehicleType = 'BIKE' | 'AUTO' | 'HEAVY';

/**
 * Three broadcast groups:
 *  BIKE  → notifies Bike + Scooty + EV riders
 *  AUTO  → notifies Auto riders only
 *  HEAVY → notifies Heavy vehicle riders only
 */
const VEHICLE_OPTIONS: { value: VehicleType; label: string; emoji: string; subtitle: string }[] = [
  {
    value: 'BIKE',
    label: 'Bike / Scooty / EV',
    emoji: '🏍️',
    subtitle: 'Notifies all bike, scooty & EV riders',
  },
  { value: 'AUTO', label: 'Auto', emoji: '🛺', subtitle: 'Notifies auto riders only' },
  {
    value: 'HEAVY',
    label: 'Heavy Vehicle',
    emoji: '🚚',
    subtitle: 'Notifies heavy vehicle riders only',
  },
];
import dayjs from 'dayjs';
import { toast } from '@components/toast/ToastContainer';
import {
  GlassCard,
  GlassPageHeader,
  GradientText,
  GlassBadge,
} from '../../../components/glassmorphism/GlassComponents';
import { useAppTheme } from '@contexts/ThemeContext';
import EmptyState from '../../../components/empty-state/EmptyState';

const AdminOrderDashboard: React.FC = () => {
  const { currentTheme } = useAppTheme();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  // Broadcast (vehicle-type FCFS) state
  const [assignMode, setAssignMode] = useState<'broadcast' | 'manual'>('broadcast');
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>('BIKE');
  const [broadcastResult, setBroadcastResult] = useState<{
    broadcastId: number;
    expiresAt: string;
  } | null>(null);

  const {
    data: orders,
    isLoading,
    isError,
    refetch,
  } = useGetAdminOrdersQuery(undefined, {
    pollingInterval: 3000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const { data: orderDetail, isFetching: isDetailFetching } = useGetAdminOrderByIdQuery(
    selectedOrderId || 0,
    {
      skip: !selectedOrderId,
      pollingInterval: 30000,
    },
  );

  const [sendingOtpOrderId, setSendingOtpOrderId] = useState<number | null>(null);
  const [notifyingStoreOrderId, setNotifyingStoreOrderId] = useState<number | null>(null);

  const [acceptOrder] = useAcceptOrderMutation();
  const [rejectOrder, { isLoading: isRejecting }] = useRejectOrderMutation();
  const [assignDelivery, { isLoading: isAssigning }] = useAssignDeliveryMutation();
  const [generateOtp, { isLoading: isGeneratingOtp }] = useGenerateDeliveryOtpMutation();
  const [sendStoreOtp, { isLoading: isSendingStoreOtp }] = useSendStorePickupOtpMutation();
  const [notifyStore] = useNotifyStoreMutation();
  const [broadcastOrder, { isLoading: isBroadcasting }] = useBroadcastOrderMutation();
  const [refundAdminOrder, { isLoading: isRefunding }] = useRefundAdminOrderMutation();

  const { data: availablePersonnel, isLoading: isLoadingPersonnel } =
    useGetAvailableDeliveryPersonsQuery();

  const ordersList = useMemo(() => {
    const raw: any = orders;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.orders)) return raw.orders;
    return [];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const toSt = (st?: string) => (st ?? '').toLowerCase();
    if (activeTab === 0) return ordersList;
    if (activeTab === 1)
      return ordersList.filter((o: AdminOrderSummaryDto) => toSt(o.orderStatus) === 'placed');
    if (activeTab === 2)
      return ordersList.filter((o: AdminOrderSummaryDto) => toSt(o.orderStatus) === 'confirmed');
    if (activeTab === 3)
      return ordersList.filter((o: AdminOrderSummaryDto) => toSt(o.orderStatus) === 'assigned');
    if (activeTab === 4)
      return ordersList.filter((o: AdminOrderSummaryDto) => toSt(o.orderStatus) === 'delivered');
    if (activeTab === 5)
      return ordersList.filter((o: AdminOrderSummaryDto) =>
        ['cancelled', 'rejected'].includes(toSt(o.orderStatus)),
      );
    return ordersList;
  }, [ordersList, activeTab]);

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'placed') return '#f59e0b';
    if (s === 'confirmed') return '#8b5cf6';
    if (s === 'assigned') return '#3b82f6';
    if (s === 'delivered') return '#059669';
    if (s === 'cancelled' || s === 'rejected') return '#ef4444';
    return '#6b7280';
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      await acceptOrder(orderId).unwrap();
      toast.success('Order accepted successfully!');
      refetch();
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to accept order');
    }
  };

  const handleRejectOrder = async () => {
    if (selectedOrderId && rejectReason.trim()) {
      try {
        await rejectOrder({ orderId: selectedOrderId, reason: rejectReason }).unwrap();
        toast.success('Order rejected successfully!');
        setRejectDialogOpen(false);
        setRejectReason('');
        refetch();
      } catch (error) {
        toast.error('Failed to reject order');
      }
    }
  };

  const handleRefundOrder = async () => {
    if (!selectedOrderId) return;
    try {
      const amount = Number(refundAmount);
      const res = await refundAdminOrder({
        orderId: selectedOrderId,
        ...(amount > 0 ? { amount } : {}),
        reason: refundReason.trim() || 'Refund processed by admin',
      }).unwrap();
      toast.success(res.message || 'Refund processed successfully!');
      setRefundDialogOpen(false);
      setRefundReason('');
      setRefundAmount('');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.data?.error || 'Failed to process refund');
    }
  };

  const handleConfirmAssignDelivery = async () => {
    if (selectedOrderId && selectedDeliveryPerson) {
      try {
        await assignDelivery({
          orderId: selectedOrderId,
          deliveryPersonId: selectedDeliveryPerson,
          estimatedDeliveryTime: dayjs().add(1, 'hour').toISOString(),
        }).unwrap();
        toast.success('Order assigned successfully!');
        closeAssignDialog();
        refetch();
      } catch (error) {
        toast.error('Failed to assign delivery');
      }
    }
  };

  const handleBroadcastOrder = async () => {
    if (!selectedOrderId) return;
    try {
      const res = await broadcastOrder({
        orderId: selectedOrderId,
        vehicleType: selectedVehicleType,
      }).unwrap();
      setBroadcastResult({ broadcastId: res.broadcastId, expiresAt: res.expiresAt });
      toast.success(
        `Broadcast sent to all ${selectedVehicleType} riders! First to accept gets the order.`,
      );
      refetch();
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to broadcast order');
    }
  };

  const closeAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedDeliveryPerson(null);
    setBroadcastResult(null);
    setAssignMode('broadcast');
    setSelectedVehicleType('BIKE');
  };

  const handleGenerateOtp = async (orderId: number) => {
    try {
      const res = await generateOtp(orderId).unwrap();
      toast.success(`New Delivery OTP: ${res.deliveryOtp}`, 6000);
    } catch (error: any) {
      toast.error(error?.data?.error || error?.data?.message || 'Failed to generate OTP');
    }
  };

  const handleNotifyStore = async (orderId: number) => {
    if (notifyingStoreOrderId === orderId) return;
    setNotifyingStoreOrderId(orderId);
    try {
      await notifyStore(orderId).unwrap();
      toast.success('Store notified via WhatsApp! Waiting for store response...');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to notify store');
    } finally {
      setNotifyingStoreOrderId(null);
    }
  };

  const handleSendStoreOtp = async (orderId: number) => {
    if (sendingOtpOrderId === orderId) return; // prevent double-click
    setSendingOtpOrderId(orderId);
    try {
      await sendStoreOtp(orderId).unwrap();
      toast.success('Pickup OTP sent to store via WhatsApp!');
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to send store OTP');
    } finally {
      setSendingOtpOrderId(null);
    }
  };

  const formatAddress = (addr?: CustomerAddressDto) => {
    if (!addr) return 'No address provided';
    const parts = [
      addr.flatNumber,
      addr.addressLine1,
      addr.addressLine2,
      addr.landmark,
      addr.city,
      addr.state,
    ].filter((value): value is string => Boolean(value && String(value).trim()));
    return `${parts.join(', ')}${addr.postalCode ? ' - ' + addr.postalCode : ''}`;
  };

  if (isLoading)
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  if (isError)
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h5" color="error">
          Dashboard Connection Lost
        </Typography>
        <Button onClick={() => refetch()} variant="outlined" sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: currentTheme.bg, minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassPageHeader>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                <GradientText>Order Management</GradientText>
              </Typography>
              <Typography color="text.secondary">Monitor and process customer orders</Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <GlassBadge statusColor={currentTheme.accent}>
                {ordersList.length} Total Orders
              </GlassBadge>
              <GlassBadge statusColor="#10b981">Live refresh: 3s</GlassBadge>
            </Stack>
          </Box>
        </GlassPageHeader>
      </motion.div>

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          overflow: 'hidden',
          background: currentTheme.cardBg,
          border: `1px solid ${currentTheme.border}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`All (${ordersList.length})`} />
          <Tab
            label={`New Orders (${ordersList.filter((o: AdminOrderSummaryDto) => (o.orderStatus ?? '').toLowerCase() === 'placed').length})`}
          />
          <Tab
            label={`Assign Rider (${ordersList.filter((o: AdminOrderSummaryDto) => (o.orderStatus ?? '').toLowerCase() === 'confirmed').length})`}
          />
          <Tab
            label={`In Progress (${ordersList.filter((o: AdminOrderSummaryDto) => (o.orderStatus ?? '').toLowerCase() === 'assigned').length})`}
          />
          <Tab
            label={`Delivered (${ordersList.filter((o: AdminOrderSummaryDto) => (o.orderStatus ?? '').toLowerCase() === 'delivered').length})`}
          />
          <Tab
            label={`Cancelled (${ordersList.filter((o: AdminOrderSummaryDto) => ['cancelled', 'rejected'].includes((o.orderStatus ?? '').toLowerCase())).length})`}
          />
        </Tabs>
      </Paper>

      <GlassCard sx={{ p: 0, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: `${currentTheme.border}40` }}>
              <TableRow>
                <TableCell>Order Detail</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Pricing</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order: AdminOrderSummaryDto, idx: number) => (
                    <TableRow
                      key={order.id}
                      component={motion.tr}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.03 }}
                      hover
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: `${getStatusColor(order.orderStatus)}20`,
                              color: getStatusColor(order.orderStatus),
                            }}
                          >
                            <OrderIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={800}>
                              {order.orderNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              <TimeIcon sx={{ fontSize: 12 }} />{' '}
                              {dayjs(order.placedAt).format('DD MMM, hh:mm A')}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {order.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.customerPhone}
                        </Typography>
                        {order.deliveryPersonName && (
                          <Typography variant="caption" display="block" color="primary.main">
                            Rider: {order.deliveryPersonName}
                          </Typography>
                        )}
                        {(order as any).storeNames?.length > 0 && (
                          <Stack
                            direction="row"
                            spacing={0.5}
                            mt={0.5}
                            flexWrap="wrap"
                            alignItems="center"
                          >
                            {(order as any).storeCount > 1 && (
                              <Chip
                                size="small"
                                label={`${(order as any).storeCount} stores`}
                                color="warning"
                                sx={{ fontSize: 10, fontWeight: 800 }}
                              />
                            )}
                            {(order as any).storeNames.slice(0, 2).map((s: string) => (
                              <Chip
                                key={s}
                                label={s}
                                size="small"
                                icon={<StoreIcon sx={{ fontSize: 12 }} />}
                                variant="outlined"
                                sx={{ fontSize: 10 }}
                              />
                            ))}
                            {(order as any).storeNames.length > 2 && (
                              <Chip
                                size="small"
                                label={`+${(order as any).storeNames.length - 2}`}
                                variant="outlined"
                                sx={{ fontSize: 10 }}
                              />
                            )}
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={800} color={currentTheme.accent}>
                          ₹{order.grandTotal.toFixed(2)}
                        </Typography>
                        <Chip
                          size="small"
                          label={order.paymentStatus}
                          color={order.paymentStatus === 'PAID' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.orderStatus}
                          sx={{
                            bgcolor: `${getStatusColor(order.orderStatus)}15`,
                            color: getStatusColor(order.orderStatus),
                            fontWeight: 800,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setDetailDialogOpen(true);
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          {(order.orderStatus ?? '').toLowerCase() === 'placed' && (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                startIcon={<StoreIcon fontSize="small" />}
                                onClick={() => handleNotifyStore(order.id)}
                                disabled={notifyingStoreOrderId === order.id}
                              >
                                {notifyingStoreOrderId === order.id ? 'Notifying…' : 'Notify Store'}
                              </Button>
                              <Button
                                size="small"
                                color="success"
                                onClick={() => handleAcceptOrder(order.id)}
                              >
                                Accept
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setRejectDialogOpen(true);
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {(order.orderStatus ?? '').toLowerCase() === 'confirmed' && (
                            <Stack direction="row" spacing={1}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setAssignDialogOpen(true);
                                }}
                                startIcon={<LocalShippingIcon />}
                              >
                                Assign Rider
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<SendIcon fontSize="small" />}
                                onClick={() => handleSendStoreOtp(order.id)}
                                disabled={sendingOtpOrderId === order.id}
                              >
                                {sendingOtpOrderId === order.id ? 'Sending…' : 'Store OTP'}
                              </Button>
                            </Stack>
                          )}
                          {(order.orderStatus ?? '').toLowerCase() === 'assigned' &&
                            order.riderAssigned === false && (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setAssignDialogOpen(true);
                                }}
                                startIcon={<LocalShippingIcon />}
                              >
                                Assign Rider
                              </Button>
                            )}
                          {(order.orderStatus ?? '').toLowerCase() === 'assigned' &&
                            order.riderAssigned !== false && (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<OtpIcon fontSize="small" />}
                                onClick={() => handleGenerateOtp(order.id)}
                                disabled={isGeneratingOtp}
                              >
                                {isGeneratingOtp ? 'Generating…' : 'Delivery OTP'}
                              </Button>
                            )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                      <EmptyState
                        type="empty"
                        title="Nothing here"
                        description="No orders match this status."
                      />
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>

      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 5 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', justifyContent: 'space-between' }}>
          Order Details{' '}
          <IconButton onClick={() => setDetailDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {isDetailFetching ? (
            <CircularProgress />
          ) : (
            orderDetail && (
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="overline" color="text.secondary">
                    Customer Info
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight={800}>
                      {orderDetail.customerName}
                    </Typography>
                    <Typography color="text.secondary">
                      {orderDetail.customerPhone} | {orderDetail.customerEmail}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="overline" color="text.secondary">
                    Delivery Address
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                    <Typography variant="body1">{formatAddress(orderDetail.address)}</Typography>
                  </Paper>
                </Grid>

                {/* Rider details — shown after assignment */}
                {orderDetail.deliveryPersonName && (
                  <Grid size={12}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, borderRadius: 3, bgcolor: 'action.hover' }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <PersonIcon color="primary" />
                        <Box flex={1}>
                          <Typography variant="subtitle2" fontWeight={800}>
                            Rider: {orderDetail.deliveryPersonName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {orderDetail.deliveryPersonPhone}
                            {orderDetail.deliveryPersonVehicle
                              ? ` · ${orderDetail.deliveryPersonVehicle}`
                              : ''}
                            {orderDetail.deliveryPersonRating
                              ? ` · ⭐ ${orderDetail.deliveryPersonRating}`
                              : ''}
                          </Typography>
                        </Box>
                        {orderDetail.estimatedDeliveryTime && (
                          <Chip
                            size="small"
                            icon={<TimeIcon />}
                            label={`ETA: ${dayjs(orderDetail.estimatedDeliveryTime).format('hh:mm A')}`}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                )}

                {(orderDetail.orderStatus ?? '').toLowerCase() === 'assigned' &&
                  !orderDetail.deliveryPersonName && (
                    <Grid size={12}>
                      <Alert
                        severity="warning"
                        action={
                          <Button
                            color="inherit"
                            size="small"
                            onClick={() => {
                              setAssignDialogOpen(true);
                            }}
                          >
                            Assign Rider
                          </Button>
                        }
                      >
                        This order is marked as assigned, but no rider is linked yet.
                      </Alert>
                    </Grid>
                  )}

                {/* Pricing breakdown */}
                {(orderDetail as any).subtotal != null && (
                  <Grid size={12}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                      <Typography variant="overline" color="text.secondary" display="block" mb={1}>
                        Pricing Breakdown
                      </Typography>
                      <Stack spacing={0.5}>
                        {(() => {
                          const walletApplied = Number((orderDetail as any).walletApplied ?? 0);
                          const remainingPayable = Math.max(
                            Number(orderDetail.grandTotal ?? 0) - walletApplied,
                            0,
                          );

                          return (
                            <>
                        {[
                          { label: 'Subtotal', value: (orderDetail as any).subtotal },
                          { label: 'Delivery', value: (orderDetail as any).deliveryCharge },
                          { label: 'Platform Fee', value: (orderDetail as any).platformFee },
                          { label: 'Small Cart Fee', value: (orderDetail as any).smallCartFee },
                          { label: 'Taxable Value', value: (orderDetail as any).taxableAmount },
                          { label: 'CGST', value: (orderDetail as any).cgstAmount },
                          { label: 'SGST', value: (orderDetail as any).sgstAmount },
                          { label: 'IGST', value: (orderDetail as any).igstAmount },
                          { label: 'Total GST', value: (orderDetail as any).tax },
                          { label: 'Discount', value: -((orderDetail as any).discount ?? 0) },
                        ].map(
                          ({ label, value }) =>
                            value != null && (
                              <Box key={label} display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  {label}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  color={label === 'Discount' ? 'success.main' : 'text.primary'}
                                >
                                  {label === 'Discount' && value < 0 ? '−' : ''}₹
                                  {Math.abs(value).toFixed(2)}
                                </Typography>
                              </Box>
                            ),
                        )}
                        {walletApplied > 0 && (
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="primary.main">
                              Wallet Paid
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color="primary.main">
                              ₹{walletApplied.toFixed(2)}
                            </Typography>
                          </Box>
                        )}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          pt={0.5}
                          borderTop="1px solid"
                          sx={{ borderColor: 'divider' }}
                        >
                          <Typography variant="subtitle2" fontWeight={800}>
                            Grand Total
                          </Typography>
                          <Typography variant="subtitle2" fontWeight={800} color="primary">
                            ₹{orderDetail.grandTotal?.toFixed(2)}
                          </Typography>
                        </Box>
                        {walletApplied > 0 && (
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="subtitle2" fontWeight={800}>
                              Remaining Payable
                            </Typography>
                            <Typography variant="subtitle2" fontWeight={800} color="secondary.main">
                              ₹{remainingPayable.toFixed(2)}
                            </Typography>
                          </Box>
                        )}
                            </>
                          );
                        })()}
                      </Stack>
                    </Paper>
                  </Grid>
                )}

                {/* Refund status/action */}
                {['ONLINE', 'ONLINE_WALLET'].includes(
                  String(orderDetail.paymentMethod || '').toUpperCase(),
                ) && (
                  <Grid size={12}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={2}
                      >
                        <Box>
                          <Typography variant="overline" color="text.secondary" display="block">
                            Cashfree Refund
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip
                              size="small"
                              label={(orderDetail as any).refundStatus || 'NOT_REQUESTED'}
                              color={
                                (orderDetail as any).refundStatus === 'PROCESSED'
                                  ? 'success'
                                  : (orderDetail as any).refundStatus === 'FAILED'
                                    ? 'error'
                                    : 'warning'
                              }
                              variant="outlined"
                            />
                            {(orderDetail as any).refundAmount > 0 && (
                              <Typography variant="body2" color="text.secondary">
                                ₹{Number((orderDetail as any).refundAmount).toFixed(2)}
                              </Typography>
                            )}
                            {(orderDetail as any).refundId && (
                              <Typography variant="caption" color="text.secondary">
                                {(orderDetail as any).refundId}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                        <Button
                          variant="contained"
                          color="warning"
                          startIcon={<RefundIcon />}
                          disabled={
                            isRefunding ||
                            !['PAID', 'PARTIALLY_REFUNDED'].includes(
                              String(orderDetail.paymentStatus || '').toUpperCase(),
                            ) ||
                            ['PROCESSED', 'PENDING'].includes(
                              String((orderDetail as any).refundStatus || '').toUpperCase(),
                            )
                          }
                          onClick={() => {
                            setRefundReason(`Refund for order ${orderDetail.orderNumber}`);
                            setRefundAmount('');
                            setRefundDialogOpen(true);
                          }}
                        >
                          Process Refund
                        </Button>
                      </Stack>
                    </Paper>
                  </Grid>
                )}

                {/* Store Acceptance Status */}
                {orderDetail.storeStatus && (
                  <Grid size={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 2,
                        borderRadius: 2,
                        bgcolor:
                          orderDetail.storeStatus === 'STORE_ACCEPTED' ||
                          orderDetail.storeStatus === 'PICKUP_OTP_GENERATED' ||
                          orderDetail.storeStatus === 'PICKED_UP' ||
                          orderDetail.storeStatus === 'DELIVERED'
                            ? '#e8f5e9'
                            : orderDetail.storeStatus === 'STORE_REJECTED'
                              ? '#ffebee'
                              : '#fff8e1',
                      }}
                    >
                      <Typography fontSize={28}>
                        {orderDetail.storeStatus === 'STORE_ACCEPTED' ||
                        orderDetail.storeStatus === 'PICKUP_OTP_GENERATED' ||
                        orderDetail.storeStatus === 'PICKED_UP' ||
                        orderDetail.storeStatus === 'DELIVERED'
                          ? '✅'
                          : orderDetail.storeStatus === 'STORE_REJECTED'
                            ? '❌'
                            : '⏳'}
                      </Typography>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800}>
                          Store Response
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {orderDetail.storeStatus === 'STORE_ACCEPTED'
                            ? 'Store accepted the order'
                            : orderDetail.storeStatus === 'PICKUP_OTP_GENERATED'
                              ? 'Store accepted — OTP sent to store'
                              : orderDetail.storeStatus === 'STORE_REJECTED'
                                ? 'Store rejected the order'
                                : orderDetail.storeStatus === 'STORE_NOTIFIED'
                                  ? 'Waiting for store response...'
                                  : orderDetail.storeStatus === 'PICKED_UP'
                                    ? 'Rider picked up from store'
                                    : orderDetail.storeStatus === 'DELIVERED'
                                      ? 'Order delivered'
                                      : orderDetail.storeStatus.replace(/_/g, ' ')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Store groups — show which store fulfils which items */}
                {orderDetail.storeGroups && orderDetail.storeGroups.length > 0 ? (
                  orderDetail.storeGroups.map((group: any) => (
                    <Grid size={12} key={group.storeId}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <StoreIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle2" fontWeight={800}>
                            {group.storeName}
                          </Typography>
                          {group.storePhone && (
                            <Chip size="small" label={group.storePhone} variant="outlined" />
                          )}
                          {group.status && (
                            <Chip
                              size="small"
                              label={group.status.replace(/_/g, ' ')}
                              sx={{
                                bgcolor: `${getStatusColor(group.status)}15`,
                                color: getStatusColor(group.status),
                                fontWeight: 700,
                                fontSize: 10,
                              }}
                            />
                          )}
                        </Stack>
                        {['confirmed', 'assigned'].includes(
                          (orderDetail.orderStatus ?? '').toLowerCase(),
                        ) && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<SendIcon fontSize="small" />}
                            onClick={() => handleSendStoreOtp(orderDetail.id)}
                            disabled={sendingOtpOrderId === orderDetail.id || isSendingStoreOtp}
                          >
                            {sendingOtpOrderId === orderDetail.id ? 'Sending…' : 'Send OTP'}
                          </Button>
                        )}
                      </Box>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Item</TableCell>
                              <TableCell align="center">Qty</TableCell>
                              <TableCell align="right">Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {group.items.map((item: any, i: number) => (
                              <TableRow key={i}>
                                <TableCell>
                                  <Stack direction="row" spacing={1.5} alignItems="center">
                                    {item.imageUrl && (
                                      <Avatar
                                        src={item.imageUrl}
                                        variant="rounded"
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          border: `1px solid ${currentTheme.border}`,
                                        }}
                                      />
                                    )}
                                    <Box>
                                      <Typography variant="body2" fontWeight={600}>
                                        {item.productName}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {item.variantName}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </TableCell>
                                <TableCell align="center">{item.quantity}</TableCell>
                                <TableCell align="right">₹{item.totalPrice.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={2} align="right" sx={{ fontWeight: 700 }}>
                                Store Subtotal
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>
                                ₹{group.subtotal.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  ))
                ) : (
                  <Grid size={12}>
                    <Typography variant="overline" color="text.secondary">
                      Items
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell align="center">Qty</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orderDetail.items?.map((item: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                  {item.imageUrl && (
                                    <Avatar
                                      src={item.imageUrl}
                                      variant="rounded"
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        border: `1px solid ${currentTheme.border}`,
                                      }}
                                    />
                                  )}
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {item.productName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {item.variantName}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </TableCell>
                              <TableCell align="center">{item.quantity}</TableCell>
                              <TableCell align="right">₹{item.totalPrice.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}
                <Grid size={12}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mb: 2 }}>
                    {(orderDetail.orderStatus ?? '').toLowerCase() === 'assigned' &&
                      orderDetail.deliveryPersonName && (
                        <Button
                          variant="outlined"
                          startIcon={
                            isGeneratingOtp ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <OtpIcon />
                            )
                          }
                          onClick={() => handleGenerateOtp(orderDetail.id)}
                          disabled={isGeneratingOtp}
                        >
                          {isGeneratingOtp ? 'Generating…' : 'Generate Delivery OTP'}
                        </Button>
                      )}
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      pt: 1,
                      borderTop: `1px solid ${currentTheme.border}`,
                    }}
                  >
                    <Typography variant="h6" fontWeight={800}>
                      Grand Total: ₹{orderDetail.grandTotal?.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={refundDialogOpen} onClose={() => setRefundDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Process Cashfree Refund</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Leave amount empty for full Cashfree paid amount. Enter amount only for partial refund.
            </Alert>
            <TextField
              fullWidth
              label="Refund Amount"
              placeholder="Optional, e.g. 100"
              value={refundAmount}
              type="number"
              onChange={(e) => setRefundAmount(e.target.value)}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleRefundOrder}
            disabled={isRefunding}
          >
            {isRefunding ? 'Processing...' : 'Refund'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Order</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectOrder}
            disabled={!rejectReason.trim() || isRejecting}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign / Broadcast Dialog */}
      <Dialog open={assignDialogOpen} onClose={closeAssignDialog} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Assign Delivery Partner
          <IconButton onClick={closeAssignDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Mode selector */}
          <Stack spacing={2}>
            <ToggleButtonGroup
              value={assignMode}
              exclusive
              onChange={(_, v) => {
                if (v) setAssignMode(v);
              }}
              fullWidth
              size="small"
              sx={{ mb: 1 }}
            >
              <ToggleButton value="broadcast" sx={{ gap: 1 }}>
                <BroadcastIcon fontSize="small" /> Broadcast (First-Come-First-Serve)
              </ToggleButton>
              <ToggleButton value="manual" sx={{ gap: 1 }}>
                <PersonIcon fontSize="small" /> Manual Select
              </ToggleButton>
            </ToggleButtonGroup>

            {assignMode === 'broadcast' ? (
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Broadcast to all online riders of the chosen vehicle type. First rider to accept
                  gets the order.
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  Select Vehicle Category:
                </Typography>
                <Stack spacing={1}>
                  {VEHICLE_OPTIONS.map((opt) => (
                    <Paper
                      key={opt.value}
                      variant="outlined"
                      onClick={() => setSelectedVehicleType(opt.value)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        borderColor: selectedVehicleType === opt.value ? 'primary.main' : 'divider',
                        bgcolor:
                          selectedVehicleType === opt.value ? 'primary.main' + '15' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        transition: 'all 0.15s',
                      }}
                    >
                      <Typography fontSize={26}>{opt.emoji}</Typography>
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={700}>
                          {opt.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {opt.subtitle}
                        </Typography>
                      </Box>
                      {selectedVehicleType === opt.value && (
                        <Chip label="Selected" size="small" color="primary" sx={{ ml: 'auto' }} />
                      )}
                    </Paper>
                  ))}
                </Stack>
                {broadcastResult && (
                  <Alert severity="success" icon={<BroadcastIcon />}>
                    Broadcast sent! Expires at {dayjs(broadcastResult.expiresAt).format('hh:mm A')}.
                    Waiting for a rider to accept...
                  </Alert>
                )}
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Manually assign to a specific available rider.
                </Typography>
                {isLoadingPersonnel ? (
                  <CircularProgress size={28} />
                ) : availablePersonnel?.availableDeliveryPersons?.length ? (
                  availablePersonnel.availableDeliveryPersons.map((p) => (
                    <ListItemButton
                      key={p.id}
                      selected={selectedDeliveryPerson === p.id}
                      onClick={() => setSelectedDeliveryPerson(p.id)}
                      sx={{ borderRadius: 3 }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: currentTheme.accent }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${p.firstName} ${p.lastName} — ${p.vehicleType}`}
                        secondary={p.phoneNumber}
                      />
                    </ListItemButton>
                  ))
                ) : (
                  <Alert severity="warning">No riders are currently online.</Alert>
                )}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAssignDialog}>Cancel</Button>
          {assignMode === 'broadcast' ? (
            <Button
              variant="contained"
              startIcon={
                isBroadcasting ? <CircularProgress size={16} color="inherit" /> : <BroadcastIcon />
              }
              disabled={isBroadcasting}
              onClick={handleBroadcastOrder}
              color="secondary"
            >
              {isBroadcasting ? 'Broadcasting…' : `Broadcast to ${selectedVehicleType} Riders`}
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={!selectedDeliveryPerson || isAssigning}
              onClick={handleConfirmAssignDelivery}
              startIcon={
                isAssigning ? <CircularProgress size={16} color="inherit" /> : <LocalShippingIcon />
              }
            >
              {isAssigning ? 'Assigning…' : 'Assign'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrderDashboard;
