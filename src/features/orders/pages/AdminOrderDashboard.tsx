import React, { useEffect, useMemo, useRef, useState } from 'react';
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
} from '@mui/material';
import {
  LocalShipping as LocalShippingIcon,
  RemoveRedEye as ViewIcon,
  Person as PersonIcon,
  Assignment as OrderIcon,
  Schedule as TimeIcon,
  VpnKey as OtpIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  useGetAdminOrdersQuery,
  useGetAdminOrderByIdQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useAssignDeliveryMutation,
  useGenerateDeliveryOtpMutation,
} from '../api/orderApi';
import { useGetAvailableDeliveryPersonsQuery } from '../../delivery/api/deliveryApi';
import { AdminOrderSummaryDto, CustomerAddressDto } from '../types/index';
import dayjs from 'dayjs';
import { toast } from '@components/toast/ToastContainer';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

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

  const [acceptOrder] = useAcceptOrderMutation();
  const [rejectOrder, { isLoading: isRejecting }] = useRejectOrderMutation();
  const [assignDelivery, { isLoading: isAssigning }] = useAssignDeliveryMutation();
  const [generateOtp] = useGenerateDeliveryOtpMutation();

  const { data: availablePersonnel, isLoading: isLoadingPersonnel } =
    useGetAvailableDeliveryPersonsQuery();
  const knownOrderIdsRef = useRef<Set<number>>(new Set());
  const hasInitializedRealtimeRef = useRef(false);

  const ordersList = useMemo(() => {
    const raw: any = orders;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.orders)) return raw.orders;
    return [];
  }, [orders]);

  useEffect(() => {
    if (typeof orders === 'undefined') {
      return;
    }

    const currentIds = new Set(ordersList.map((order) => order.id));

    if (!hasInitializedRealtimeRef.current) {
      knownOrderIdsRef.current = currentIds;
      hasInitializedRealtimeRef.current = true;
      return;
    }

    const newOrders = ordersList
      .filter((order) => !knownOrderIdsRef.current.has(order.id))
      .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());

    if (newOrders.length > 0) {
      const latestOrder = newOrders[0];
      const countLabel =
        newOrders.length === 1
          ? `New order received: ${latestOrder.orderNumber}`
          : `${newOrders.length} new orders received`;

      toast.custom({
        type: 'success',
        message: countLabel,
        duration: 7000,
        action: {
          label: 'Open order',
          onClick: () => navigate(`/admin/orders/${latestOrder.id}`),
        },
      });
    }

    knownOrderIdsRef.current = currentIds;
  }, [navigate, orders, ordersList]);

  const filteredOrders = useMemo(() => {
    const toSt = (st?: string) => (st ?? '').toLowerCase();

    if (activeTab === 0) return ordersList;
    if (activeTab === 1)
      return ordersList.filter((o: AdminOrderSummaryDto) => toSt(o.orderStatus) === 'placed');
    if (activeTab === 2)
      return ordersList.filter((o: AdminOrderSummaryDto) => toSt(o.orderStatus) === 'confirmed');
    if (activeTab === 3)
      return ordersList.filter((o: AdminOrderSummaryDto) => toSt(o.orderStatus) === 'assigned');
    return ordersList;
  }, [ordersList, activeTab]);

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'placed') return '#f59e0b';
    if (s === 'confirmed') return '#10b981';
    if (s === 'assigned') return '#3b82f6';
    if (s === 'delivered') return '#059669';
    if (s === 'cancelled') return '#ef4444';
    return '#6b7280';
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      await acceptOrder({ orderId }).unwrap();
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

  const handleConfirmAssignDelivery = async () => {
    if (selectedOrderId && selectedDeliveryPerson) {
      try {
        await assignDelivery({
          orderId: selectedOrderId,
          deliveryPersonId: selectedDeliveryPerson,
          estimatedDeliveryTime: dayjs().add(1, 'hour').toISOString(),
        }).unwrap();
        toast.success('Order assigned successfully!');
        setAssignDialogOpen(false);
        setSelectedDeliveryPerson(null);
        refetch();
      } catch (error) {
        toast.error('Failed to assign delivery');
      }
    }
  };

  const handleGenerateOtp = async (orderId: number) => {
    try {
      const res = await generateOtp(orderId).unwrap();
      toast.success(`New Delivery OTP: ${res.deliveryOtp}`, 6000);
    } catch (error: any) {
      toast.error('Failed to generate OTP');
    }
  };

  const formatAddress = (addr?: CustomerAddressDto) => {
    if (!addr) return 'No address provided';
    return `${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.landmark ? addr.landmark + ', ' : ''}${addr.city}, ${addr.state} - ${addr.postalCode}`;
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
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="All Orders" />
          <Tab label="New (Pending)" />
          <Tab label="To Assign" />
          <Tab label="Ongoing" />
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
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => {
                                setSelectedOrderId(order.id);
                                setAssignDialogOpen(true);
                              }}
                              startIcon={<LocalShippingIcon />}
                            >
                              Assign
                            </Button>
                          )}
                          {(order.orderStatus ?? '').toLowerCase() === 'assigned' && (
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleGenerateOtp(order.id)}
                            >
                              <OtpIcon fontSize="small" />
                            </IconButton>
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
                              {item.productName} ({item.variantName})
                            </TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="right">₹{item.totalPrice.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={2} align="right">
                            Grand Total
                          </TableCell>
                          <TableCell align="right">₹{orderDetail.grandTotal?.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            )
          )}
        </DialogContent>
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

      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Assign Delivery Partner</DialogTitle>
        <DialogContent>
          {isLoadingPersonnel ? (
            <CircularProgress />
          ) : availablePersonnel?.availableDeliveryPersons?.length ? (
            <Stack spacing={2}>
              {availablePersonnel.availableDeliveryPersons.map((p) => (
                <ListItemButton
                  key={p.id}
                  selected={selectedDeliveryPerson === p.id}
                  onClick={() => setSelectedDeliveryPerson(p.id)}
                  sx={{ borderRadius: 4 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: currentTheme.accent }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${p.firstName} ${p.lastName}`}
                    secondary={p.phoneNumber}
                  />
                </ListItemButton>
              ))}
            </Stack>
          ) : (
            <Typography color="error">No riders online</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!selectedDeliveryPerson || isAssigning}
            onClick={handleConfirmAssignDelivery}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrderDashboard;
