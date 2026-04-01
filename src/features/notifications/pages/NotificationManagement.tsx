import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  Campaign as BroadcastIcon,
  DeliveryDining as DeliveryIcon,
  PhoneIphone as DeviceIcon,
  Person as PersonIcon,
  Send as SendIcon,
  ShoppingCart as CustomerIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { GlassCard, GlassPageHeader, GradientText } from '@components/glassmorphism/GlassComponents';
import { toast } from '../../../components/toast/ToastContainer';
import { useAppTheme } from '@contexts/ThemeContext';
import {
  useBroadcastToCustomersMutation,
  useBroadcastToDeliveryMutation,
  useSendNotificationByTokenMutation,
  useSendNotificationMutation,
} from '../api/notificationsApi';

type NotificationTab = 'phone' | 'token' | 'customers' | 'delivery';

type NotificationFormState = {
  phoneNumber: string;
  token: string;
  title: string;
  message: string;
};

const INITIAL_FORM: NotificationFormState = {
  phoneNumber: '',
  token: '',
  title: '',
  message: '',
};

export default function NotificationManagement() {
  const { currentTheme, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState<NotificationTab>('phone');
  const [form, setForm] = useState<NotificationFormState>(INITIAL_FORM);

  const [sendNotification, { isLoading: sendingPhone }] = useSendNotificationMutation();
  const [sendByToken, { isLoading: sendingToken }] = useSendNotificationByTokenMutation();
  const [broadcastCustomers, { isLoading: sendingCustomers }] = useBroadcastToCustomersMutation();
  const [broadcastDelivery, { isLoading: sendingDelivery }] = useBroadcastToDeliveryMutation();

  const loading = sendingPhone || sendingToken || sendingCustomers || sendingDelivery;

  const panelMeta = useMemo(() => {
    switch (activeTab) {
      case 'phone':
        return {
          title: 'Send to Specific Phone Number',
          description: 'Find the user by phone number and send to all registered devices.',
          alertColor: 'info' as const,
          alertText: 'Use the full phone number format, for example +919876543210.',
          buttonText: 'Send Notification',
        };
      case 'token':
        return {
          title: 'Send to Raw FCM Token',
          description: 'Send directly to one device using its Firebase token.',
          alertColor: 'warning' as const,
          alertText: 'Use this only when you want to target one exact device.',
          buttonText: 'Send to Device',
        };
      case 'customers':
        return {
          title: 'Broadcast to All Customers',
          description: 'Use this for promotions, campaigns, or customer-wide updates.',
          alertColor: 'success' as const,
          alertText: 'This will send to all customer app users.',
          buttonText: 'Broadcast to Customers',
        };
      default:
        return {
          title: 'Broadcast to All Delivery Partners',
          description: 'Use this for delivery instructions, app updates, or urgent alerts.',
          alertColor: 'warning' as const,
          alertText: 'This will send to all delivery partner devices.',
          buttonText: 'Broadcast to Delivery',
        };
    }
  }, [activeTab]);

  const setField = (field: keyof NotificationFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
  };

  const getErrorMessage = (error: any, fallback: string) => {
    return error?.data?.message || error?.data?.error || fallback;
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    try {
      if (activeTab === 'phone') {
        if (!form.phoneNumber.trim()) {
          toast.error('Phone number is required');
          return;
        }
        await sendNotification({
          phoneNumber: form.phoneNumber.trim(),
          title: form.title.trim(),
          message: form.message.trim(),
        }).unwrap();
        toast.success('Notification sent to phone number successfully');
      } else if (activeTab === 'token') {
        if (!form.token.trim()) {
          toast.error('FCM token is required');
          return;
        }
        await sendByToken({
          token: form.token.trim(),
          title: form.title.trim(),
          message: form.message.trim(),
        }).unwrap();
        toast.success('Notification sent to device token successfully');
      } else if (activeTab === 'customers') {
        await broadcastCustomers({
          title: form.title.trim(),
          message: form.message.trim(),
        }).unwrap();
        toast.success('Notification broadcast sent to all customers');
      } else {
        await broadcastDelivery({
          title: form.title.trim(),
          message: form.message.trim(),
        }).unwrap();
        toast.success('Notification broadcast sent to all delivery partners');
      }

      resetForm();
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to send notification'));
    }
  };

  const renderTargetField = () => {
    if (activeTab === 'phone') {
      return (
        <TextField
          label="Phone Number"
          placeholder="+919876543210"
          value={form.phoneNumber}
          onChange={(event) => setField('phoneNumber', event.target.value)}
          fullWidth
        />
      );
    }

    if (activeTab === 'token') {
      return (
        <TextField
          label="FCM Token"
          placeholder="f_svhkf0QiGZpuqUGFo2Aa:APA91..."
          value={form.token}
          onChange={(event) => setField('token', event.target.value)}
          fullWidth
          multiline
          minRows={3}
        />
      );
    }

    return null;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <GlassPageHeader sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
              <GradientText>Notifications</GradientText>
            </Typography>
            <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
              Send push notifications by phone number, device token, or full audience broadcast.
            </Typography>
          </Box>
          <Chip
            label="Admin token required"
            sx={{
              background: currentTheme.chipBg,
              color: currentTheme.accent,
              fontWeight: 700,
              border: `1px solid ${currentTheme.border}`,
            }}
          />
        </Stack>
      </GlassPageHeader>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Paper
          elevation={0}
          sx={{
            background: currentTheme.cardBg,
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: `1px solid ${currentTheme.border}`,
            overflow: 'hidden',
            boxShadow: currentTheme.shadow,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 1,
              borderBottom: `1px solid ${currentTheme.border}`,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                minHeight: 62,
              },
            }}
          >
            <Tab value="phone" icon={<PersonIcon />} iconPosition="start" label="Phone Number" />
            <Tab value="token" icon={<DeviceIcon />} iconPosition="start" label="Direct Token" />
            <Tab value="customers" icon={<CustomerIcon />} iconPosition="start" label="All Customers" />
            <Tab value="delivery" icon={<DeliveryIcon />} iconPosition="start" label="All Delivery" />
          </Tabs>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <GlassCard sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.75 }}>
                  {panelMeta.title}
                </Typography>
                <Typography variant="body2" sx={{ color: currentTheme.textSecondary, mb: 2 }}>
                  {panelMeta.description}
                </Typography>

                <Alert severity={panelMeta.alertColor} sx={{ mb: 3, borderRadius: 2.5 }}>
                  {panelMeta.alertText}
                </Alert>

                <Stack spacing={2.5}>
                  {renderTargetField()}

                  <TextField
                    label="Notification Title"
                    placeholder="Order Update"
                    value={form.title}
                    onChange={(event) => setField('title', event.target.value)}
                    fullWidth
                  />

                  <TextField
                    label="Message"
                    placeholder="Your order has been picked up by the delivery partner."
                    value={form.message}
                    onChange={(event) => setField('message', event.target.value)}
                    fullWidth
                    multiline
                    minRows={4}
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
                    <Button variant="outlined" onClick={resetForm} disabled={loading}>
                      Clear
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : activeTab === 'phone' || activeTab === 'token' ? <SendIcon /> : <BroadcastIcon />}
                      sx={{
                        background: currentTheme.accentGradient,
                        boxShadow: isDark ? `0 10px 24px ${currentTheme.glow}` : currentTheme.shadowSoft,
                      }}
                    >
                      {panelMeta.buttonText}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </GlassCard>

            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={700}>
                <GradientText>Available Endpoints</GradientText>
              </Typography>

              {[
                ['/api/admin/notifications/send', 'Send to a specific phone number'],
                ['/api/admin/notifications/send-by-token', 'Send to one raw FCM token'],
                ['/api/admin/notifications/send-to-customers', 'Broadcast to all customers'],
                ['/api/admin/notifications/send-to-delivery', 'Broadcast to all delivery partners'],
              ].map(([path, label]) => (
                <GlassCard key={path}>
                  <CardContent sx={{ py: 2.25 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', md: 'center' }}>
                      <Chip
                        label="POST"
                        size="small"
                        sx={{
                          background: currentTheme.chipBg,
                          color: currentTheme.accent,
                          fontWeight: 700,
                          border: `1px solid ${currentTheme.border}`,
                        }}
                      />
                      <Typography variant="body2" fontFamily="monospace" sx={{ color: currentTheme.text }}>
                        {path}
                      </Typography>
                      <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                        {label}
                      </Typography>
                    </Stack>
                  </CardContent>
                </GlassCard>
              ))}
            </Stack>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}
