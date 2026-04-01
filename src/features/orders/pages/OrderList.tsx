import React from 'react';
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
  Chip,
  CircularProgress,
  Stack,
  Avatar,
  IconButton,
  Button,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGetAdminOrdersQuery } from '../api/orderApi';
import { AdminOrderSummaryDto } from '../types/index';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Visibility as ViewIcon, 
    Assignment as OrderIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon,
    CurrencyRupee as RupeeIcon,
} from '@mui/icons-material';
import { 
    GlassCard, 
    GlassBadge, 
    GradientText, 
    GlassPageHeader 
} from '../../../components/glassmorphism/GlassComponents';
import { useAppTheme } from '@contexts/ThemeContext';
import EmptyState from '../../../components/empty-state/EmptyState';

const OrderList: React.FC = () => {
    const { currentTheme } = useAppTheme();
    const isMobile = useMediaQuery('(max-width:600px)');
    const { data: ordersResponse, isLoading, isError, refetch } = useGetAdminOrdersQuery(undefined, {
        pollingInterval: 10000, // Poll every 10s for admin to see new orders instantly
    });
    const navigate = useNavigate();
    
    // Extract orders array from response - handle different response structures
    let orders: AdminOrderSummaryDto[] = [];
    if (ordersResponse && typeof ordersResponse === 'object') {
        if (Array.isArray(ordersResponse)) {
            orders = ordersResponse;
        } else if ('orders' in ordersResponse && Array.isArray((ordersResponse as any).orders)) {
            orders = (ordersResponse as any).orders;
        } else if ('data' in ordersResponse && Array.isArray((ordersResponse as any).data)) {
            orders = (ordersResponse as any).data;
        }
    }
    
    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase() || '';
        if (s === 'pending') return '#f59e0b';
        if (s === 'accepted' || s === 'confirmed') return '#10b981';
        if (s === 'assigned') return '#3b82f6';
        if (s === 'delivered') return '#059669';
        if (s === 'rejected' || s === 'cancelled') return '#ef4444';
        return '#6b7280';
    };

    if (isLoading) return (
        <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
            <CircularProgress sx={{ color: currentTheme.accent }} />
        </Box>
    );

    if (isError) return (
        <Box p={4} textAlign="center">
            <EmptyState type="error" title="Load Failed" description="Could not fetch order list." />
            <Button onClick={() => refetch()} variant="contained" sx={{ mt: 2 }}>Retry</Button>
        </Box>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, background: currentTheme.bg, minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <GlassPageHeader>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                        <Box>
                            <Typography variant="h4" fontWeight={900}><GradientText>Orders Overview</GradientText></Typography>
                            <Typography color="text.secondary">Real-time order management dashboard</Typography>
                        </Box>
                        <GlassBadge statusColor={currentTheme.accent}>
                            {orders.length} TOTAL ORDERS
                        </GlassBadge>
                    </Box>
                </GlassPageHeader>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <GlassCard sx={{ p: 0, overflow: 'hidden', border: `1px solid ${currentTheme.border}`, backdropFilter: 'blur(20px)' }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="admin orders table">
                            <TableHead sx={{ bgcolor: `${currentTheme.border}30` }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800 }}>ORDER INFO</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>CUSTOMER</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>PRICE</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>STATUS</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }} align="right">ACTIONS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {orders.length > 0 ? (
                                        orders.map((order, idx) => (
                                            <TableRow 
                                                key={order.id} 
                                                component={motion.tr}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                hover 
                                                sx={{ 
                                                    cursor: 'pointer', 
                                                    '&:hover': { bgcolor: `${currentTheme.accent}05` },
                                                    '&.MuiTableRow-hover:hover': { bgcolor: `${currentTheme.accent}08` }
                                                }}
                                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                            >
                                                <TableCell>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar sx={{ bgcolor: `${getStatusColor(order.orderStatus)}20`, color: getStatusColor(order.orderStatus), width: 40, height: 40 }}>
                                                            <OrderIcon sx={{ fontSize: 20 }} />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: '0.05em' }}>
                                                                #{order.orderNumber}
                                                            </Typography>
                                                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ opacity: 0.6 }}>
                                                                <TimeIcon sx={{ fontSize: 14 }} />
                                                                <Typography variant="caption">{dayjs(order.placedAt).format('DD MMM, hh:mm A')}</Typography>
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight={700}>{order.customerName}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{order.customerPhone}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Typography variant="h6" fontWeight={900} color={currentTheme.accent}>
                                                            ₹{order.grandTotal.toFixed(2)}
                                                        </Typography>
                                                    </Box>
                                                    <Chip 
                                                        label={order.paymentStatus} 
                                                        size="small" 
                                                        sx={{ 
                                                            height: 18, 
                                                            fontSize: '10px', 
                                                            fontWeight: 900,
                                                            bgcolor: order.paymentStatus === 'PAID' ? '#10b98120' : '#f59e0b20',
                                                            color: order.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b',
                                                        }} 
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <GlassBadge statusColor={getStatusColor(order.orderStatus)}>
                                                        {order.orderStatus}
                                                    </GlassBadge>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton 
                                                        sx={{ 
                                                            bgcolor: `${currentTheme.border}40`, 
                                                            '&:hover': { bgcolor: currentTheme.accent, color: '#fff' }
                                                        }}
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                                <EmptyState type="empty" title="No Orders" description="Wait for customers to place some orders." />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </GlassCard>
            </motion.div>
        </Box>
    );
};

export default OrderList;
