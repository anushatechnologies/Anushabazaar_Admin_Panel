import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  useGetFareSettingsQuery, 
  useUpdateFareSettingsMutation 
} from '../../delivery/api/deliveryApi';
import { Box, Typography, Button, TextField, Stack, CircularProgress, Card, Grid } from '@mui/material';

type Settings = {
  showErrorsAtMobile: boolean;
  imageClassificationRating: number;
  apiVersionId: string;
  bucketUrl: string;
  clearOrderDataAfter: string;
  appRefresh: string;
  currency: string;
};

const DEFAULT_SETTINGS: Settings = {
  showErrorsAtMobile: false,
  imageClassificationRating: 0.74,
  apiVersionId: 'v1',
  bucketUrl: 'uploads/example',
  clearOrderDataAfter: '2 years',
  appRefresh: '60 seconds',
  currency: 'Rupee',
};

export default function App() {
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SETTINGS });
  const savedRef = useRef<Settings>({ ...DEFAULT_SETTINGS });

  // Fare Settings API
  const { data: fareData, isLoading: isFareLoading } = useGetFareSettingsQuery();
  const [updateFare, { isLoading: isUpdatingFare }] = useUpdateFareSettingsMutation();

  const [fareForm, setFareForm] = useState({
    baseFare: 0,
    perKmRate: 0,
    minimumFare: 0,
    maximumFare: 0
  });

  // Sync fare data when loaded
  useState(() => {
    if (fareData?.fareSettings) {
        setFareForm({
            baseFare: fareData.fareSettings.baseFare,
            perKmRate: fareData.fareSettings.perKmRate,
            minimumFare: fareData.fareSettings.minimumFare,
            maximumFare: fareData.fareSettings.maximumFare
        });
    }
  });

  const handleFareSave = async () => {
    try {
        await updateFare(fareForm).unwrap();
        toast.success('Fare settings updated successfully');
    } catch (err) {
        toast.error('Failed to update fare settings');
    }
  };

  const handleChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    savedRef.current = JSON.parse(JSON.stringify(settings));
    setIsEditing(false);
    toast.success('Settings saved!');
  };

  const handleRefresh = () => {
    setSettings(JSON.parse(JSON.stringify(savedRef.current)));
  };

  return (
    <Box className="min-h-screen bg-gray-50 p-8">
      <Stack spacing={4} maxWidth="800px" mx="auto">
        <Typography variant="h4" fontWeight={700}>Platform Settings</Typography>

        <Grid container spacing={4}>
            {/* App Settings Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <Box p={3} borderBottom="1px solid" borderColor="divider">
                    <Typography variant="h6">General Settings</Typography>
                </Box>
                <Box p={3} className="space-y-6">
                    <Row label="Show Errors At Mobile">
                        <Toggle enabled={settings.showErrorsAtMobile} disabled={!isEditing} onChange={(val) => handleChange('showErrorsAtMobile', val)} />
                    </Row>
                    <Row label="Image Classification Rating">
                        <input type="number" step="0.01" value={settings.imageClassificationRating} disabled={!isEditing} onChange={(e) => handleChange('imageClassificationRating', Number(e.target.value))} className="w-24 border rounded px-2 py-1 disabled:bg-gray-100" />
                    </Row>
                    <Row label="Currency">
                        <select value={settings.currency} disabled={!isEditing} onChange={(e) => handleChange('currency', e.target.value)} className="border rounded px-2 py-1 disabled:bg-gray-100">
                            <option value="Rupee">Rupee</option>
                            <option value="Dollar">Dollar</option>
                        </select>
                    </Row>
                    <Box pt={2}>
                        {!isEditing ? (
                        <Button fullWidth variant="outlined" onClick={() => setIsEditing(true)}>Edit General</Button>
                        ) : (
                        <Stack direction="row" spacing={2}>
                            <Button fullWidth variant="contained" onClick={handleSave}>Save</Button>
                            <Button fullWidth variant="text" onClick={handleRefresh}>Cancel</Button>
                        </Stack>
                        )}
                    </Box>
                </Box>
              </Card>
            </Grid>

            {/* Fare Settings Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <Box p={3} borderBottom="1px solid" borderColor="divider">
                    <Typography variant="h6">Delivery Fare Settings</Typography>
                </Box>
                <Box p={3}>
                    {isFareLoading ? <CircularProgress size={24} /> : (
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Base Fare (₹)</Typography>
                                <TextField fullWidth size="small" type="number" value={fareForm.baseFare} onChange={(e) => setFareForm({...fareForm, baseFare: Number(e.target.value)})} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Per KM Rate (₹)</Typography>
                                <TextField fullWidth size="small" type="number" value={fareForm.perKmRate} onChange={(e) => setFareForm({...fareForm, perKmRate: Number(e.target.value)})} />
                            </Box>
                            <Stack direction="row" spacing={2}>
                                <Box flex={1}>
                                    <Typography variant="caption" color="text.secondary">Min Fare</Typography>
                                    <TextField fullWidth size="small" type="number" value={fareForm.minimumFare} onChange={(e) => setFareForm({...fareForm, minimumFare: Number(e.target.value)})} />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" color="text.secondary">Max Fare</Typography>
                                    <TextField fullWidth size="small" type="number" value={fareForm.maximumFare} onChange={(e) => setFareForm({...fareForm, maximumFare: Number(e.target.value)})} />
                                </Box>
                            </Stack>
                            <Button 
                                fullWidth 
                                variant="contained" 
                                color="primary" 
                                onClick={handleFareSave}
                                disabled={isUpdatingFare}
                                sx={{ mt: 2 }}
                            >
                                {isUpdatingFare ? 'Updating...' : 'Update Fare Settings'}
                            </Button>
                        </Stack>
                    )}
                </Box>
              </Card>
            </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}

/* ================= ROW COMPONENT ================= */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-medium text-sm text-gray-700">{label}</span>
      {children}
    </div>
  );
}

/* ================= TOGGLE COMPONENT ================= */

function Toggle({
  enabled,
  disabled,
  onChange,
}: {
  enabled: boolean;
  disabled: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition
        ${enabled ? 'bg-blue-600' : 'bg-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition
          ${enabled ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}
