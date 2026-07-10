import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import {
  useGetWhatsAppCampaignStatusQuery,
  useSendWhatsAppSingleTestMutation,
  useStartReferAndEarnCampaignMutation,
  useStartReferralTemplateCampaignMutation,
  useStartWhatsAppAppVideoCampaignMutation,
  useStartGlobalHiringCampaignMutation,
  useStartWhatsAppCampaignMutation,
  useGetMetaTemplatesQuery,
} from '../api/notificationsApi';
import {
  useCreateWhatsAppTemplateMutation,
  useSubmitWhatsAppTemplateForReviewMutation,
} from '../api/whatsappTemplateApi';

const APP_VIDEO_TEMPLATE = 'pg_app_video_v1';
const REFER_TEMPLATE = 'refer_and_earn_invite';
const LUCKY_TEMPLATE = 'lucky';
const HIRING_TEMPLATE = 'anusha_nexus_global_hiring';

const appVideoSampleRows = `Phone Number,Name,Var1,Active
919876543210,pgname,pgname,true`;

const referSampleRows = `Phone Number,Name,Active
919876543210,Rahul,true
919812345678,Priya,true`;

const hiringSampleRows = `Phone Number,Name,Active
919876543210,Rahul,true
919812345678,Priya,true`;

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    background: 'var(--color-card)',
  },
};

type CampaignTab =
  | 'app-video'
  | 'refer-and-earn'
  | 'lucky-referral'
  | 'global-hiring'
  | 'existing-template';

export default function WhatsAppCampaignPage() {
  const [tab, setTab] = useState<CampaignTab>('refer-and-earn');
  const [campaignId, setCampaignId] = useState('');

  const statusQuery = useGetWhatsAppCampaignStatusQuery(campaignId, {
    skip: !campaignId,
    pollingInterval: campaignId ? 3000 : 0,
  });
  const status = statusQuery.data;

  const progress = useMemo(() => {
    if (!status?.totalRows) return 0;
    return Math.round((status.processed / status.totalRows) * 100);
  }, [status]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, display: 'grid', gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900, color: 'var(--color-text)' }}>
          WhatsApp Campaigns
        </Typography>
        <Typography sx={{ color: 'var(--color-text-muted)', mt: 0.5 }}>
          Send approved Meta templates to your customer list. Each row gets a personalized message.
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => {
          setTab(v);
          setCampaignId('');
        }}
        sx={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <Tab
          icon={<CardGiftcardIcon />}
          iconPosition="start"
          label="Refer & Earn blast"
          value="refer-and-earn"
        />
        <Tab
          icon={<CardGiftcardIcon />}
          iconPosition="start"
          label="Lucky Referral (Image)"
          value="lucky-referral"
        />
        <Tab
          icon={<WhatsAppIcon />}
          iconPosition="start"
          label="App video promo"
          value="app-video"
        />
        <Tab
          icon={<WhatsAppIcon />}
          iconPosition="start"
          label="Global Hiring"
          value="global-hiring"
        />
        <Tab
          icon={<SendIcon />}
          iconPosition="start"
          label="Send Existing Template"
          value="existing-template"
        />
      </Tabs>

      {tab === 'refer-and-earn' && (
        <>
          <DiagnosticTester defaultTemplate={REFER_TEMPLATE} />
          <ReferAndEarnTab onCampaignStart={setCampaignId} />
        </>
      )}
      {tab === 'lucky-referral' && (
        <>
          <DiagnosticTester defaultTemplate={LUCKY_TEMPLATE} />
          <LuckyReferralTab onCampaignStart={setCampaignId} />
        </>
      )}
      {tab === 'app-video' && (
        <>
          <DiagnosticTester defaultTemplate={APP_VIDEO_TEMPLATE} />
          <AppVideoTab onCampaignStart={setCampaignId} />
        </>
      )}
      {tab === 'global-hiring' && (
        <>
          <DiagnosticTester defaultTemplate={HIRING_TEMPLATE} />
          <GlobalHiringTab onCampaignStart={setCampaignId} />
        </>
      )}
      {tab === 'existing-template' && <ExistingTemplateTab onCampaignStart={setCampaignId} />}

      <TemplateWorkflowCard />

      {status && (
        <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
          <CardContent sx={{ display: 'grid', gap: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Campaign Status
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-muted)' }}>
                  {status.campaignId} · template <b>{status.templateName}</b>
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => statusQuery.refetch()}
                sx={{ borderRadius: 3 }}
              >
                Refresh
              </Button>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 999 }}
            />
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {[
                ['Status', status.status],
                ['Processed', status.processed],
                ['Sent', status.sent],
                ['Failed', status.failed],
                ['Skipped', status.skipped],
                ['Total', status.totalRows],
              ].map(([label, value]) => (
                <Chip key={label} label={`${label}: ${value}`} sx={{ fontWeight: 800 }} />
              ))}
            </Stack>
            <Box
              sx={{
                maxHeight: 280,
                overflow: 'auto',
                borderRadius: 3,
                border: '1px solid var(--color-border)',
              }}
            >
              {status.results?.map((result) => (
                <Box
                  key={`${result.rowNumber}-${result.phoneNumber}`}
                  sx={{ p: 1.4, borderBottom: '1px solid var(--color-border)' }}
                >
                  <Typography sx={{ fontWeight: 900, fontSize: 14 }}>
                    Row {result.rowNumber}: {result.name || result.phoneNumber}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--color-text-muted)', fontSize: 12 }}
                  >
                    <Chip
                      size="small"
                      label={result.status}
                      color={
                        result.status === 'FAILED'
                          ? 'error'
                          : result.status === 'SKIPPED'
                            ? 'default'
                            : 'success'
                      }
                      sx={{ mr: 1, fontSize: 10, height: 18 }}
                    />
                    {result.message}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

/* ─────────── Diagnostic — send to ONE phone ─────────── */
function TemplateWorkflowCard() {
  const [createTemplate, { isLoading: isCreating }] = useCreateWhatsAppTemplateMutation();
  const [submitForReview, { isLoading: isSubmitting }] =
    useSubmitWhatsAppTemplateForReviewMutation();
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('scan2paper_shop_invitation');
  const [language, setLanguage] = useState('English');
  const [category, setCategory] = useState('Marketing');
  const [bodyText, setBodyText] = useState(
    `Hello {{1}},\n\nWe are introducing Scan2Paper, a smart document upload platform designed specifically for Xerox and printing shops.\n\nWith Scan2Paper, every shop gets its own unique QR Code. Customers simply scan the QR Code, enter their details, upload documents, and the files are delivered directly to your shop dashboard.`,
  );
  const [headerType, setHeaderType] = useState('none');
  const [footerText, setFooterText] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('https://www.scan2paper.com');
  const [phoneNumber, setPhoneNumber] = useState('08019336733');

  const handleSave = async () => {
    try {
      const res = await createTemplate({
        name: templateName,
        language,
        category,
        headerType,
        bodyText,
        footerText,
        websiteUrl,
        phoneNumber,
      }).unwrap();
      setTemplateId(res.id);
      toast.success('Template saved as draft');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save template');
    }
  };

  const handleSubmit = async () => {
    if (!templateId) {
      toast.error('Save the template first');
      return;
    }
    try {
      const res = await submitForReview(templateId).unwrap();
      toast.success(res.reviewNotes || 'Template submitted for review');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit template');
    }
  };

  return (
    <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
      <CardContent sx={{ display: 'grid', gap: 2.2 }}>
        <Stack direction="row" alignItems="center" gap={1.2}>
          <WhatsAppIcon color="primary" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              WhatsApp template workflow
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create, edit, and submit a Meta-ready WhatsApp template for review from the admin
              panel.
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
          <TextField
            label="Template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            fullWidth
            size="small"
            sx={fieldStyle}
          />
          <TextField
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            fullWidth
            size="small"
            sx={fieldStyle}
          />
          <TextField
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
            size="small"
            sx={fieldStyle}
          />
        </Stack>

        <TextField
          label="Header type"
          value={headerType}
          onChange={(e) => setHeaderType(e.target.value)}
          fullWidth
          size="small"
          sx={fieldStyle}
        />
        <TextField
          label="Header text"
          value=""
          placeholder="Optional header text"
          fullWidth
          size="small"
          sx={fieldStyle}
        />
        <TextField
          label="Body"
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          multiline
          minRows={8}
          fullWidth
          sx={fieldStyle}
        />
        <TextField
          label="Footer"
          value={footerText}
          onChange={(e) => setFooterText(e.target.value)}
          fullWidth
          size="small"
          sx={fieldStyle}
        />
        <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
          <TextField
            label="Website URL"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            fullWidth
            size="small"
            sx={fieldStyle}
          />
          <TextField
            label="Phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            fullWidth
            size="small"
            sx={fieldStyle}
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isCreating}
            sx={{ borderRadius: 3, fontWeight: 800 }}
          >
            {isCreating ? 'Saving…' : 'Create template'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleSubmit}
            disabled={isSubmitting || !templateId}
            sx={{ borderRadius: 3, fontWeight: 800 }}
          >
            {isSubmitting ? 'Submitting…' : 'Submit for review'}
          </Button>
        </Stack>

        {templateId && (
          <Alert severity="success" sx={{ borderRadius: 3 }}>
            Template draft saved with ID {templateId}. Submit it when you are ready for Meta review.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function DiagnosticTester({ defaultTemplate }: { defaultTemplate: string }) {
  const [phone, setPhone] = useState('');
  const [headerMediaUrl, setHeaderMediaUrl] = useState('');
  const [templateName, setTemplateName] = useState(defaultTemplate);
  const [send, { data, isLoading }] = useSendWhatsAppSingleTestMutation();

  // Update template name when defaultTemplate prop changes (on tab switch)
  useEffect(() => {
    setTemplateName(defaultTemplate);
  }, [defaultTemplate]);

  const handleTest = async () => {
    if (!phone.trim()) {
      toast.error('Enter a phone number');
      return;
    }
    try {
      const res = await send({
        phone: phone.trim(),
        templateName: templateName,
        headerMediaUrl: headerMediaUrl.trim() || undefined,
      }).unwrap();
      if (res.success) toast.success('Sent — check WhatsApp on the test phone');
      else toast.error('Send failed — see Meta error details below');
    } catch (e: any) {
      toast.error(e?.data?.message || 'Test failed');
    }
  };

  const wameLink = phone.trim() ? `https://wa.me/${phone.trim().replace(/\D/g, '')}` : null;

  return (
    <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)', mb: 2 }}>
      <CardContent sx={{ display: 'grid', gap: 1.6 }}>
        <Stack direction="row" alignItems="center" gap={1.2}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              background: 'rgba(255,193,7,0.15)',
              color: 'warning.main',
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            🔬
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Diagnostic — send test to ONE number
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use this BEFORE the bulk blast. Shows Meta's full error response so you know exactly
              why a message fails. Doesn't burn your campaign quota.
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
          <TextField
            label="Test phone (with or without 91)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9948598350 or 919948598350"
            fullWidth
            size="small"
            sx={fieldStyle}
          />
          <TextField
            label="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g. lucky or refer_and_earn_invite"
            fullWidth
            size="small"
            sx={fieldStyle}
          />
          <TextField
            label="Header media URL (optional)"
            value={headerMediaUrl}
            onChange={(e) => setHeaderMediaUrl(e.target.value)}
            placeholder="S3 URL (image or video)"
            fullWidth
            size="small"
            sx={fieldStyle}
          />
          <Button
            variant="contained"
            color="warning"
            onClick={handleTest}
            disabled={isLoading}
            sx={{ borderRadius: 3, fontWeight: 800, minWidth: 140 }}
          >
            {isLoading ? 'Sending…' : 'Send test'}
          </Button>
        </Stack>

        {wameLink && (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            Verify this number actually has WhatsApp →{' '}
            <a href={wameLink} target="_blank" rel="noopener noreferrer">
              {wameLink}
            </a>
            . If it says "Phone number is not on WhatsApp", that's why all sends fail.
          </Alert>
        )}

        {data && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
              Meta full response{' '}
              <Chip
                size="small"
                label={data.success ? 'ACCEPTED' : 'FAILED'}
                color={data.success ? 'success' : 'error'}
                sx={{ ml: 1, fontWeight: 800 }}
              />
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                borderRadius: 3,
                overflowX: 'auto',
                background: 'rgba(0,0,0,0.32)',
                color: 'var(--color-text)',
                fontSize: 12,
                maxHeight: 320,
                overflowY: 'auto',
              }}
            >
              {JSON.stringify(data, null, 2)}
            </Box>
            {!data.success && data.metaError?.error?.code === 131049 && (
              <Alert severity="warning" sx={{ borderRadius: 3, mt: 1.5 }}>
                <b>131049 explained:</b> Meta deliberately blocked this delivery for one of: (a) the
                recipient already received the daily marketing-template cap from any business today,
                (b) the recipient muted marketing notifications, (c) template "Quality" is still
                pending. <b>Fix:</b> ask the recipient to send "Hi" to your business WhatsApp number
                first, then re-test within 24 hours.
              </Alert>
            )}
            {!data.success && data.metaError?.error?.code === 131026 && (
              <Alert severity="error" sx={{ borderRadius: 3, mt: 1.5 }}>
                <b>131026:</b> Recipient phone is NOT on WhatsApp. Verify with the wa.me link above.
              </Alert>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/* ─────────── Refer & earn tab ─────────── */
function ReferAndEarnTab({ onCampaignStart }: { onCampaignStart: (id: string) => void }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [recipientFile, setRecipientFile] = useState<File | null>(null);
  const [activeOnly, setActiveOnly] = useState(true);
  const [start, startState] = useStartReferAndEarnCampaignMutation();

  /**
   * Smart file picker — auto-routes uploaded files based on extension:
   *   .csv / .xlsx → recipients
   *   .mp4 / video/* → video header
   * Prevents the common mistake of uploading the spreadsheet in the video slot.
   */
  const handleFile = (file: File | null, expectedType: 'recipients' | 'video') => {
    if (!file) return;
    const name = file.name.toLowerCase();
    const isSheet = name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls');
    const isVideo =
      file.type.startsWith('video/') || name.endsWith('.mp4') || name.endsWith('.mov');

    if (isSheet) {
      setRecipientFile(file);
      if (expectedType === 'video') {
        toast.success(`Detected ${file.name} as recipients file (auto-moved to correct slot)`);
      }
      return;
    }
    if (isVideo) {
      setVideoFile(file);
      if (expectedType === 'recipients') {
        toast.success(`Detected ${file.name} as video file (auto-moved to correct slot)`);
      }
      return;
    }
    toast.error(`Unsupported file type: ${file.name}. Use .csv, .xlsx, or .mp4`);
  };

  const handleSend = async () => {
    if (!recipientFile) {
      toast.error('Upload recipients CSV/XLSX first');
      return;
    }
    if (!videoUrl.trim() && !videoFile) {
      toast.error('Provide a video — paste an S3 URL or upload an MP4 file');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('file', recipientFile);
      if (videoFile) fd.append('headerMediaFile', videoFile);
      if (videoUrl.trim()) fd.append('headerMediaUrl', videoUrl.trim());
      fd.append('activeOnly', String(activeOnly));

      const response = await start(fd).unwrap();
      onCampaignStart(response.campaignId);
      toast.success(response.message || 'Refer & earn campaign queued');
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to send campaign');
    }
  };

  return (
    <>
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        Sends Meta template <b>{REFER_TEMPLATE}</b>. Each recipient's referral link{' '}
        <code>{'{{1}}'}</code> is auto-resolved from their phone number — the CSV only needs{' '}
        <b>Phone Number</b> + <b>Name</b>. Customers without a referral code yet will get one
        auto-generated.
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' }, gap: 3 }}>
        <Stack gap={3}>
          <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
            <CardContent sx={{ display: 'grid', gap: 2.2 }}>
              <Stack direction="row" alignItems="center" gap={1.2}>
                <CardGiftcardIcon color="warning" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Template Setup
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved template — body has 1 variable (the personalized referral link).
                  </Typography>
                </Box>
              </Stack>

              <TextField
                label="Template name"
                value={REFER_TEMPLATE}
                InputProps={{ readOnly: true }}
                sx={fieldStyle}
              />

              {/* STEP 1 — recipients (most important, prominent green button) */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, mb: 1, color: 'var(--color-text)' }}
                >
                  Step 1 — Recipients (required)
                </Typography>
                <Button
                  component="label"
                  variant="contained"
                  color={recipientFile ? 'success' : 'primary'}
                  fullWidth
                  sx={{ borderRadius: 3, py: 1.6, fontWeight: 800 }}
                >
                  {recipientFile ? `✓ ${recipientFile.name}` : 'Upload recipients CSV/XLSX'}
                  <input
                    hidden
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null, 'recipients')}
                  />
                </Button>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', mt: 0.5, color: 'var(--color-text-muted)' }}
                >
                  Columns: Phone Number (required), Name, Active
                </Typography>
              </Box>

              {/* STEP 2 — video (URL or file) */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, mb: 1, color: 'var(--color-text)' }}
                >
                  Step 2 — Header video (required)
                </Typography>
                <TextField
                  label="Public S3 URL"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://anusha-images-prod.s3.ap-south-2.amazonaws.com/promos/refer.mp4"
                  helperText="MP4 under 16 MB. Or use the upload button below."
                  fullWidth
                  sx={fieldStyle}
                />
                <Button
                  component="label"
                  variant={videoFile ? 'contained' : 'outlined'}
                  color={videoFile ? 'success' : 'inherit'}
                  fullWidth
                  sx={{ borderRadius: 3, py: 1.4, mt: 1, fontWeight: 700 }}
                >
                  {videoFile ? `✓ ${videoFile.name}` : 'OR upload MP4 file directly'}
                  <input
                    hidden
                    type="file"
                    accept="video/mp4,video/*"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null, 'video')}
                  />
                </Button>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={activeOnly}
                    onChange={(e) => setActiveOnly(e.target.checked)}
                  />
                }
                label="Skip rows where Active is false"
              />

              <Button
                size="large"
                variant="contained"
                color="warning"
                startIcon={<SendIcon />}
                onClick={handleSend}
                disabled={startState.isLoading}
                sx={{ borderRadius: 3, fontWeight: 900, mt: 1, py: 1.8 }}
              >
                {startState.isLoading ? 'Queuing...' : 'Send Refer & Earn blast'}
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                CSV format
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-muted)', mb: 2 }}>
                Only <b>Phone Number</b> is required. <b>Name</b> and <b>Active</b> are optional.
                The {'{{1}}'} variable is filled automatically — don't include a Var1 column.
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  borderRadius: 3,
                  overflowX: 'auto',
                  background: 'rgba(0,0,0,0.22)',
                  color: 'var(--color-text)',
                  fontSize: 13,
                }}
              >
                {referSampleRows}
              </Box>
            </CardContent>
          </Card>
        </Stack>

        <Stack gap={3}>
          <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                What recipients see
              </Typography>
              <Box
                sx={{ mx: 'auto', maxWidth: 360, borderRadius: 5, background: '#0b141a', p: 1.5 }}
              >
                <Box sx={{ overflow: 'hidden', borderRadius: 4, background: '#202c33' }}>
                  {videoFile ? (
                    <Box
                      component="video"
                      src={URL.createObjectURL(videoFile)}
                      controls
                      muted
                      sx={{ width: '100%', aspectRatio: '16 / 9', background: '#000' }}
                    />
                  ) : videoUrl.trim() ? (
                    <Box
                      component="video"
                      src={videoUrl.trim()}
                      controls
                      muted
                      sx={{ width: '100%', aspectRatio: '16 / 9', background: '#000' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        aspectRatio: '16 / 9',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#8696a0',
                        background: '#111b21',
                      }}
                    >
                      Video header
                    </Box>
                  )}
                  <Box sx={{ p: 2, color: '#e9edef' }}>
                    <Typography sx={{ whiteSpace: 'pre-line', fontSize: 13, lineHeight: 1.55 }}>
                      {`ANUSHA BAZAAR Refer & Earn

👋 Hi Friends!

📲 ANUSHA BAZAAR App Download చేసి Signup చేయండి.
✨ App లో ఉన్న మీ Referral Code ని Friends & Family తో Share చేయండి.

🎁 Referral Code ఉపయోగించి Signup చేసిన వెంటనే Referrer & New User ఇద్దరికీ Lucky Scratch Card!

💰 Up to 200 Points · 10 Points = ₹1

📲 ఇప్పుడే Download చేయండి:
https://app.anushatechnologies.com/r/{CODE}`}
                    </Typography>
                    <Stack sx={{ mt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <Button sx={{ color: '#53bdeb', fontWeight: 900 }}>Download App</Button>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </>
  );
}

/* ─────────── App video tab (existing pg_app_video_v1) ─────────── */
function AppVideoTab({ onCampaignStart }: { onCampaignStart: (id: string) => void }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [recipientFile, setRecipientFile] = useState<File | null>(null);
  const [activeOnly, setActiveOnly] = useState(true);
  const [start, startState] = useStartWhatsAppAppVideoCampaignMutation();

  const handleSend = async () => {
    if (!recipientFile) {
      toast.error('Upload customer CSV or XLSX first');
      return;
    }
    if (!videoUrl.trim()) {
      toast.error('Paste the public S3 video URL first');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('file', recipientFile);
      fd.append('headerMediaUrl', videoUrl.trim());
      fd.append('activeOnly', String(activeOnly));
      const response = await start(fd).unwrap();
      onCampaignStart(response.campaignId);
      toast.success(response.message || 'Campaign queued');
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to send campaign');
    }
  };

  return (
    <>
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        Sends Meta template <b>{APP_VIDEO_TEMPLATE}</b>. CSV needs Phone Number, Name, optional
        Var1, Active.
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' }, gap: 3 }}>
        <Stack gap={3}>
          <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
            <CardContent sx={{ display: 'grid', gap: 2.2 }}>
              <TextField
                label="Template name"
                value={APP_VIDEO_TEMPLATE}
                InputProps={{ readOnly: true }}
                sx={fieldStyle}
              />
              <TextField
                label="S3 public video URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://anusha-images-prod.s3.ap-south-2.amazonaws.com/banners/p2.mp4"
                sx={fieldStyle}
              />
              <Button component="label" variant="outlined" sx={{ borderRadius: 3, py: 1.4 }}>
                {recipientFile ? recipientFile.name : 'Upload recipients CSV/XLSX'}
                <input
                  hidden
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(e) => setRecipientFile(e.target.files?.[0] ?? null)}
                />
              </Button>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={activeOnly}
                    onChange={(e) => setActiveOnly(e.target.checked)}
                  />
                }
                label="Skip rows where Active is false"
              />
              <Button
                size="large"
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSend}
                disabled={startState.isLoading}
                sx={{ borderRadius: 3, fontWeight: 900, mt: 1 }}
              >
                {startState.isLoading ? 'Sending...' : 'Send App video campaign'}
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                CSV format
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  borderRadius: 3,
                  overflowX: 'auto',
                  background: 'rgba(0,0,0,0.22)',
                  color: 'var(--color-text)',
                  fontSize: 13,
                }}
              >
                {appVideoSampleRows}
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </>
  );
}
/* ─────────── Lucky Referral Tab (The "lucky" template) ─────────── */
function LuckyReferralTab({ onCampaignStart }: { onCampaignStart: (id: string) => void }) {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [recipientFile, setRecipientFile] = useState<File | null>(null);
  const [activeOnly, setActiveOnly] = useState(true);
  const [start, startState] = useStartReferralTemplateCampaignMutation();

  const handleFile = (file: File | null, expectedType: 'recipients' | 'video') => {
    if (!file) return;
    const name = file.name.toLowerCase();
    const isSheet = name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls');
    const isVideo =
      file.type.startsWith('video/') ||
      name.endsWith('.mp4') ||
      name.endsWith('.3gp') ||
      name.endsWith('.mov') ||
      name.endsWith('.webm');

    if (isSheet) {
      setRecipientFile(file);
      if (expectedType === 'video') toast.success(`Auto-moved ${file.name} to recipients slot`);
      return;
    }
    if (isVideo) {
      setImageFile(file);
      if (expectedType === 'recipients') toast.success(`Auto-moved ${file.name} to video slot`);
      return;
    }
    toast.error(`Unsupported file type: ${file.name}`);
  };

  const handleSend = async () => {
    if (!recipientFile) {
      toast.error('Upload recipients first');
      return;
    }
    if (!imageUrl.trim() && !imageFile) {
      toast.error('Provide a header video');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('file', recipientFile);
      fd.append('templateName', LUCKY_TEMPLATE);
      fd.append('headerType', 'image');
      if (imageFile) fd.append('headerMediaFile', imageFile);
      if (imageUrl.trim()) fd.append('headerMediaUrl', imageUrl.trim());
      fd.append('activeOnly', String(activeOnly));

      const response = await start(fd).unwrap();
      onCampaignStart(response.campaignId);
      toast.success(response.message || 'Lucky referral campaign queued');
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to send campaign');
    }
  };

  return (
    <>
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        Sends Meta template <b>{LUCKY_TEMPLATE}</b>. High-impact Telugu message with an image
        header. Variable <code>{'{{1}}'}</code> is auto-filled with each customer's unique referral
        link.
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' }, gap: 3 }}>
        <Stack gap={3}>
          <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
            <CardContent sx={{ display: 'grid', gap: 2.2 }}>
              <Stack direction="row" alignItems="center" gap={1.2}>
                <CardGiftcardIcon color="info" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Lucky Setup
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Template: {LUCKY_TEMPLATE}
                  </Typography>
                </Box>
              </Stack>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                  Step 1 — Recipients
                </Typography>
                <Button
                  component="label"
                  variant="contained"
                  color={recipientFile ? 'success' : 'primary'}
                  fullWidth
                  sx={{ borderRadius: 3, py: 1.6, fontWeight: 800 }}
                >
                  {recipientFile ? `✓ ${recipientFile.name}` : 'Upload recipients CSV/XLSX'}
                  <input
                    hidden
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null, 'recipients')}
                  />
                </Button>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                  Step 2 — Header Video
                </Typography>
                <TextField
                  label="Video URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://.../lucky.png"
                  fullWidth
                  sx={fieldStyle}
                />
                <Button
                  component="label"
                  variant={imageFile ? 'contained' : 'outlined'}
                  color={imageFile ? 'success' : 'inherit'}
                  fullWidth
                  sx={{ borderRadius: 3, py: 1.4, mt: 1, fontWeight: 700 }}
                >
                  {imageFile ? `✓ ${imageFile.name}` : 'OR upload video directly'}
                  <input
                    hidden
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null, 'video')}
                  />
                </Button>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={activeOnly}
                    onChange={(e) => setActiveOnly(e.target.checked)}
                  />
                }
                label="Skip rows where Active is false"
              />

              <Button
                size="large"
                variant="contained"
                color="info"
                startIcon={<SendIcon />}
                onClick={handleSend}
                disabled={startState.isLoading}
                sx={{ borderRadius: 3, fontWeight: 900, mt: 1, py: 1.8 }}
              >
                {startState.isLoading ? 'Queuing...' : 'Send Lucky Referral blast'}
              </Button>
            </CardContent>
          </Card>
        </Stack>

        <Stack gap={3}>
          <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                What recipients see
              </Typography>
              <Box
                sx={{ mx: 'auto', maxWidth: 360, borderRadius: 5, background: '#0b141a', p: 1.5 }}
              >
                <Box sx={{ overflow: 'hidden', borderRadius: 4, background: '#202c33' }}>
                  {imageFile ? (
                    <Box
                      component="video"
                      src={URL.createObjectURL(imageFile)}
                      controls
                      muted
                      sx={{
                        width: '100%',
                        aspectRatio: '16/9',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : imageUrl.trim() ? (
                    <Box
                      component="video"
                      src={imageUrl.trim()}
                      controls
                      muted
                      sx={{
                        width: '100%',
                        aspectRatio: '16/9',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        aspectRatio: '16/9',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#8696a0',
                        background: '#111b21',
                      }}
                    >
                      Video header
                    </Box>
                  )}
                  <Box sx={{ p: 2, color: '#e9edef' }}>
                    <Typography sx={{ whiteSpace: 'pre-line', fontSize: 12, lineHeight: 1.45 }}>
                      {`ANUSHA BAZAAR – REFER & EARN 

📲 మీ దగ్గర Mobile ఉంటే చాలు…
ఇంట్లో నుంచే Points Earn చేసి Grocery Shopping లో Save చేయండి! 

మీ Friends & Family కి
ANUSHA BAZAAR App Share చేయండి 

వాళ్లు మీ Referral Code తో Signup చేస్తే…
 మీ ఇద్దరికీ Lucky Scratch Card Unlock అవుతుంది!

 Scratch చేసి
🪙 500 వరకు Reward Points గెలుచుకునే Chance!

💰 10 Points = ₹1 Saving
 వచ్చిన Points మీ Wallet లో Auto Add అవుతాయి

 ఆ Wallet Points తో
 Vegetables, Fruits, Daily Grocery
 Household Essentials
కొనుగోలు చేసి Money Save చేసుకోండి 

━━━━━━━━━━━━━━━

📌 How It Works?
1. App Download చేయండి
2. Referral Code Enter చేయండి
3. Scratch Card Open చేయండి
4. Points Win చేసి Wallet లో పొందండి

━━━━━━━━━━━━━━━

📲Download Now:
https://app.anushatechnologies.com/r/{CODE}`}
                    </Typography>
                    <Stack sx={{ mt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <Button sx={{ color: '#53bdeb', fontWeight: 900 }}>Download App</Button>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </>
  );
}

/* ─────────── Global Hiring Tab (anusha_nexus_global_hiring) ─────────── */
function GlobalHiringTab({ onCampaignStart }: { onCampaignStart: (id: string) => void }) {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [recipientFile, setRecipientFile] = useState<File | null>(null);
  const [activeOnly, setActiveOnly] = useState(true);
  const [start, startState] = useStartGlobalHiringCampaignMutation();

  const handleFile = (file: File | null, expectedType: 'recipients' | 'video') => {
    if (!file) return;
    const name = file.name.toLowerCase();
    const isSheet = name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls');
    const isVideo =
      file.type.startsWith('video/') ||
      name.endsWith('.mp4') ||
      name.endsWith('.3gp') ||
      name.endsWith('.mov') ||
      name.endsWith('.webm');

    if (isSheet) {
      setRecipientFile(file);
      if (expectedType === 'video') toast.success(`Auto-moved ${file.name} to recipients slot`);
      return;
    }
    if (isVideo) {
      setImageFile(file);
      if (expectedType === 'recipients') toast.success(`Auto-moved ${file.name} to video slot`);
      return;
    }
    toast.error(`Unsupported file type: ${file.name}`);
  };

  const handleSend = async () => {
    if (!recipientFile) {
      toast.error('Upload recipients CSV/XLSX first');
      return;
    }
    if (!imageUrl.trim() && !imageFile) {
      toast.error('Provide a header video');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('file', recipientFile);
      if (imageFile) fd.append('headerMediaFile', imageFile);
      if (imageUrl.trim()) fd.append('headerMediaUrl', imageUrl.trim());
      fd.append('activeOnly', String(activeOnly));

      const response = await start(fd).unwrap();
      onCampaignStart(response.campaignId);
      toast.success(response.message || 'Global hiring campaign queued');
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to send campaign');
    }
  };

  return (
    <>
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        Sends Meta template <b>{HIRING_TEMPLATE}</b>. The CSV needs <b>Phone Number</b> +{' '}
        <b>Name</b> (optional) and <b>Active</b> (optional).
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' }, gap: 3 }}>
        <Stack gap={3}>
          <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
            <CardContent sx={{ display: 'grid', gap: 2.2 }}>
              <Stack direction="row" alignItems="center" gap={1.2}>
                <WhatsAppIcon color="primary" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Global Hiring Setup
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Template: {HIRING_TEMPLATE}
                  </Typography>
                </Box>
              </Stack>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                  Step 1 — Recipients
                </Typography>
                <Button
                  component="label"
                  variant="contained"
                  color={recipientFile ? 'success' : 'primary'}
                  fullWidth
                  sx={{ borderRadius: 3, py: 1.6, fontWeight: 800 }}
                >
                  {recipientFile ? `✓ ${recipientFile.name}` : 'Upload recipients CSV/XLSX'}
                  <input
                    hidden
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null, 'recipients')}
                  />
                </Button>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                  Step 2 — Header Video
                </Typography>
                <TextField
                  label="Video URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="e.g. https://.../hiring.mp4"
                  fullWidth
                  sx={fieldStyle}
                />
                <Button
                  component="label"
                  variant={imageFile ? 'contained' : 'outlined'}
                  color={imageFile ? 'success' : 'inherit'}
                  fullWidth
                  sx={{ borderRadius: 3, py: 1.4, mt: 1, fontWeight: 700 }}
                >
                  {imageFile ? `✓ ${imageFile.name}` : 'OR upload video directly'}
                  <input
                    hidden
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null, 'video')}
                  />
                </Button>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={activeOnly}
                    onChange={(e) => setActiveOnly(e.target.checked)}
                  />
                }
                label="Skip rows where Active is false"
              />

              <Button
                size="large"
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
                onClick={handleSend}
                disabled={startState.isLoading}
                sx={{ borderRadius: 3, fontWeight: 900, mt: 1, py: 1.8 }}
              >
                {startState.isLoading ? 'Queuing...' : 'Send Global Hiring blast'}
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                CSV format
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-muted)', mb: 2 }}>
                Only <b>Phone Number</b> is required. <b>Name</b> and <b>Active</b> are optional.
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  borderRadius: 3,
                  overflowX: 'auto',
                  background: 'rgba(0,0,0,0.22)',
                  color: 'var(--color-text)',
                  fontSize: 13,
                }}
              >
                {hiringSampleRows}
              </Box>
            </CardContent>
          </Card>
        </Stack>

        <Stack gap={3}>
          <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                What recipients see
              </Typography>
              <Box
                sx={{ mx: 'auto', maxWidth: 360, borderRadius: 5, background: '#0b141a', p: 1.5 }}
              >
                <Box sx={{ overflow: 'hidden', borderRadius: 4, background: '#202c33' }}>
                  {imageFile ? (
                    <Box
                      component="video"
                      src={URL.createObjectURL(imageFile)}
                      controls
                      muted
                      sx={{
                        width: '100%',
                        aspectRatio: '16/9',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : imageUrl.trim() ? (
                    <Box
                      component="video"
                      src={imageUrl.trim()}
                      controls
                      muted
                      sx={{
                        width: '100%',
                        aspectRatio: '16/9',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        aspectRatio: '16/9',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#8696a0',
                        background: '#111b21',
                      }}
                    >
                      Video header
                    </Box>
                  )}
                  <Box sx={{ p: 2, color: '#e9edef' }}>
                    <Typography sx={{ whiteSpace: 'pre-line', fontSize: 13, lineHeight: 1.5 }}>
                      {`Build Your Global Career with Anusha Nexus LLC!

We are hiring talented graduates for exciting career opportunities with our U.S.-based client. Apply today to start your career journey!`}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </>
  );
}

/* ----------- Existing Template Tab (user-provided Meta-approved template) ----------- */
function ExistingTemplateTab({ onCampaignStart }: { onCampaignStart: (id: string) => void }) {
  const [templateName, setTemplateName] = useState('');
  const [recipientFile, setRecipientFile] = useState<File | null>(null);
  const [headerMediaUrl, setHeaderMediaUrl] = useState('');
  const [headerMediaFile, setHeaderMediaFile] = useState<File | null>(null);
  const [activeOnly, setActiveOnly] = useState(true);
  const [search, setSearch] = useState('');
  const [browsing, setBrowsing] = useState(false);
  const [send, sendState] = useStartWhatsAppCampaignMutation();
  const metaTemplatesQuery = useGetMetaTemplatesQuery(undefined, { skip: !browsing });

  const templates = metaTemplatesQuery.data?.data ?? [];

  const filteredTemplates = useMemo(() => {
    if (!search.trim()) return templates;
    const q = search.toLowerCase();
    return templates.filter(
      (t) => t.name.toLowerCase().includes(q) || t.status.toLowerCase().includes(q),
    );
  }, [templates, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof templates> = {};
    for (const t of filteredTemplates) {
      const key = t.status ?? 'UNKNOWN';
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    }
    return groups;
  }, [filteredTemplates]);

  const statusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    if (status === 'APPROVED') return 'success';
    if (status === 'PENDING' || status === 'IN_APPEAL') return 'warning';
    if (status === 'REJECTED' || status === 'DISABLED') return 'error';
    return 'default';
  };

  const handleRecipientFile = (file: File | null) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls')) {
      setRecipientFile(file);
    } else {
      toast.error(`Unsupported file type: ${file.name}. Use .csv or .xlsx`);
    }
  };

  const handleMediaFile = (file: File | null) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    const isImage =
      file.type.startsWith('image/') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.png');
    const isVideo =
      file.type.startsWith('video/') || name.endsWith('.mp4') || name.endsWith('.mov');
    if (isImage || isVideo) {
      setHeaderMediaFile(file);
    } else {
      toast.error(`Unsupported media type: ${file.name}. Use an image or video file.`);
    }
  };

  const handleSend = async () => {
    if (!templateName.trim()) {
      toast.error('Enter the exact Meta template name');
      return;
    }
    if (!recipientFile) {
      toast.error('Upload recipients CSV/XLSX first');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('templateName', templateName.trim());
      fd.append('file', recipientFile);
      fd.append('activeOnly', String(activeOnly));
      if (headerMediaFile) fd.append('headerMediaFile', headerMediaFile);
      if (headerMediaUrl.trim()) fd.append('headerMediaUrl', headerMediaUrl.trim());
      const response = await send(fd).unwrap();
      onCampaignStart(response.campaignId);
      toast.success(response.message || 'Campaign queued successfully');
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || 'Failed to send campaign');
    }
  };

  return (
    <>
      <Alert severity="success" sx={{ borderRadius: 3 }}>
        Send any <b>Meta-approved template</b> from your Business Suite. Click{' '}
        <b>Browse my Meta templates</b> to see all your templates and click one to select it.
      </Alert>

      {/* ── Template browser ── */}
      <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Your Meta Templates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fetched live from Meta Business Suite. Click any <b>APPROVED</b> template to use it.
              </Typography>
            </Box>
            <Button
              variant={browsing ? 'outlined' : 'contained'}
              startIcon={<RefreshIcon />}
              onClick={() => {
                setBrowsing(true);
                if (browsing) metaTemplatesQuery.refetch();
              }}
              disabled={metaTemplatesQuery.isFetching}
              sx={{ borderRadius: 3, fontWeight: 800 }}
            >
              {metaTemplatesQuery.isFetching
                ? 'Loading…'
                : browsing
                  ? 'Refresh'
                  : 'Browse my Meta templates'}
            </Button>
          </Stack>

          {metaTemplatesQuery.isError && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {(metaTemplatesQuery.error as any)?.data?.message ||
                'Could not fetch templates. Make sure WHATSAPP_WABA_ID is set as an env var on the server (Meta Business Suite → Business Settings → WhatsApp Accounts → Account ID).'}
            </Alert>
          )}

          {browsing &&
            !metaTemplatesQuery.isFetching &&
            templates.length === 0 &&
            !metaTemplatesQuery.isError && (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                No templates found in this WhatsApp Business Account.
              </Alert>
            )}

          {templates.length > 0 && (
            <>
              <TextField
                label="Search templates"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. scan2paper or approved"
                size="small"
                sx={fieldStyle}
              />
              {Object.entries(grouped).map(([status, list]) => (
                <Box key={status}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 900,
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    {status} ({list.length})
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1} mt={0.8}>
                    {list.map((t) => (
                      <Chip
                        key={t.id ?? t.name}
                        label={t.name}
                        color={statusColor(t.status)}
                        variant={templateName === t.name ? 'filled' : 'outlined'}
                        clickable
                        onClick={() => {
                          setTemplateName(t.name);
                          toast.success(`Selected: ${t.name}`);
                        }}
                        sx={{
                          fontWeight: templateName === t.name ? 900 : 600,
                          fontSize: 13,
                          borderRadius: 2,
                          cursor: 'pointer',
                          boxShadow:
                            templateName === t.name ? '0 0 0 2px var(--color-primary)' : 'none',
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Send form ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' }, gap: 3 }}>
        <Stack gap={3}>
          <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
            <CardContent sx={{ display: 'grid', gap: 2.2 }}>
              <Stack direction="row" alignItems="center" gap={1.2}>
                <SendIcon color="success" />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Send Campaign
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Deploy your selected template to recipients in bulk.
                  </Typography>
                </Box>
              </Stack>

              {/* Step 1 — Template name */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, mb: 1, color: 'var(--color-text)' }}
                >
                  Step 1 — Template Name (required)
                </Typography>
                <TextField
                  label="Meta template name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., scan2paper_shop_invitation"
                  fullWidth
                  size="small"
                  sx={fieldStyle}
                  helperText={
                    templateName
                      ? `✓ Using: ${templateName}`
                      : 'Click a template above or type the name manually'
                  }
                />
              </Box>

              {/* Step 2 — Recipients */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, mb: 1, color: 'var(--color-text)' }}
                >
                  Step 2 — Recipients (required)
                </Typography>
                <Button
                  component="label"
                  variant="contained"
                  color={recipientFile ? 'success' : 'primary'}
                  fullWidth
                  sx={{ borderRadius: 3, py: 1.6, fontWeight: 800 }}
                >
                  {recipientFile ? `✓ ${recipientFile.name}` : 'Upload recipients CSV/XLSX'}
                  <input
                    hidden
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleRecipientFile(e.target.files?.[0] ?? null)}
                  />
                </Button>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', mt: 1, color: 'var(--color-text-muted)' }}
                >
                  Required: <b>Phone Number</b>. Optional: <b>Name</b>, <b>Active</b> (true/false),{' '}
                  <b>Var1</b>…<b>VarN</b> for template variables.
                </Typography>
              </Box>

              {/* Step 3 — Header media */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, mb: 1, color: 'var(--color-text)' }}
                >
                  Step 3 — Header Media (optional)
                </Typography>
                <TextField
                  label="Public image/video URL"
                  value={headerMediaUrl}
                  onChange={(e) => setHeaderMediaUrl(e.target.value)}
                  placeholder="https://...s3.../banner.jpg  or  .mp4"
                  fullWidth
                  size="small"
                  sx={fieldStyle}
                  helperText="Leave blank if your template has no header media."
                />
                <Button
                  component="label"
                  variant={headerMediaFile ? 'contained' : 'outlined'}
                  color={headerMediaFile ? 'success' : 'inherit'}
                  fullWidth
                  sx={{ borderRadius: 3, py: 1.4, mt: 1, fontWeight: 700 }}
                >
                  {headerMediaFile ? `✓ ${headerMediaFile.name}` : 'OR upload image/video file'}
                  <input
                    hidden
                    type="file"
                    accept="image/*,video/mp4,video/*"
                    onChange={(e) => handleMediaFile(e.target.files?.[0] ?? null)}
                  />
                </Button>
              </Box>

              {/* Step 4 — Options */}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                  Step 4 — Options
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={activeOnly}
                      onChange={(e) => setActiveOnly(e.target.checked)}
                    />
                  }
                  label="Skip rows where Active is false"
                />
              </Box>

              <Button
                size="large"
                variant="contained"
                color="success"
                startIcon={<SendIcon />}
                fullWidth
                disabled={sendState.isLoading || !templateName.trim() || !recipientFile}
                onClick={handleSend}
                sx={{ borderRadius: 3, py: 1.8, fontWeight: 900, mt: 1 }}
              >
                {sendState.isLoading ? 'Queuing…' : 'Send Campaign'}
              </Button>
            </CardContent>
          </Card>
        </Stack>

        <Stack gap={2}>
          <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                CSV format
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-muted)', mb: 2 }}>
                Only <b>Phone Number</b> is required. Add <b>Var1</b>, <b>Var2</b> … columns to fill
                in your template's {'{{1}}'}, {'{{2}}'} … variables per recipient.
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  borderRadius: 3,
                  overflowX: 'auto',
                  background: 'rgba(0,0,0,0.32)',
                  color: 'var(--color-text)',
                  fontSize: 12,
                }}
              >
                {`Phone Number,Name,Var1,Active\n919876543210,Rahul,Hello World,true\n919812345678,Priya,Special Offer,true`}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4, background: 'var(--color-card-elevated)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                Setup note
              </Typography>
              <Alert severity="info" sx={{ borderRadius: 3, fontSize: 13 }}>
                To enable the template browser, set the env var <b>WHATSAPP_WABA_ID</b> on your
                server.
                <br />
                Find it in Meta Business Suite → Business Settings → WhatsApp Accounts →{' '}
                <b>Account ID</b>.
              </Alert>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </>
  );
}
