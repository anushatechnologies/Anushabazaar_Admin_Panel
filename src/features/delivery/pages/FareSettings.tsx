import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  Stack,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Savings,
  TrendingUp,
  Route,
  TwoWheeler,
  ElectricScooter,
  DirectionsCar,
  LocalShipping as TruckIcon,
  AttachMoney as MoneyIcon,
  Update as UpdatedIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  useGetFareSettingsQuery,
  useUpdateFareSettingsMutation,
  FareSettings,
} from '../api/deliveryApi';
import { GlassPageHeader, GlassCard, GradientText, GlassBadge } from '../../../components/glassmorphism/GlassComponents';
import { useAppTheme } from '@contexts/ThemeContext';

const defaultFareSettings: FareSettings = {
  id: 1,
  baseFare: 40,
  perKmFare: 5,
  surgeMultiplier: 1.0,
  maxSurgeBonus: 25,
  bikeBaseFare: 35,
  scooterBaseFare: 40,
  autoBaseFare: 50,
  heavyBaseFare: 75,
  km1Fare: 50,
  km5Fare: 80,
  km10Fare: 120,
  km20PlusFare: 200,
};

export default function FareSettingsPage() {
  const { currentTheme } = useAppTheme();
  const { data, isLoading } = useGetFareSettingsQuery();
  const [updateFareSettings, { isLoading: isUpdating }] = useUpdateFareSettingsMutation();
  
  const [settings, setSettings] = useState<FareSettings>(defaultFareSettings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data?.fareSettings) {
      setSettings(data.fareSettings);
    }
  }, [data]);

  const handleChange = (field: keyof FareSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateFareSettings(settings).unwrap();
      toast.success('Fare settings updated successfully!');
      setHasChanges(false);
    } catch (err) {
      toast.error('Failed to update fare settings');
    }
  };

  if (isLoading) return <Box p={4}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: currentTheme.bg, minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassPageHeader>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                <GradientText>Pricing Strategy</GradientText>
              </Typography>
              <Typography color="text.secondary">Global delivery fare configuration and vehicle multipliers</Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!hasChanges || isUpdating}
              startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <UpdatedIcon />}
              sx={{ 
                borderRadius: 3, px: 4, py: 1.5, fontWeight: 800,
                background: currentTheme.accentGradient,
                boxShadow: `0 8px 25px ${currentTheme.accent}40`,
                '&:disabled': { opacity: 0.5 }
              }}
            >
              Update Settings
            </Button>
          </Box>
        </GlassPageHeader>
      </motion.div>

      <Grid container spacing={3}>
        {/* Core Pricing */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <GlassCard>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Savings color="primary" /> Base & KM Rates
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FareInput label="Base Fare" value={settings.baseFare} onChange={(v) => handleChange('baseFare', v)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FareInput label="Rate Per KM" value={settings.perKmFare} onChange={(v) => handleChange('perKmFare', v)} />
                </Grid>
              </Grid>
            </GlassCard>

            <GlassCard>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Route color="secondary" /> Distance Slabs (Fixed)
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 6, sm: 3 }}><FareInput label="Up to 1KM" value={settings.km1Fare} onChange={(v) => handleChange('km1Fare', v)} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><FareInput label="Up to 5KM" value={settings.km5Fare} onChange={(v) => handleChange('km5Fare', v)} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><FareInput label="Up to 10KM" value={settings.km10Fare} onChange={(v) => handleChange('km10Fare', v)} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><FareInput label="20KM+" value={settings.km20PlusFare} onChange={(v) => handleChange('km20PlusFare', v)} /></Grid>
              </Grid>
            </GlassCard>

            <GlassCard>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TwoWheeler color="success" /> Vehicle Multipliers
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><FareInput label="Bike" value={settings.bikeBaseFare} onChange={(v) => handleChange('bikeBaseFare', v)} icon={<TwoWheeler />} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><FareInput label="Scooter" value={settings.scooterBaseFare} onChange={(v) => handleChange('scooterBaseFare', v)} icon={<ElectricScooter />} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><FareInput label="Auto" value={settings.autoBaseFare} onChange={(v) => handleChange('autoBaseFare', v)} icon={<DirectionsCar />} /></Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}><FareInput label="Heavy" value={settings.heavyBaseFare} onChange={(v) => handleChange('heavyBaseFare', v)} icon={<TruckIcon />} /></Grid>
              </Grid>
            </GlassCard>
          </Stack>
        </Grid>

        {/* Surge Pricing Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ height: '100%', background: `linear-gradient(135deg, ${currentTheme.cardBg} 0%, ${currentTheme.accent}10 100%)` }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp color="error" /> Surge Settings
            </Typography>
            <Stack spacing={4}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Surge Multiplier</Typography>
                <TextField 
                  fullWidth type="number"
                  inputProps={{ step: '0.1' }}
                  value={settings.surgeMultiplier}
                  onChange={(e) => handleChange('surgeMultiplier', parseFloat(e.target.value) || 1)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><TrendingUp fontSize="small" /></InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.paper' } }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Max Surge Bonus (₹)</Typography>
                <TextField 
                  fullWidth type="number"
                  value={settings.maxSurgeBonus}
                  onChange={(e) => handleChange('maxSurgeBonus', parseFloat(e.target.value) || 0)}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.paper' } }}
                />
              </Box>
              
              <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.05)', border: '1px dashed grey' }}>
                <Typography variant="caption" color="text.secondary" display="block">Example Calculation</Typography>
                <Typography variant="body2" sx={{ my: 1 }}>Base (40) * Surge (1.5) = 60</Typography>
                <Typography variant="caption" color="text.secondary">Admin bonus added to every delivery during peak hours.</Typography>
              </Paper>
            </Stack>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}

function FareInput({ label, value, onChange, icon }: any) {
  const { currentTheme } = useAppTheme();
  return (
    <Box>
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>{label}</Typography>
      <TextField
        fullWidth
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        InputProps={{
          startAdornment: <InputAdornment position="start"><Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>₹</Typography></InputAdornment>
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            bgcolor: 'background.paper',
            transition: '0.2s',
            '&:hover': { bgcolor: `${currentTheme.border}10` }
          }
        }}
      />
    </Box>
  );
}
