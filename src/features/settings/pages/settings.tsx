import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  AutoAwesome,
  CreditCard,
  Inventory2,
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
  LiquidButton,
} from '../../../components/glassmorphism/GlassComponents';
import {
  useGetCheckoutSettingsQuery,
  useUpdateCheckoutSettingsMutation,
} from '../../admin/api/adminApi';
import { useAppTheme } from '@contexts/ThemeContext';

type ToggleSettingRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  currentTheme: any;
};

function ToggleSettingRow({
  title,
  description,
  checked,
  onChange,
  currentTheme,
}: ToggleSettingRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: 2,
        borderRadius: 3,
        background: currentTheme.inputBg,
        border: `1px solid ${currentTheme.border}`,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography fontWeight={700}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Switch checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </Box>
  );
}

export default function SettingsPage() {
  const { currentTheme } = useAppTheme();
  const { data, isLoading, isFetching } = useGetCheckoutSettingsQuery();
  const [updateCheckoutSettings, { isLoading: isSaving }] = useUpdateCheckoutSettingsMutation();

  const [form, setForm] = useState({
    deliveryCharge: '0',
    platformFee: '0',
    smallCartFee: '0',
    smallCartThreshold: '100',
    onlinePaymentEnabled: false,
    cashOnDeliveryEnabled: true,
  });

  useEffect(() => {
    if (!data?.settings) return;

    setForm({
      deliveryCharge: String(data.settings.deliveryCharge ?? 0),
      platformFee: String(data.settings.platformFee ?? 0),
      smallCartFee: String(data.settings.smallCartFee ?? 0),
      smallCartThreshold: String(data.settings.smallCartThreshold ?? 100),
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
    const smallCartFee = Number(form.smallCartFee);
    const smallCartThreshold = Number(form.smallCartThreshold);

    if (Number.isNaN(deliveryCharge) || deliveryCharge < 0) {
      toast.error('Delivery charge must be a valid non-negative amount.');
      return;
    }
    if (Number.isNaN(platformFee) || platformFee < 0) {
      toast.error('Platform fee must be a valid non-negative amount.');
      return;
    }
    if (Number.isNaN(smallCartFee) || smallCartFee < 0) {
      toast.error('Small cart fee must be a valid non-negative amount.');
      return;
    }
    if (Number.isNaN(smallCartThreshold) || smallCartThreshold < 0) {
      toast.error('Small cart threshold must be a valid non-negative amount.');
      return;
    }

    try {
      await updateCheckoutSettings({
        deliveryCharge,
        platformFee,
        smallCartFee,
        smallCartThreshold,
        onlinePaymentEnabled: form.onlinePaymentEnabled,
        cashOnDeliveryEnabled: form.cashOnDeliveryEnabled,
      }).unwrap();
      toast.success('Checkout settings updated successfully.');
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to update checkout settings.');
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        display: 'grid',
        gap: 3,
        background: currentTheme.bg,
        minHeight: '100vh',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <GlassPageHeader>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            gap={2}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                <GradientText>Settings</GradientText>
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
                Control customer checkout fees and decide which payment methods appear in the app.
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
            >
              <Button
                component={RouterLink}
                to="/settings"
                variant="contained"
                startIcon={<Payments fontSize="small" />}
                sx={{
                  borderRadius: 999,
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 700,
                  background: currentTheme.chipBg,
                  color: currentTheme.accent,
                  border: `1px solid ${currentTheme.border}`,
                  boxShadow: 'none',
                }}
              >
                Customer App Pricing
              </Button>
              <Button
                component={RouterLink}
                to="/delivery/fare-settings"
                variant="outlined"
                startIcon={<LocalShipping fontSize="small" />}
                sx={{
                  borderRadius: 999,
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 700,
                  borderColor: currentTheme.borderStrong,
                  color: currentTheme.text,
                }}
              >
                Delivery Boy App Pricing
              </Button>
              <Chip
                icon={<Payments fontSize="small" />}
                label="Customer Checkout"
                variant="filled"
                sx={{
                  background: currentTheme.chipBg,
                  color: currentTheme.accent,
                  border: `1px solid ${currentTheme.border}`,
                }}
              />
              <Chip
                icon={<AutoAwesome fontSize="small" />}
                label="Live Admin Controls"
                variant="outlined"
                sx={{
                  borderColor: currentTheme.borderStrong,
                  color: currentTheme.text,
                }}
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
        <GlassCard sx={{ p: { xs: 2.5, md: 3 }, display: 'grid', gap: 3 }}>
          {isLoading ? (
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size={22} />
              <Typography>Loading checkout settings...</Typography>
            </Stack>
          ) : (
            <>
              <Alert
                severity="info"
                sx={{
                  borderRadius: 3,
                  background: currentTheme.chipBg,
                  color: currentTheme.text,
                  border: `1px solid ${currentTheme.border}`,
                }}
              >
                Customer apps now read these values from the backend. Delivery charge and platform
                fee should not be sent from the app request body anymore.
              </Alert>

              <Alert severity="warning" sx={{ borderRadius: 3 }}>
                Billing rule: orders below the threshold use delivery charge plus small cart fee.
                Orders at or above the threshold get free delivery. Platform fee applies
                separately in both cases.
              </Alert>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' },
                  gap: 3,
                  alignItems: 'stretch',
                }}
              >
                <GlassCard sx={{ minWidth: 0, height: '100%', p: { xs: 2.25, md: 2.75 } }}>
                  <Stack spacing={2.5} height="100%">
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <LocalShipping color="primary" />
                      <Typography variant="h6" fontWeight={800}>
                        Fee Configuration
                      </Typography>
                    </Stack>

                    <TextField
                      label="Delivery Charge Below Threshold"
                      type="number"
                      value={form.deliveryCharge}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, deliveryCharge: event.target.value }))
                      }
                      inputProps={{ min: 0, step: '0.01' }}
                      helperText="Applied only when order subtotal is below the threshold."
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

                    <TextField
                      label="Small Cart Fee"
                      type="number"
                      value={form.smallCartFee}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, smallCartFee: event.target.value }))
                      }
                      inputProps={{ min: 0, step: '0.01' }}
                      helperText="Applied when order subtotal is below the threshold."
                      fullWidth
                    />

                    <TextField
                      label="Small Cart Threshold"
                      type="number"
                      value={form.smallCartThreshold}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, smallCartThreshold: event.target.value }))
                      }
                      inputProps={{ min: 0, step: '0.01' }}
                      helperText="Example: set 150 so below 150 uses delivery charge + small cart fee, and 150 or above gets free delivery."
                      fullWidth
                    />
                  </Stack>
                </GlassCard>

                <GlassCard sx={{ minWidth: 0, height: '100%', p: { xs: 2.25, md: 2.75 } }}>
                  <Stack spacing={2.5} height="100%">
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <CreditCard color="primary" />
                      <Typography variant="h6" fontWeight={800}>
                        Payment Methods
                      </Typography>
                    </Stack>

                    <Stack spacing={1.5}>
                      <ToggleSettingRow
                        title="Cash on Delivery"
                        description="Allow customers to pay in cash when the order arrives."
                        checked={form.cashOnDeliveryEnabled}
                        onChange={(checked) =>
                          setForm((prev) => ({ ...prev, cashOnDeliveryEnabled: checked }))
                        }
                        currentTheme={currentTheme}
                      />

                      <ToggleSettingRow
                        title="Cashfree Online Payment"
                        description="Show online checkout and allow Cashfree payment initiation."
                        checked={form.onlinePaymentEnabled}
                        onChange={(checked) =>
                          setForm((prev) => ({ ...prev, onlinePaymentEnabled: checked }))
                        }
                        currentTheme={currentTheme}
                      />
                    </Stack>

                    <Alert severity="warning" sx={{ borderRadius: 3, mt: 'auto' }}>
                      When online payment is disabled here, the customer app hides that option and
                      the backend rejects `ONLINE` order placement and Cashfree initiation.
                    </Alert>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        background: currentTheme.inputBg,
                        border: `1px solid ${currentTheme.border}`,
                      }}
                    >
                      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1 }}>
                        <Inventory2 color="primary" fontSize="small" />
                        <Typography fontWeight={800}>Charge Preview</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        Below ₹{form.smallCartThreshold || '0'}: Delivery ₹
                        {form.deliveryCharge || '0'} + Small Cart ₹{form.smallCartFee || '0'} +
                        Platform ₹{form.platformFee || '0'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                        Free delivery above ?{form.smallCartThreshold || '0'} + Platform ?
                        {form.platformFee || '0'}
                      </Typography>
                    </Box>
                  </Stack>
                </GlassCard>
              </Box>

              <Divider sx={{ borderColor: currentTheme.border }} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' },
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    icon={<SettingsSuggest fontSize="small" />}
                    label={`COD ${form.cashOnDeliveryEnabled ? 'Enabled' : 'Disabled'}`}
                    color={form.cashOnDeliveryEnabled ? 'success' : 'default'}
                    variant={form.cashOnDeliveryEnabled ? 'filled' : 'outlined'}
                  />
                  <Chip
                    icon={<Payments fontSize="small" />}
                    label={`Cashfree ${form.onlinePaymentEnabled ? 'Enabled' : 'Disabled'}`}
                    color={form.onlinePaymentEnabled ? 'success' : 'default'}
                    variant={form.onlinePaymentEnabled ? 'filled' : 'outlined'}
                  />
                  <Chip label={`Delivery Rs ${form.deliveryCharge || '0'}`} variant="outlined" />
                  <Chip label={`Platform Rs ${form.platformFee || '0'}`} variant="outlined" />
                  <Chip label={`Small Cart Rs ${form.smallCartFee || '0'}`} variant="outlined" />
                  <Chip
                    label={`Threshold Rs ${form.smallCartThreshold || '0'}`}
                    variant="outlined"
                  />
                </Stack>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  justifyContent={{ xs: 'stretch', lg: 'flex-end' }}
                >
                  <LiquidButton
                    component={RouterLink}
                    to="/delivery/fare-settings"
                    variant="contained"
                    liquidVariant="neutral"
                    sx={{
                      px: 3,
                      py: 1.2,
                      minWidth: { sm: 180 },
                    }}
                  >
                    Delivery Fare Rules
                  </LiquidButton>
                  <LiquidButton
                    onClick={handleSave}
                    disabled={isSaving || isFetching}
                    variant="contained"
                    liquidVariant="primary"
                    startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                    sx={{
                      px: 3,
                      py: 1.2,
                      minWidth: { sm: 220 },
                    }}
                  >
                    Save Checkout Settings
                  </LiquidButton>
                </Stack>
              </Box>
            </>
          )}
        </GlassCard>
      </motion.div>
    </Box>
  );
}
