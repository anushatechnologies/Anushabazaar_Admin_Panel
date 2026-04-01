import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Chip,
  Grid,
  CircularProgress,
  Divider,
  Stack,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  Alert
} from '@mui/material';
import { 
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Restaurant as RestaurantIcon,
  Home as HomeIcon,
  ArrowBack as ArrowIcon,
  LocalShipping as DeliveryIcon,
  Assignment as OrderIcon,
} from '@mui/icons-material';
import { useGetOrderByIdQuery } from '../api/orderApi';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    GlassCard, 
    GlassBadge, 
    GradientText, 
    GlassPageHeader 
} from '../../../components/glassmorphism/GlassComponents';
import { useAppTheme } from '@contexts/ThemeContext';
import { styled } from '@mui/material/styles';

const ColorlibConnector = styled(StepConnector)(({ theme, color }: any) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient( 95deg,${color}80 0%, ${color} 50%, ${color}80 100%)`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient( 95deg,${color}80 0%, ${color} 50%, ${color}80 100%)`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf040',
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')<{
  active?: boolean;
  completed?: boolean;
  color?: string;
}>(({ theme, active, completed, color }) => ({
  backgroundColor: '#eaeaf040',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(active && {
    backgroundImage: `linear-gradient( 136deg, ${color}cc 0%, ${color} 50%, ${color}cc 100%)`,
    boxShadow: `0 4px 10px 0 ${color}40`,
  }),
  ...(completed && {
    backgroundImage: `linear-gradient( 136deg, ${color}cc 0%, ${color} 50%, ${color}cc 100%)`,
  }),
}));

const CustomerOrderTracking: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { currentTheme } = useAppTheme();
    const { data: order, isLoading, isError, refetch } = useGetOrderByIdQuery(Number(orderId), {
        pollingInterval: 15000, // Poll every 15s to see real-time delivery progress
    });

    const [orderSteps, setOrderSteps] = useState<any[]>([]);

    useEffect(() => {
        if (order) {
            const statusStr = (order.orderStatus || '').toUpperCase();
            const steps = [
                {
                    label: 'Order Placed',
                    status: 'PENDING',
                    completed: ['PENDING', 'ACCEPTED', 'CONFIRMED', 'PROCESSING', 'READY', 'ASSIGNED', 'OUT FOR DELIVERY', 'DELIVERED'].includes(statusStr),
                    icon: <PendingIcon />,
                    time: order.placedAt
                },
                {
                    label: 'Confirmed',
                    status: 'CONFIRMED',
                    completed: ['ACCEPTED', 'CONFIRMED', 'PROCESSING', 'READY', 'ASSIGNED', 'OUT FOR DELIVERY', 'DELIVERED'].includes(statusStr),
                    icon: <CheckCircleIcon />,
                },
                {
                    label: 'Preparing',
                    status: 'PROCESSING',
                    completed: ['PROCESSING', 'READY', 'ASSIGNED', 'OUT FOR DELIVERY', 'DELIVERED'].includes(statusStr),
                    icon: <RestaurantIcon />,
                },
                {
                    label: 'Out for Delivery',
                    status: 'OUT FOR DELIVERY',
                    completed: ['OUT FOR DELIVERY', 'DELIVERED', 'ASSIGNED', 'PICKED_UP'].includes(statusStr) && statusStr !== 'READY' && statusStr !== 'PROCESSING',
                    icon: <LocalShippingIcon />,
                },
                {
                    label: 'Delivered',
                    status: 'DELIVERED',
                    completed: statusStr === 'DELIVERED',
                    icon: <HomeIcon />,
                }
            ];
            setOrderSteps(steps);
        }
    }, [order]);

    const activeStep = orderSteps.findIndex((s, i) => !s.completed);
    const displayStep = activeStep === -1 ? orderSteps.length : activeStep;

    if (isLoading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress sx={{ color: currentTheme.accent }} /></Box>;

    if (isError || !order) return (
        <Box p={4} textAlign="center">
            <Typography variant="h5" color="error">Order Tracking Lost</Typography>
            <Button onClick={() => navigate('/my-orders')} variant="contained" sx={{ mt: 2 }}>Back to Orders</Button>
        </Box>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, background: currentTheme.bg, minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Button 
                    startIcon={<ArrowIcon />} 
                    onClick={() => navigate('/my-orders')} 
                    sx={{ mb: 3, fontWeight: 700, opacity: 0.8, color: 'text.primary' }}
                >
                    Back to History
                </Button>
                <GlassPageHeader>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" fontWeight={900}><GradientText>Track Life Cycle</GradientText></Typography>
                            <Typography color="text.secondary">Order #{order.orderNumber}</Typography>
                        </Box>
                        <Stack direction="row" spacing={2} sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}>
                            <GlassBadge statusColor={currentTheme.accent}>
                                ETA: {order.estimatedDeliveryTime ? dayjs(order.estimatedDeliveryTime).format('hh:mm A') : '--:--'}
                            </GlassBadge>
                        </Stack>
                    </Box>
                </GlassPageHeader>
            </motion.div>

            <Grid container spacing={4}>
                {/* Visual Tracker */}
                <Grid size={12}>
                    <GlassCard sx={{ p: { xs: 2, md: 6 }, border: `1px solid ${currentTheme.border}40`, backdropFilter: 'blur(30px)' }}>
                        <Stepper 
                            alternativeLabel 
                            activeStep={displayStep} 
                            connector={<ColorlibConnector color={currentTheme.accent} />}
                        >
                            {orderSteps.map((step, index) => (
                                <Step key={step.label}>
                                    <StepLabel
                                        StepIconComponent={(props) => (
                                            <ColorlibStepIconRoot 
                                                active={props.active} 
                                                completed={props.completed} 
                                                color={currentTheme.accent}
                                            >
                                                {step.icon}
                                            </ColorlibStepIconRoot>
                                        )}
                                    >
                                        <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 1, opacity: displayStep >= index ? 1 : 0.4 }}>
                                            {step.label}
                                        </Typography>
                                        {step.time && (
                                            <Typography variant="caption" sx={{ display: 'block', opacity: 0.6 }}>
                                                {dayjs(step.time).format('hh:mm A')}
                                            </Typography>
                                        )}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </GlassCard>
                </Grid>

                {/* Details Side-by-Side */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <GlassCard sx={{ p: 0, overflow: 'hidden' }}>
                            <Box sx={{ p: 3, bgcolor: `${currentTheme.accent}10` }}>
                                <Typography variant="h6" fontWeight={800}>Order Contents</Typography>
                            </Box>
                            <Divider sx={{ opacity: 0.2 }} />
                            <Box sx={{ p: 3 }}>
                                {order.items?.map((item, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ bgcolor: `${currentTheme.accent}15`, color: currentTheme.accent }}>
                                                <OrderIcon />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body1" fontWeight={700}>{item.productName}</Typography>
                                                <Typography variant="caption" color="text.secondary">{item.variantName}</Typography>
                                            </Box>
                                        </Stack>
                                        <Box textAlign="right">
                                            <Typography variant="body2" fontWeight={800}>₹{item.totalPrice.toFixed(2)}</Typography>
                                            <GlassBadge sx={{ fontSize: '10px' }} statusColor="gray">{item.quantity} UNITS</GlassBadge>
                                        </Box>
                                    </Box>
                                ))}
                                <Divider sx={{ my: 3, borderStyle: 'dashed' }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h5" fontWeight={900}>Grand Total</Typography>
                                    <Typography variant="h4" fontWeight={900} color={currentTheme.accent}>₹{order.grandTotal.toFixed(2)}</Typography>
                                </Box>
                            </Box>
                        </GlassCard>
                    </motion.div>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <Stack spacing={3}>
                            <GlassCard sx={{ p: 3, border: `1px solid ${currentTheme.border}` }}>
                                <Typography variant="subtitle2" color="text.secondary" fontWeight={800} sx={{ mb: 2 }}>DELIVERY PARTNER</Typography>
                                {order.deliveryPersonId ? (
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ width: 60, height: 60, bgcolor: currentTheme.accent }}><DeliveryIcon sx={{ fontSize: 30 }} /></Avatar>
                                        <Box>
                                            <Typography variant="h6" fontWeight={800}>Rider Assigned</Typography>
                                            <Typography variant="body2" color="text.secondary">On the way to pick up location</Typography>
                                        </Box>
                                    </Stack>
                                ) : (
                                    <Alert severity="info" variant="outlined" sx={{ borderRadius: 3 }}>
                                        Awaiting assignment...
                                    </Alert>
                                )}
                            </GlassCard>

                            <GlassCard sx={{ p: 3, border: `1px solid ${currentTheme.border}`, bgcolor: `${currentTheme.cardBg}50` }}>
                                <Typography variant="subtitle2" color="text.secondary" fontWeight={800} sx={{ mb: 2 }}>ACTIONS</Typography>
                                <Stack spacing={2}>
                                    <Button variant="contained" fullWidth size="large" onClick={() => window.print()} sx={{ borderRadius: 4, fontWeight: 900 }}>
                                        Receipt PDF
                                    </Button>
                                    <Button variant="outlined" fullWidth size="large" onClick={() => navigate('/products')} sx={{ borderRadius: 4, fontWeight: 900 }}>
                                        New Orders
                                    </Button>
                                </Stack>
                            </GlassCard>
                        </Stack>
                    </motion.div>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CustomerOrderTracking;
