import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@app/store';
import {
  Box,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
  Stack,
  Avatar,
  Grid,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetAdminOrderByIdQuery,
  useGetOrderByIdQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
} from '../api/orderApi';
import toast from 'react-hot-toast';
import {
  ArrowBack as ArrowBackIcon,
  ContactPhone as PhoneIcon,
  LocationOn as LocationIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  AccountBalanceWallet as WalletIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  GlassCard,
  GlassBadge,
  GradientText,
  GlassPageHeader,
} from '../../../components/glassmorphism/GlassComponents';
import { useAppTheme } from '@contexts/ThemeContext';
import { AdminOrderDetailDto, CustomerAddressDto, OrderResponse, StoreGroupDto } from '../types';

const pickAddress = (
  order: AdminOrderDetailDto | OrderResponse | undefined,
): Partial<CustomerAddressDto> | null => {
  if (!order) return null;

  const candidates = [
    (order as AdminOrderDetailDto).address,
    (order as any).deliveryAddress,
    (order as any).customer?.address,
    (order as any).address,
  ].filter(Boolean);

  return (candidates[0] as Partial<CustomerAddressDto>) || null;
};

const formatAddress = (address: Partial<CustomerAddressDto> | null): string => {
  if (!address) return '';

  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    address.city,
    address.state,
    address.postalCode,
  ].filter((value): value is string => Boolean(value && String(value).trim()));

  return parts.join(', ');
};

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { currentTheme } = useAppTheme();
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const isAdmin =
    userRole === 'ADMIN' || userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN';

  // API Hooks
  const {
    data: adminOrder,
    isLoading: isAdminLoading,
    isError: isAdminError,
    refetch: refetchAdmin,
  } = useGetAdminOrderByIdQuery(Number(orderId), { skip: !isAdmin });
  const {
    data: customerOrder,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
    refetch: refetchCustomer,
  } = useGetOrderByIdQuery(Number(orderId), { skip: isAdmin });

  const order = isAdmin ? adminOrder : customerOrder;
  const deliveryAddress = formatAddress(pickAddress(order));
  const storeGroups = isAdmin
    ? ((adminOrder as AdminOrderDetailDto | undefined)?.storeGroups ?? [])
    : [];
  const isLoading = isAdmin ? isAdminLoading : isCustomerLoading;
  const isError = isAdmin ? isAdminError : isCustomerError;
  const refetch = isAdmin ? refetchAdmin : refetchCustomer;

  const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();
  const [rejectOrder, { isLoading: isRejecting }] = useRejectOrderMutation();

  // Local State for Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleAccept = async () => {
    try {
      await acceptOrder(Number(orderId)).unwrap();
      toast.success('Order accepted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to accept order');
    }
  };

  const handleRejectOpen = () => {
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectClose = () => {
    setRejectModalOpen(false);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await rejectOrder({
        orderId: Number(orderId),
        reason: rejectReason,
      }).unwrap();

      toast.success('Order rejected successfully');
      setRejectModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to reject order');
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (['delivered', 'completed', 'success'].includes(s)) return '#10b981';
    if (['pending', 'placed', 'processing', 'confirmed'].includes(s)) return '#f59e0b';
    if (['out for delivery', 'ready'].includes(s)) return '#3b82f6';
    if (['cancelled', 'rejected'].includes(s)) return '#ef4444';
    return '#6b7280';
  };

  if (isLoading)
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress sx={{ color: currentTheme.accent }} />
      </Box>
    );

  if (isError || !order)
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h5" color="error">
          Order Details Not Found
        </Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: currentTheme.bg,
        minHeight: '100vh',
        color: 'text.primary',
      }}
    >
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, fontWeight: 700, color: 'text.secondary' }}
        >
          Back to History
        </Button>
        <GlassPageHeader>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.02em' }}>
                <GradientText>Invoice Details</GradientText>
              </Typography>
              <Typography variant="subtitle1" fontWeight={700} sx={{ opacity: 0.8 }}>
                Order #{order.orderNumber}
              </Typography>
            </Box>
            <GlassBadge statusColor={getStatusColor(order.orderStatus)}>
              {order.orderStatus}
            </GlassBadge>
          </Box>
        </GlassPageHeader>
      </motion.div>

      {/* Admin Controls */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard
            sx={{
              p: 2,
              mb: 4,
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              border: `1px solid ${currentTheme.accent}20`,
            }}
          >
            {['pending', 'placed'].includes(order.orderStatus?.toLowerCase() || '') && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={handleAccept}
                  sx={{ borderRadius: 3, fontWeight: 900 }}
                  disabled={isAccepting}
                >
                  Accept Request
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleRejectOpen}
                  sx={{ borderRadius: 3, fontWeight: 900 }}
                  disabled={isRejecting}
                >
                  Reject
                </Button>
              </>
            )}
          </GlassCard>
        </motion.div>
      )}

      <Grid container spacing={4}>
        {/* Left Col: Customer & Address */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <GlassCard sx={{ p: 3, border: `1px solid ${currentTheme.border}` }}>
              <Typography variant="overline" sx={{ fontWeight: 900, opacity: 0.6 }}>
                Customer Contact
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center">
                <Avatar sx={{ bgcolor: currentTheme.accent, width: 50, height: 50 }}>
                  <PhoneIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    {isAdmin ? (adminOrder as any).customerName : 'Me'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    {isAdmin ? (adminOrder as any).customerPhone : 'Confirmed Partner'}
                  </Typography>
                </Box>
              </Stack>
            </GlassCard>

            <GlassCard
              sx={{
                p: 3,
                border: `1px solid ${currentTheme.border}`,
                bgcolor: `${currentTheme.cardBg}50`,
              }}
            >
              <Typography variant="overline" sx={{ fontWeight: 900, opacity: 0.6 }}>
                Destination info
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <LocationIcon sx={{ color: currentTheme.accent, mt: 0.5 }} />
                <Box>
                  <Typography variant="body1" fontWeight={700}>
                    Delivery Location
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                    {deliveryAddress || 'Address not available'}
                  </Typography>
                </Box>
              </Box>
            </GlassCard>

            <GlassCard sx={{ p: 3, border: `1px solid ${currentTheme.border}40` }}>
              <Typography variant="overline" sx={{ fontWeight: 900, opacity: 0.6 }}>
                Financial Summary
              </Typography>
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Subtotal
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    ₹{Number(order.subtotal || 0).toFixed(2)}
                  </Typography>
                </Box>
                {Number(order.deliveryCharge) > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Delivery
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      ₹{Number(order.deliveryCharge).toFixed(2)}
                    </Typography>
                  </Box>
                )}
                {Number(order.discount) > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Discount
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="#10b981">
                      −₹{Number(order.discount).toFixed(2)}
                    </Typography>
                  </Box>
                )}
                {Number(order.walletApplied) > 0 && (
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <WalletIcon sx={{ fontSize: 14, color: '#6366f1' }} />
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        Wallet Paid
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={800} color="#6366f1">
                      ₹{Number(order.walletApplied).toFixed(2)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ opacity: 0.2, my: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight={800}>
                    Grand Total
                  </Typography>
                  <Typography variant="body2" fontWeight={900} color={currentTheme.accent}>
                    ₹{Number(order.grandTotal).toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Method
                  </Typography>
                  <Typography variant="body2" fontWeight={800}>
                    {order.paymentMethod}
                  </Typography>
                </Box>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Status
                  </Typography>
                  <GlassBadge
                    sx={{ fontSize: '10px' }}
                    statusColor={order.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b'}
                  >
                    {order.paymentStatus}
                  </GlassBadge>
                </Box>
                {order.orderStatus?.toLowerCase() === 'cancelled' &&
                  order.paymentMethod?.toUpperCase() === 'WALLET' && (
                    <Box
                      sx={{
                        mt: 1,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#6366f110',
                        border: '1px solid #6366f130',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <WalletIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                      <Typography variant="caption" fontWeight={700} color="#6366f1">
                        ₹{Number(order.grandTotal).toFixed(2)} refunded to customer wallet
                      </Typography>
                    </Box>
                  )}
              </Stack>
            </GlassCard>
          </Stack>
        </Grid>

        {/* Right Col: Items */}
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 0, overflow: 'hidden' }}>
            <Box
              sx={{
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: `${currentTheme.border}20`,
              }}
            >
              <Typography variant="h6" fontWeight={800}>
                Inventory Items
              </Typography>
              <Typography variant="subtitle2" sx={{ opacity: 0.6 }}>
                {order.items?.length || 0} Products
              </Typography>
            </Box>
            <Divider sx={{ opacity: 0.2 }} />
            <Box sx={{ p: 3 }}>
              {order.items?.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        bgcolor: `${currentTheme.accent}15`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: currentTheme.accent,
                      }}
                    >
                      <InventoryIcon />
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight={800}>
                        {item.productName}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>
                        {item.variantName} | {item.sku}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box textAlign="right">
                    <Typography variant="h6" fontWeight={900}>
                      ₹{item.totalPrice.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.5 }}>
                      ₹{item.unitPrice.toFixed(2)} x {item.quantity}
                    </Typography>
                  </Box>
                </Box>
              ))}

              {storeGroups.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="overline" sx={{ fontWeight: 900, opacity: 0.6 }}>
                    Store Dispatch Groups
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {storeGroups.map((group: StoreGroupDto) => (
                      <GlassCard
                        key={group.storeId}
                        sx={{
                          p: 2,
                          border: `1px solid ${currentTheme.border}40`,
                          background: `${currentTheme.cardBg}60`,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: 2,
                            mb: 1.5,
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle1" fontWeight={800}>
                              {group.storeName}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.65 }}>
                              {group.storePhone || 'Phone not available'}
                            </Typography>
                          </Box>
                          <GlassBadge statusColor={currentTheme.accent}>
                            ₹{Number(group.subtotal || 0).toFixed(2)}
                          </GlassBadge>
                        </Box>
                        <Stack spacing={1}>
                          {group.items?.map((groupItem, groupIndex) => (
                            <Box
                              key={`${group.storeId}-${groupIndex}`}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 2,
                              }}
                            >
                              <Typography variant="body2" fontWeight={700}>
                                {groupItem.productName} ({groupItem.variantName})
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                {groupItem.quantity} x ₹
                                {Number(groupItem.unitPrice || 0).toFixed(2)}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </GlassCard>
                    ))}
                  </Stack>
                </Box>
              )}

              <Box
                sx={{
                  mt: 4,
                  pt: 4,
                  borderTop: `2px dashed ${currentTheme.border}60`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={500} sx={{ opacity: 0.7 }}>
                    Order Grand Total
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Inclusive of all taxes and delivery fees
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={900} color={currentTheme.accent}>
                  ₹{order.grandTotal.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Reject Modal */}
      <Dialog
        open={rejectModalOpen}
        onClose={handleRejectClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            background: currentTheme.cardBg,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${currentTheme.border}`,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Reject Confirmation</DialogTitle>
        <DialogContent>
          {order.paymentMethod?.toUpperCase() === 'WALLET' && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: '#f59e0b10',
                border: '1px solid #f59e0b40',
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
              }}
            >
              <WarningIcon sx={{ color: '#f59e0b', mt: 0.2, fontSize: 20 }} />
              <Box>
                <Typography variant="body2" fontWeight={800} color="#b45309">
                  Wallet-paid order — refund will be issued automatically
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  Confirming rejection will immediately credit{' '}
                  <strong>₹{Number(order.grandTotal).toFixed(2)}</strong> back to the customer's
                  wallet. This cannot be undone.
                </Typography>
              </Box>
            </Box>
          )}
          <DialogContentText mb={2} sx={{ opacity: 0.8 }}>
            Please specify the reason for the rejection. The customer will see this message.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="soft"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ input: { color: 'text.primary' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleRejectClose} sx={{ color: 'text.secondary' }}>
            Dismiss
          </Button>
          <Button
            onClick={handleRejectConfirm}
            color="error"
            variant="contained"
            disabled={isRejecting || !rejectReason.trim()}
            sx={{ borderRadius: 3, fontWeight: 900, px: 4 }}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetail;
