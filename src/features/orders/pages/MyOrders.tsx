import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Avatar,
  IconButton
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { useGetMyOrdersQuery } from '../api/orderApi';
import { OrderResponse } from '../types/index';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LocalShipping as ShippingIcon, 
    Payment as PaymentIcon, 
    AccessTime as TimeIcon,
    ArrowForward as ArrowIcon,
    Inbox as EmptyIcon 
} from '@mui/icons-material';
import { 
    GlassCard, 
    GlassBadge, 
    GradientText, 
    GlassPageHeader 
} from '../../../components/glassmorphism/GlassComponents';
import { useAppTheme } from '@contexts/ThemeContext';
import EmptyState from '../../../components/empty-state/EmptyState';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};

const MyOrders: React.FC = () => {
    const { currentTheme } = useAppTheme();
    const { data: orders, isLoading, isError, refetch } = useGetMyOrdersQuery(undefined, {
        pollingInterval: 30000, // Poll every 30s to simulate real-time
    });
    const navigate = useNavigate();

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase() || '';
        if (['delivered', 'completed'].includes(s)) return '#10b981';
        if (['pending', 'processing'].includes(s)) return '#f59e0b';
        if (['out for delivery', 'shipped'].includes(s)) return '#3b82f6';
        if (['cancelled', 'rejected'].includes(s)) return '#ef4444';
        return '#6b7280';
    };

    if (isLoading) return (
        <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
            <CircularProgress thickness={5} sx={{ color: currentTheme.accent }} />
        </Box>
    );

    if (isError) return (
        <Box p={4} textAlign="center">
            <Typography variant="h6" color="error">Oops! Failed to load your orders.</Typography>
            <Button onClick={() => refetch()} sx={{ mt: 2 }}>Try Again</Button>
        </Box>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, background: currentTheme.bg, minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <GlassPageHeader>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                                <GradientText>My Orders</GradientText>
                            </Typography>
                            <Typography color="text.secondary" sx={{ opacity: 0.7 }}>
                                Track and manage your recent purchases
                            </Typography>
                        </Box>
                    </Box>
                </GlassPageHeader>
            </motion.div>

            {!orders || orders.length === 0 ? (
                <EmptyState 
                    type="empty" 
                    title="No Orders Found" 
                    description="You haven't placed any orders yet. Start your journey with our fresh products today!"
                    actionText="Browse Products"
                    onAction={() => navigate('/products')}
                />
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Grid container spacing={3}>
                        <AnimatePresence>
                            {orders.map((order: OrderResponse) => (
                                <Grid item xs={12} sm={6} lg={4} key={order.id}>
                                    <motion.div variants={itemVariants} layout transition={{ layout: { type: "spring", stiffness: 100 } }}>
                                        <GlassCard 
                                            whileHover={{ y: -5, boxShadow: `0 10px 30px ${currentTheme.accent}20` }}
                                            sx={{ 
                                                height: '100%', 
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                border: `1px solid ${currentTheme.border}`,
                                                overflow: 'hidden',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => navigate(`/orders/${order.id}/tracking`)}
                                        >
                                            {/* Header */}
                                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: `${currentTheme.cardBg}80` }}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                                        Order ID
                                                    </Typography>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 0.5 }}>
                                                        {order.orderNumber}
                                                    </Typography>
                                                </Box>
                                                <GlassBadge statusColor={getStatusColor(order.orderStatus)}>
                                                    {order.orderStatus}
                                                </GlassBadge>
                                            </Box>
                                            
                                            <Divider sx={{ opacity: 0.2 }} />

                                            {/* Content */}
                                            <Box sx={{ p: 2, flexGrow: 1 }}>
                                                <Stack spacing={2}>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: `${currentTheme.accent}15`, color: currentTheme.accent }}>
                                                            <TimeIcon sx={{ fontSize: 18 }} />
                                                        </Avatar>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            Placed: {dayjs(order.placedAt).format('DD MMM YYYY')}
                                                        </Typography>
                                                    </Stack>

                                                    <Box sx={{ p: 1.5, borderRadius: 3, border: `1px dashed ${currentTheme.border}`, bgcolor: `${currentTheme.bg}40` }}>
                                                        <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 700, color: 'text.secondary' }}>
                                                            ITEMS ({order.items?.length || 0})
                                                        </Typography>
                                                        {order.items?.slice(0, 2).map((item, idx) => (
                                                            <Box key={idx} sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                                                                <Typography variant="body2" noWrap sx={{ maxWidth: '70%', opacity: 0.9 }}>
                                                                    {item.productName}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                                    x{item.quantity}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                        {order.items && order.items.length > 2 && (
                                                            <Typography variant="caption" sx={{ color: currentTheme.accent, fontWeight: 700, mt: 0.5, display: 'block' }}>
                                                                + {order.items.length - 2} more items
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Stack>
                                            </Box>

                                            <Divider sx={{ opacity: 0.2 }} />

                                            {/* Footer */}
                                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                                                        TOTAL AMOUNT
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 900, color: currentTheme.accent }}>
                                                        ₹{order.grandTotal?.toFixed(2)}
                                                    </Typography>
                                                </Box>
                                                <IconButton 
                                                    sx={{ 
                                                        bgcolor: `${currentTheme.accent}20`, 
                                                        color: currentTheme.accent,
                                                        '&:hover': { bgcolor: currentTheme.accent, color: '#fff' }
                                                    }}
                                                >
                                                    <ArrowIcon />
                                                </IconButton>
                                            </Box>
                                        </GlassCard>
                                    </motion.div>
                                </Grid>
                            ))}
                        </AnimatePresence>
                    </Grid>
                </motion.div>
            )}
        </Box>
    );
};

export default MyOrders;
