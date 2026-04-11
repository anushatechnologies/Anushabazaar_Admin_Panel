import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  AutoAwesome,
  CreditCard,
  LocalShipping,
  Payments,
  Save,
  SettingsSuggest,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  GlassCard,
  GlassPageHeader,
  GradientText,
} from '../../../components/glassmorphism/GlassComponents';
import {
  useGetCheckoutSettingsQuery,
  useUpdateCheckoutSettingsMutation,
} from '../../admin/api/adminApi';

export default function SettingsPage() {
  const { data, isLoading, isFetching } = useGetCheckoutSettingsQuery();
  const [updateCheckoutSettings, { isLoading: isSaving }] = useUpdateCheckoutSettingsMutation();

  const [form, setForm] = useState({
    deliveryCharge: '0',
    platformFee: '0',
    onlinePaymentEnabled: false,
    cashOnDeliveryEnabled: true,
  });

  useEffect(() => {
    if (!data?.settings) return;

    setForm({
      deliveryCharge: String(data.settings.deliveryCharge ?? 0),
      platformFee: String(data.settings.platformFee ?? 0),
      onlinePaymentEnabled: Boolean(data.settings.onlinePaymentEnabled),
      cashOnDeliveryEnabled: Boolean(data.settings.cashOnDeliveryEnabled),
    });
  }, [data]);

  const handleSave = async () => {
    if (!form.onlinePaymentEnabled && !form.cashOnDeliveryEnabled) {
      toast.error('At least one payment method must remain enabled.');
      return;
    }

    const deliveryCharge = Number(form.deliveryCharge);
    const platformFee = Number(form.platformFee);

    if (Number.isNaN(deliveryCharge) || deliveryCharge < 0) {
      toast.error('Delivery charge must be a valid non-negative amount.');
      return;
    }
    if (Number.isNaN(platformFee) || platformFee < 0) {
      toast.error('Platform fee must be a valid non-negative amount.');
      return;
    }

    try {
      await updateCheckoutSettings({
        deliveryCharge,
        platformFee,
        onlinePaymentEnabled: form.onlinePaymentEnabled,
        cashOnDeliveryEnabled: form.cashOnDeliveryEnabled,
      }).unwrap();
      toast.success('Checkout settings updated successfully.');
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to update checkout settings.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, display: 'grid', gap: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <GlassPageHeader>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                <GradientText>Settings</GradientText>
              </Typography>
              <Typography color="text.secondary">
                Control customer checkout fees and decide which payment methods appear in the app.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                icon={<Payments fontSize="small" />}
                label="Customer Checkout"
                variant="filled"
              />
              <Chip
                icon={<AutoAwesome fontSize="small" />}
                label="Live Admin Controls"
                variant="outlined"
              />
            </Stack>
          </Stack>
        </GlassPageHeader>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
      >
        <GlassCard sx={{ display: 'grid', gap: 3 }}>
          {isLoading ? (
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size={22} />
              <Typography>Loading checkout settings...</Typography>
            </Stack>
          ) : (
            <>
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Customer apps now read these values from the backend. Delivery charge and platform
                fee should not be sent from the app request body anymore.
              </Alert>

              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                spacing={3}
                alignItems={{ xs: 'stretch', lg: 'flex-start' }}
              >
                <GlassCard sx={{ flex: 1, minWidth: 0 }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <LocalShipping color="primary" />
                      <Typography variant="h6" fontWeight={800}>
                        Fee Configuration
                      </Typography>
                    </Stack>

                    <TextField
                      label="Fixed Delivery Charge"
                      type="number"
                      value={form.deliveryCharge}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, deliveryCharge: event.target.value }))
                      }
                      inputProps={{ min: 0, step: '0.01' }}
                      helperText="Applied to every customer order from backend checkout settings."
                      fullWidth
                    />

                    <TextField
                      label="Platform Fee"
                      type="number"
                      value={form.platformFee}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, platformFee: event.target.value }))
                      }
                      inputProps={{ min: 0, step: '0.01' }}
                      helperText="Additional fixed fee included in cart totals and orders."
                      fullWidth
                    />
                  </Stack>
                </GlassCard>

                <GlassCard sx={{ flex: 1, minWidth: 0 }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <CreditCard color="primary" />
                      <Typography variant="h6" fontWeight={800}>
                        Payment Methods
                      </Typography>
                    </Stack>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.cashOnDeliveryEnabled}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              cashOnDeliveryEnabled: event.target.checked,
                            }))
                          }
                        />
                      }
                      label="Enable Cash on Delivery"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.onlinePaymentEnabled}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              onlinePaymentEnabled: event.target.checked,
                            }))
                          }
                        />
                      }
                      label="Enable Razorpay Online Payment"
                    />

                    <Alert severity="warning" sx={{ borderRadius: 3 }}>
                      When online payment is disabled here, the customer app hides that option and
                      the backend rejects `ONLINE` order placement and Razorpay initiation.
                    </Alert>
                  </Stack>
                </GlassCard>
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    icon={<SettingsSuggest fontSize="small" />}
                    label={`COD ${form.cashOnDeliveryEnabled ? 'Enabled' : 'Disabled'}`}
                    color={form.cashOnDeliveryEnabled ? 'success' : 'default'}
                    variant={form.cashOnDeliveryEnabled ? 'filled' : 'outlined'}
                  />
                  <Chip
                    icon={<Payments fontSize="small" />}
                    label={`Razorpay ${form.onlinePaymentEnabled ? 'Enabled' : 'Disabled'}`}
                    color={form.onlinePaymentEnabled ? 'success' : 'default'}
                    variant={form.onlinePaymentEnabled ? 'filled' : 'outlined'}
                  />
                  <Chip label={`Delivery Rs ${form.deliveryCharge || '0'}`} variant="outlined" />
                  <Chip label={`Platform Rs ${form.platformFee || '0'}`} variant="outlined" />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    component={RouterLink}
                    to="/delivery/fare-settings"
                    variant="outlined"
                    sx={{
                      borderRadius: 999,
                      px: 3,
                      py: 1.2,
                      textTransform: 'none',
                      fontWeight: 700,
                    }}
                  >
                    Delivery Fare Rules
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || isFetching}
                    variant="contained"
                    startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                    sx={{
                      borderRadius: 999,
                      px: 3,
                      py: 1.2,
                      textTransform: 'none',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #2563eb 0%, #14b8a6 100%)',
                    }}
                  >
                    Save Checkout Settings
                  </Button>
                </Stack>
              </Stack>
            </>
          )}
        </GlassCard>
      </motion.div>
    </Box>
  );
}
