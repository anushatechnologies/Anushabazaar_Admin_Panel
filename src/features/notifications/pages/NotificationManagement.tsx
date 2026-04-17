import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  LinearProgress,
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
  Person as PersonIcon,
  PhoneIphone as DeviceIcon,
  Send as SendIcon,
  ShoppingCart as CustomerIcon,
  UploadFile as UploadFileIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  GlassCard,
  GlassPageHeader,
  GradientText,
} from '@components/glassmorphism/GlassComponents';
import { toast } from '../../../components/toast/ToastContainer';
import { useAppTheme } from '@contexts/ThemeContext';
import {
  useBroadcastToCustomersMutation,
  useBroadcastToDeliveryMutation,
  useGetWhatsAppCampaignStatusQuery,
  useSendNotificationByTokenMutation,
  useSendNotificationMutation,
  useStartWhatsAppCampaignMutation,
  type WhatsAppCampaignRecipientResult,
} from '../api/notificationsApi';

type NotificationTab = 'phone' | 'token' | 'customers' | 'delivery' | 'whatsapp';

type NotificationFormState = {
  phoneNumber: string;
  token: string;
  title: string;
  message: string;
};

type WhatsAppCampaignFormState = {
  templateName: string;
  headerImageUrl: string;
  activeOnly: boolean;
  file: File | null;
};

const INITIAL_FORM: NotificationFormState = {
  phoneNumber: '',
  token: '',
  title: '',
  message: '',
};

const INITIAL_CAMPAIGN_FORM: WhatsAppCampaignFormState = {
  templateName: 'app_launch_offer_april',
  headerImageUrl: '',
  activeOnly: true,
  file: null,
};

const RESULT_STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  SENT: 'success',
  SKIPPED: 'warning',
  FAILED: 'error',
};

export default function NotificationManagement() {
  const { currentTheme, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState<NotificationTab>('phone');
  const [form, setForm] = useState<NotificationFormState>(INITIAL_FORM);
  const [campaignForm, setCampaignForm] =
    useState<WhatsAppCampaignFormState>(INITIAL_CAMPAIGN_FORM);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [campaignPollingInterval, setCampaignPollingInterval] = useState(0);

  const [sendNotification, { isLoading: sendingPhone }] = useSendNotificationMutation();
  const [sendByToken, { isLoading: sendingToken }] = useSendNotificationByTokenMutation();
  const [broadcastCustomers, { isLoading: sendingCustomers }] = useBroadcastToCustomersMutation();
  const [broadcastDelivery, { isLoading: sendingDelivery }] = useBroadcastToDeliveryMutation();
  const [startWhatsAppCampaign, { isLoading: startingCampaign }] =
    useStartWhatsAppCampaignMutation();

  const { data: campaignStatus, isFetching: fetchingCampaignStatus } =
    useGetWhatsAppCampaignStatusQuery(campaignId ?? '', {
      skip: !campaignId,
      pollingInterval: campaignPollingInterval,
      refetchOnMountOrArgChange: true,
    });

  useEffect(() => {
    if (!campaignId) {
      setCampaignPollingInterval(0);
      return;
    }
    setCampaignPollingInterval(3000);
  }, [campaignId]);

  useEffect(() => {
    if (!campaignStatus) return;
    if (campaignStatus.status === 'COMPLETED' || campaignStatus.status === 'FAILED') {
      setCampaignPollingInterval(0);
    }
  }, [campaignStatus]);

  const loading =
    sendingPhone || sendingToken || sendingCustomers || sendingDelivery || startingCampaign;

  const panelMeta = useMemo(() => {
    switch (activeTab) {
      case 'phone':
        return {
          title: 'Send to Specific Phone Number',
          buttonText: 'Send Notification',
        };
      case 'token':
        return {
          title: 'Send to Raw FCM Token',
          buttonText: 'Send to Device',
        };
      case 'customers':
        return {
          title: 'Broadcast to All Customers',
          buttonText: 'Broadcast to Customers',
        };
      case 'delivery':
        return {
          title: 'Broadcast to All Delivery Partners',
          buttonText: 'Broadcast to Delivery',
        };
      default:
        return {
          title: 'Meta WhatsApp Campaign',
          buttonText: 'Start Campaign',
        };
    }
  }, [activeTab]);

  const setField = (field: keyof NotificationFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const setCampaignField = <K extends keyof WhatsAppCampaignFormState>(
    field: K,
    value: WhatsAppCampaignFormState[K],
  ) => {
    setCampaignForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
  };

  const resetCampaignForm = () => {
    setCampaignForm(INITIAL_CAMPAIGN_FORM);
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
      } else if (activeTab === 'delivery') {
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

  const handleStartCampaign = async () => {
    if (!campaignForm.file) {
      toast.error('Please upload a .xlsx or .csv file');
      return;
    }
    if (!campaignForm.templateName.trim()) {
      toast.error('Template name is required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', campaignForm.file);
      formData.append('templateName', campaignForm.templateName.trim());
      formData.append('activeOnly', String(campaignForm.activeOnly));
      if (campaignForm.headerImageUrl.trim()) {
        formData.append('headerImageUrl', campaignForm.headerImageUrl.trim());
      }

      const response = await startWhatsAppCampaign(formData).unwrap();
      setCampaignId(response.campaignId);
      toast.success(
        `Campaign queued for ${response.totalRows} rows. Progress will update automatically.`,
      );
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to start WhatsApp campaign'));
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

  const renderResultItem = (result: WhatsAppCampaignRecipientResult) => (
    <Paper
      key={`${result.rowNumber}-${result.phoneNumber}-${result.status}`}
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 3,
        background: currentTheme.cardBgElevated,
        border: `1px solid ${currentTheme.border}`,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Box>
          <Typography variant="body2" fontWeight={700}>
            Row {result.rowNumber}
            {result.name ? ` - ${result.name}` : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {result.phoneNumber || 'No phone number'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {result.message}
          </Typography>
        </Box>
        <Chip
          label={result.status}
          color={RESULT_STATUS_COLOR[result.status] || 'default'}
          size="small"
        />
      </Stack>
    </Paper>
  );

  const renderCampaignPanel = () => {
    const processed = campaignStatus?.processed ?? 0;
    const totalRows = campaignStatus?.totalRows ?? 0;
    const progress = totalRows > 0 ? Math.min((processed / totalRows) * 100, 100) : 0;
    const recentResults = campaignStatus?.results?.slice(-12).reverse() ?? [];

    return (
      <Stack spacing={2.5}>
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Upload a `.xlsx` or `.csv` file with `Phone Number` and `Name` columns. `Active` is
          optional, and extra template values can be added as `Var1`, `Var2`, `Var3` columns. For
          image-header templates like `app_launch_offer_april`, add the public image URL below.
        </Alert>

        <Stack spacing={2}>
          <TextField
            label="Meta Template Name"
            placeholder="app_launch_offer_april"
            value={campaignForm.templateName}
            onChange={(event) => setCampaignField('templateName', event.target.value)}
            fullWidth
          />

          <TextField
            label="Header Image URL"
            placeholder="https://your-cdn.com/campaigns/launch-banner.png"
            value={campaignForm.headerImageUrl}
            onChange={(event) => setCampaignField('headerImageUrl', event.target.value)}
            fullWidth
            helperText="Leave blank for templates without an image header."
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={campaignForm.activeOnly}
                onChange={(event) => setCampaignField('activeOnly', event.target.checked)}
              />
            }
            label="Send only to rows marked active"
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileIcon />}
              sx={{ minWidth: 220 }}
            >
              Upload Excel / CSV
              <input
                hidden
                type="file"
                accept=".xlsx,.csv"
                onChange={(event) => setCampaignField('file', event.target.files?.[0] ?? null)}
              />
            </Button>

            {campaignForm.file ? (
              <Chip
                label={`${campaignForm.file.name} (${Math.round(campaignForm.file.size / 1024)} KB)`}
                color="success"
                variant="outlined"
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No file selected yet
              </Typography>
            )}
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={resetCampaignForm} disabled={loading}>
              Clear
            </Button>
            <Button
              variant="contained"
              onClick={handleStartCampaign}
              disabled={loading}
              startIcon={
                startingCampaign ? <CircularProgress size={18} color="inherit" /> : <WhatsAppIcon />
              }
              sx={{
                background: currentTheme.accentGradient,
                boxShadow: isDark ? `0 10px 24px ${currentTheme.glow}` : currentTheme.shadowSoft,
              }}
            >
              Start Campaign
            </Button>
          </Stack>
        </Stack>

        {campaignStatus && (
          <GlassCard>
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.5}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Campaign Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Template: {campaignStatus.templateName}
                      {campaignStatus.sourceFileName
                        ? ` - File: ${campaignStatus.sourceFileName}`
                        : ''}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      label={campaignStatus.status}
                      color={
                        campaignStatus.status === 'COMPLETED'
                          ? 'success'
                          : campaignStatus.status === 'FAILED'
                            ? 'error'
                            : 'primary'
                      }
                    />
                    {fetchingCampaignStatus && campaignPollingInterval > 0 && (
                      <Chip label="Refreshing..." size="small" variant="outlined" />
                    )}
                  </Stack>
                </Stack>

                <Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 10, borderRadius: 999 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {campaignStatus.processed} / {campaignStatus.totalRows} rows processed
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                  <Chip label={`Sent: ${campaignStatus.sent}`} color="success" />
                  <Chip label={`Failed: ${campaignStatus.failed}`} color="error" />
                  <Chip label={`Skipped: ${campaignStatus.skipped}`} color="warning" />
                  <Chip label={`Active only: ${campaignStatus.activeOnly ? 'Yes' : 'No'}`} />
                </Stack>

                {campaignStatus.errorMessage && (
                  <Alert severity="error" sx={{ borderRadius: 3 }}>
                    {campaignStatus.errorMessage}
                  </Alert>
                )}

                {recentResults.length > 0 && (
                  <Stack spacing={1.25}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Latest Results
                    </Typography>
                    {recentResults.map(renderResultItem)}
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </GlassCard>
        )}
      </Stack>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <GlassPageHeader sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
              <GradientText>Notifications</GradientText>
            </Typography>
          </Box>
        </Stack>
      </GlassPageHeader>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
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
            <Tab
              value="customers"
              icon={<CustomerIcon />}
              iconPosition="start"
              label="All Customers"
            />
            <Tab
              value="delivery"
              icon={<DeliveryIcon />}
              iconPosition="start"
              label="All Delivery"
            />
            <Tab
              value="whatsapp"
              icon={<WhatsAppIcon />}
              iconPosition="start"
              label="WhatsApp Campaign"
            />
          </Tabs>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <GlassCard sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.75 }}>
                  {panelMeta.title}
                </Typography>

                {activeTab === 'whatsapp' ? (
                  renderCampaignPanel()
                ) : (
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

                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                      justifyContent="flex-end"
                    >
                      <Button variant="outlined" onClick={resetForm} disabled={loading}>
                        Clear
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        startIcon={
                          loading ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : activeTab === 'phone' || activeTab === 'token' ? (
                            <SendIcon />
                          ) : (
                            <BroadcastIcon />
                          )
                        }
                        sx={{
                          background: currentTheme.accentGradient,
                          boxShadow: isDark
                            ? `0 10px 24px ${currentTheme.glow}`
                            : currentTheme.shadowSoft,
                        }}
                      >
                        {panelMeta.buttonText}
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </CardContent>
            </GlassCard>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}
