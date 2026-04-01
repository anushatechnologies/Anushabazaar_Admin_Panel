import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useGetOrderByIdQuery } from '../api/orderApi';
import dayjs from 'dayjs';

const CustomerOrderDetail: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { data: order, isLoading, isError } = useGetOrderByIdQuery(Number(orderId));

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'warning';
            case 'confirmed': return 'info';
            case 'processing': return 'info';
            case 'shipped': return 'primary';
            case 'delivered': return 'success';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'success';
            case 'unpaid': return 'warning';
            case 'refunded': return 'error';
            default: return 'default';
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (isError || !order) {
        return (
            <Box p={3}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/my-orders')}
                    sx={{ mb: 2 }}
                >
                    Back to Orders
                </Button>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="error">Order not found.</Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/my-orders')}
                sx={{ mb: 3 }}
            >
                Back to Orders
            </Button>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            Order #{order.orderNumber}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Placed on {dayjs(order.placedAt).format('DD MMM YYYY, hh:mm A')}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box display="flex" gap={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                            <Chip 
                                label={order.orderStatus?.toUpperCase() || ''} 
                                color={getStatusColor(order.orderStatus || '') as any}
                                size="medium"
                            />
                            <Chip 
                                label={order.paymentStatus?.toUpperCase() || ''} 
                                color={getPaymentStatusColor(order.paymentStatus || '') as any}
                                size="medium"
                            />
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                    Order Items
                </Typography>

                {order.items?.map((item, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {item.productName}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {item.variantName}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        SKU: {item.sku}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Box textAlign={{ xs: 'left', md: 'right' }}>
                                        <Typography variant="body2">
                                            Quantity: {item.quantity}
                                        </Typography>
                                        <Typography variant="body2">
                                            Unit Price: ₹{item.unitPrice.toFixed(2)}
                                        </Typography>
                                        <Typography variant="h6" fontWeight="bold">
                                            ₹{item.totalPrice.toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                ))}

                <Divider sx={{ my: 3 }} />

                <Box display="flex" justifyContent="flex-end">
                    <Typography variant="h5" fontWeight="bold">
                        Total: ₹{order.grandTotal.toFixed(2)}
                    </Typography>
                </Box>
            </Paper>

            <Box display="flex" gap={2}>
                <Button variant="outlined" onClick={() => window.print()}>
                    Print Order
                </Button>
                <Button variant="contained" onClick={() => navigate('/products')}>
                    Continue Shopping
                </Button>
            </Box>
        </Box>
    );
};

export default CustomerOrderDetail;
