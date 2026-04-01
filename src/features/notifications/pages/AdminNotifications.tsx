import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Stack,
  Paper,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  Send,
  Campaign,
  DeliveryDining,
  Person,
  Phone,
  Title,
  Message,
  Save,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  sendNotificationToUser,
  broadcastToCustomers,
  broadcastToDelivery,
  SendNotificationRequest,
  BroadcastNotificationRequest,
} from '../api/notificationsApi';
import { GlassPageHeader, GlassCard } from '../../../components/glassmorphism/GlassComponents';
import { useAppTheme } from '@contexts/ThemeContext';

// Predefined message templates
const notificationTemplates = {
  orderUpdates: [
    {
      title: 'Order Accepted ✅',
      message: 'Your order #{orderId} has been accepted and will be delivered soon.',
    },
    {
      title: 'Your Order is On the Way! 🚴',
      message: 'Your order #{orderId} has been picked up and is being delivered.',
    },
    {
      title: 'Order Delivered 🎉',
      message: 'Your order #{orderId} has been successfully delivered. Thank you!',
    },
  ],
  customerBroadcasts: [
    {
      title: '🎉 Weekend Sale is LIVE!',
      message: 'Get up to 50% off on all fresh vegetables this weekend. Shop now!',
    },
    {
      title: '🆕 New Products Added!',
      message: 'Fresh organic mangoes are now available. Order before they run out!',
    },
    {
      title: '🪔 Diwali Special Offer!',
      message: 'Order dry fruits & sweets and get free delivery on orders above ₹499.',
    },
  ],
  deliveryBroadcasts: [
    {
      title: '💰 Weekly Bonus Incentive!',
      message: 'Complete 20+ orders this week and earn ₹500 bonus. Offer valid till Sunday midnight.',
    },
    {
      title: '⚡ Peak Hours Starting',
      message: 'High order volume expected between 6-9 PM. Please stay online to earn more!',
    },
    {
      title: '📋 New Delivery Policy',
      message: 'Please read the updated delivery partner guidelines in the app settings.',
    },
  ],
};

export default function AdminNotifications() {
  const { currentTheme, isDark } = useAppTheme();

  // Single notification state
  const [singlePhone, setSinglePhone] = useState('');
  const [singleTitle, setSingleTitle] = useState('');
  const [singleMessage, setSingleMessage] = useState('');

  // Broadcast to customers state
  const [customerTitle, setCustomerTitle] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');

  // Broadcast to delivery state
  const [deliveryTitle, setDeliveryTitle] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');

  // Loading states
  const [sendingSingle, setSendingSingle] = useState(false);
  const [sendingCustomers, setSendingCustomers] = useState(false);
  const [sendingDelivery, setSendingDelivery] = useState(false);

  const handleSendToUser = async () => {
    if (!singlePhone.trim() || !singleTitle.trim() || !singleMessage.trim()) {
      toast.error('Please fill all fields for individual notification');
      return;
    }

    setSendingSingle(true);
    try {
      const response = await sendNotificationToUser({
        phoneNumber: singlePhone,
        title: singleTitle,
        message: singleMessage,
      });
      
      toast.success(response.message);
      // Clear form
      setSinglePhone('');
      setSingleTitle('');
      setSingleMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send notification');
    } finally {
      setSendingSingle(false);
    }
  };

  const handleBroadcastToCustomers = async () => {
    if (!customerTitle.trim() || !customerMessage.trim()) {
      toast.error('Please fill title and message for customer broadcast');
      return;
    }

    setSendingCustomers(true);
    try {
      const response = await broadcastToCustomers({
        title: customerTitle,
        message: customerMessage,
      });
      
      toast.success(response.message);
      // Clear form
      setCustomerTitle('');
      setCustomerMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to broadcast to customers');
    } finally {
      setSendingCustomers(false);
    }
  };

  const handleBroadcastToDelivery = async () => {
    if (!deliveryTitle.trim() || !deliveryMessage.trim()) {
      toast.error('Please fill title and message for delivery broadcast');
      return;
    }

    setSendingDelivery(true);
    try {
      const response = await broadcastToDelivery({
        title: deliveryTitle,
        message: deliveryMessage,
      });
      
      toast.success(response.message);
      // Clear form
      setDeliveryTitle('');
      setDeliveryMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to broadcast to delivery partners');
    } finally {
      setSendingDelivery(false);
    }
  };

  const useTemplate = (template: any, type: 'single' | 'customer' | 'delivery') => {
    const title = template.title.replace('{orderId}', 'ORD-001');
    const message = template.message.replace('{orderId}', 'ORD-001');

    switch (type) {
      case 'single':
        setSingleTitle(title);
        setSingleMessage(message);
        break;
      case 'customer':
        setCustomerTitle(title);
        setCustomerMessage(message);
        break;
      case 'delivery':
        setDeliveryTitle(title);
        setDeliveryMessage(message);
        break;
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 }, 
      background: currentTheme.bg, 
      minHeight: '100vh',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassPageHeader
          title="Admin Notifications"
          subtitle="Send notifications to users and manage broadcasts"
          icon={<Send sx={{ fontSize: 40, color: currentTheme.accent }} />}
        />
      </motion.div>

      <Grid container spacing={3}>
        {/* Send to Specific User */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <GlassCard>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <Person sx={{ color: currentTheme.accent }} />
                  <Typography variant="h6" fontWeight={600} sx={{ color: currentTheme.text }}>
                    Send to Specific User
                  </Typography>
                </Stack>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1, color: currentTheme.text }}>
                      Phone Number
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={singlePhone}
                      onChange={(e) => setSinglePhone(e.target.value)}
                      placeholder="+919876543210"
                      InputProps={{
                        startAdornment: <Phone sx={{ color: currentTheme.accent, mr: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: currentTheme.inputBg,
                          color: currentTheme.text,
                          '& fieldset': { borderColor: currentTheme.border },
                          '&:hover fieldset': { borderColor: currentTheme.accent },
                          '&.Mui-focused fieldset': { borderColor: currentTheme.accent },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1, color: currentTheme.text }}>
                      Title
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={singleTitle}
                      onChange={(e) => setSingleTitle(e.target.value)}
                      placeholder="Notification title"
                      InputProps={{
                        startAdornment: <Title sx={{ color: currentTheme.accent, mr: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: currentTheme.inputBg,
                          color: currentTheme.text,
                          '& fieldset': { borderColor: currentTheme.border },
                          '&:hover fieldset': { borderColor: currentTheme.accent },
                          '&.Mui-focused fieldset': { borderColor: currentTheme.accent },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1, color: currentTheme.text }}>
                      Message
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={singleMessage}
                      onChange={(e) => setSingleMessage(e.target.value)}
                      placeholder="Enter notification message"
                      InputProps={{
                        startAdornment: <Message sx={{ color: currentTheme.accent, mr: 1, alignSelf: 'flex-start', mt: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: currentTheme.inputBg,
                          color: currentTheme.text,
                          '& fieldset': { borderColor: currentTheme.border },
                          '&:hover fieldset': { borderColor: currentTheme.accent },
                          '&.Mui-focused fieldset': { borderColor: currentTheme.accent },
                        },
                      }}
                    />
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSendToUser}
                    disabled={sendingSingle}
                    startIcon={<Send />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      background: currentTheme.accentGradient,
                      boxShadow: isDark ? '0 4px 15px rgba(0, 245, 255, 0.4)' : currentTheme.shadow,
                      '&:hover': {
                        boxShadow: isDark ? '0 6px 20px rgba(0, 245, 255, 0.6)' : currentTheme.hoverShadow,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {sendingSingle ? 'Sending...' : 'Send Notification'}
                  </Button>
                </Stack>

                {/* Order Update Templates */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: currentTheme.text }}>
                    Quick Templates:
                  </Typography>
                  <Stack spacing={1}>
                    {notificationTemplates.orderUpdates.map((template, index) => (
                      <Chip
                        key={index}
                        label={template.title}
                        variant="outlined"
                        size="small"
                        onClick={() => useTemplate(template, 'single')}
                        sx={{
                          cursor: 'pointer',
                          borderColor: currentTheme.border,
                          color: currentTheme.text,
                          '&:hover': {
                            borderColor: currentTheme.accent,
                            background: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </CardContent>
            </GlassCard>
          </motion.div>
        </Grid>

        {/* Broadcast to Customers */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <GlassCard>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <Campaign sx={{ color: currentTheme.accent }} />
                  <Typography variant="h6" fontWeight={600} sx={{ color: currentTheme.text }}>
                    Broadcast to All Customers
                  </Typography>
                </Stack>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1, color: currentTheme.text }}>
                      Title
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={customerTitle}
                      onChange={(e) => setCustomerTitle(e.target.value)}
                      placeholder="Broadcast title"
                      InputProps={{
                        startAdornment: <Title sx={{ color: currentTheme.accent, mr: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: currentTheme.inputBg,
                          color: currentTheme.text,
                          '& fieldset': { borderColor: currentTheme.border },
                          '&:hover fieldset': { borderColor: currentTheme.accent },
                          '&.Mui-focused fieldset': { borderColor: currentTheme.accent },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1, color: currentTheme.text }}>
                      Message
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={customerMessage}
                      onChange={(e) => setCustomerMessage(e.target.value)}
                      placeholder="Enter broadcast message"
                      InputProps={{
                        startAdornment: <Message sx={{ color: currentTheme.accent, mr: 1, alignSelf: 'flex-start', mt: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: currentTheme.inputBg,
                          color: currentTheme.text,
                          '& fieldset': { borderColor: currentTheme.border },
                          '&:hover fieldset': { borderColor: currentTheme.accent },
                          '&.Mui-focused fieldset': { borderColor: currentTheme.accent },
                        },
                      }}
                    />
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleBroadcastToCustomers}
                    disabled={sendingCustomers}
                    startIcon={<Campaign />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      background: currentTheme.accentGradient,
                      boxShadow: isDark ? '0 4px 15px rgba(0, 245, 255, 0.4)' : currentTheme.shadow,
                      '&:hover': {
                        boxShadow: isDark ? '0 6px 20px rgba(0, 245, 255, 0.6)' : currentTheme.hoverShadow,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {sendingCustomers ? 'Broadcasting...' : 'Broadcast to Customers'}
                  </Button>
                </Stack>

                {/* Customer Broadcast Templates */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: currentTheme.text }}>
                    Quick Templates:
                  </Typography>
                  <Stack spacing={1}>
                    {notificationTemplates.customerBroadcasts.map((template, index) => (
                      <Chip
                        key={index}
                        label={template.title}
                        variant="outlined"
                        size="small"
                        onClick={() => useTemplate(template, 'customer')}
                        sx={{
                          cursor: 'pointer',
                          borderColor: currentTheme.border,
                          color: currentTheme.text,
                          '&:hover': {
                            borderColor: currentTheme.accent,
                            background: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </CardContent>
            </GlassCard>
          </motion.div>
        </Grid>

        {/* Broadcast to Delivery Partners */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <GlassCard>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <DeliveryDining sx={{ color: currentTheme.accent }} />
                  <Typography variant="h6" fontWeight={600} sx={{ color: currentTheme.text }}>
                    Broadcast to Delivery Partners
                  </Typography>
                </Stack>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1, color: currentTheme.text }}>
                      Title
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={deliveryTitle}
                      onChange={(e) => setDeliveryTitle(e.target.value)}
                      placeholder="Broadcast title"
                      InputProps={{
                        startAdornment: <Title sx={{ color: currentTheme.accent, mr: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: currentTheme.inputBg,
                          color: currentTheme.text,
                          '& fieldset': { borderColor: currentTheme.border },
                          '&:hover fieldset': { borderColor: currentTheme.accent },
                          '&.Mui-focused fieldset': { borderColor: currentTheme.accent },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1, color: currentTheme.text }}>
                      Message
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={deliveryMessage}
                      onChange={(e) => setDeliveryMessage(e.target.value)}
                      placeholder="Enter broadcast message"
                      InputProps={{
                        startAdornment: <Message sx={{ color: currentTheme.accent, mr: 1, alignSelf: 'flex-start', mt: 1 }} />,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: currentTheme.inputBg,
                          color: currentTheme.text,
                          '& fieldset': { borderColor: currentTheme.border },
                          '&:hover fieldset': { borderColor: currentTheme.accent },
                          '&.Mui-focused fieldset': { borderColor: currentTheme.accent },
                        },
                      }}
                    />
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleBroadcastToDelivery}
                    disabled={sendingDelivery}
                    startIcon={<DeliveryDining />}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      background: currentTheme.accentGradient,
                      boxShadow: isDark ? '0 4px 15px rgba(0, 245, 255, 0.4)' : currentTheme.shadow,
                      '&:hover': {
                        boxShadow: isDark ? '0 6px 20px rgba(0, 245, 255, 0.6)' : currentTheme.hoverShadow,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {sendingDelivery ? 'Broadcasting...' : 'Broadcast to Delivery'}
                  </Button>
                </Stack>

                {/* Delivery Broadcast Templates */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: currentTheme.text }}>
                    Quick Templates:
                  </Typography>
                  <Stack spacing={1}>
                    {notificationTemplates.deliveryBroadcasts.map((template, index) => (
                      <Chip
                        key={index}
                        label={template.title}
                        variant="outlined"
                        size="small"
                        onClick={() => useTemplate(template, 'delivery')}
                        sx={{
                          cursor: 'pointer',
                          borderColor: currentTheme.border,
                          color: currentTheme.text,
                          '&:hover': {
                            borderColor: currentTheme.accent,
                            background: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </CardContent>
            </GlassCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <GlassCard sx={{ mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: currentTheme.text }}>
              📋 API Information
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    background: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                    color: currentTheme.text,
                    border: `1px solid ${currentTheme.border}`,
                  }}
                >
                  <Typography variant="body2" sx={{ color: currentTheme.text }}>
                    <strong>Send to User:</strong> POST /api/admin/notifications/send
                    <br />
                    Sends to specific user by phone number
                  </Typography>
                </Alert>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    background: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                    color: currentTheme.text,
                    border: `1px solid ${currentTheme.border}`,
                  }}
                >
                  <Typography variant="body2" sx={{ color: currentTheme.text }}>
                    <strong>Broadcast to Customers:</strong> POST /api/admin/notifications/send-to-customers
                    <br />
                    Sends to all registered customers
                  </Typography>
                </Alert>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    background: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                    color: currentTheme.text,
                    border: `1px solid ${currentTheme.border}`,
                  }}
                >
                  <Typography variant="body2" sx={{ color: currentTheme.text }}>
                    <strong>Broadcast to Delivery:</strong> POST /api/admin/notifications/send-to-delivery
                    <br />
                    Sends to all delivery partners
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </CardContent>
        </GlassCard>
      </motion.div>
    </Box>
  );
}
