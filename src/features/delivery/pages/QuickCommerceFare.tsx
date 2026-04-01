import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Skeleton,
  Alert,
  InputAdornment,
  Stack,
  Paper,
  CardContent,
} from '@mui/material';
import {
  TwoWheeler,
  Bolt,
  Info,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  useGetFareSettingsQuery,
  useUpdateFareSettingsMutation,
  FareSettings,
} from '../api/deliveryApi';
import { GlassPageHeader, GlassCard, GradientText } from '../../../components/glassmorphism/GlassComponents';
import { useAppTheme } from '@contexts/ThemeContext';

// Simple Zepto-style bike delivery fare
interface SimpleBikeFare {
  baseFare: number;     // Starting price (e.g., ₹20)
  perKmRate: number;    // Price per km after base (e.g., ₹8/km)
  minFare: number;      // Minimum charge (e.g., ₹25)
}

const defaultFare: SimpleBikeFare = {
  baseFare: 20,
  perKmRate: 8,
  minFare: 25,
};

export default function QuickCommerceFareSettings() {
  const { currentTheme, isDark } = useAppTheme();
  const { data, isLoading, error } = useGetFareSettingsQuery();
  const [updateFareSettings, { isLoading: isUpdating }] = useUpdateFareSettingsMutation();
  
  const [fare, setFare] = useState<SimpleBikeFare>(defaultFare);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data?.fareSettings) {
      setFare({
        baseFare: data.fareSettings.bikeBaseFare || 20,
        perKmRate: data.fareSettings.perKmFare || 8,
        minFare: data.fareSettings.baseFare || 25,
      });
    }
  }, [data]);

  const handleChange = (field: keyof SimpleBikeFare, value: number) => {
    setFare((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Convert to FareSettings format for API
      const fareSettings: FareSettings = {
        id: data?.fareSettings?.id || 1,
        baseFare: fare.minFare,
        perKmFare: fare.perKmRate,
        surgeMultiplier: 1.0,
        maxSurgeBonus: 0,
        bikeBaseFare: fare.baseFare,
        scooterBaseFare: fare.baseFare, // Same as bike for simplicity
        autoBaseFare: fare.baseFare + 10, // Slightly higher for auto
        heavyBaseFare: fare.baseFare + 20, // Higher for heavy vehicles
        km1Fare: fare.baseFare,
        km5Fare: fare.baseFare + (fare.perKmRate * 4),
        km10Fare: fare.baseFare + (fare.perKmRate * 9),
        km20PlusFare: fare.baseFare + (fare.perKmRate * 19),
      };
      
      await updateFareSettings(fareSettings).unwrap();
      toast.success('Bike delivery fare saved!');
      setHasChanges(false);
    } catch (err) {
      toast.error('Failed to save. Try again.');
    }
  };

  const handleReset = () => {
    if (data?.fareSettings) {
      setFare({
        baseFare: data.fareSettings.bikeBaseFare || 20,
        perKmRate: data.fareSettings.perKmFare || 8,
        minFare: data.fareSettings.baseFare || 25,
      });
      setHasChanges(false);
    }
  };

  // Simple fare calculation
  const calculateFare = (distance: number) => {
    const totalFare = fare.baseFare + (distance * fare.perKmRate);
    return Math.max(fare.minFare, totalFare);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, background: currentTheme.bg, minHeight: '100vh' }}>
        <Skeleton variant="rectangular" height={120} sx={{ mb: 3, borderRadius: 3 }} />
        <Grid container spacing={3}>
          {[...Array(3)].map((_, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, background: currentTheme.bg, minHeight: '100vh' }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Failed to load settings. Please refresh.
        </Alert>
      </Box>
    );
  }

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
          title="Quick Commerce Fare"
          subtitle="Simple bike delivery pricing like Zepto"
          icon={<Bolt sx={{ fontSize: 40, color: currentTheme.accent }} />}
        />
      </motion.div>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              background: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
              color: currentTheme.text,
              border: `1px solid ${currentTheme.border}`,
            }}
          >
            You have unsaved changes. Click "Save" to apply.
          </Alert>
        </motion.div>
      )}

      <Grid container spacing={3}>
        {/* Pricing Configuration */}
        <Grid size={{ xs: 12, md: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <GlassCard>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <TwoWheeler sx={{ color: currentTheme.accent }} />
                  <Typography variant="h6" fontWeight={600} sx={{ color: currentTheme.text }}>
                    Bike Delivery Pricing
                  </Typography>
                </Stack>

                <Stack spacing={4}>
                  <Box>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1, color: currentTheme.text }}>
                      Base Fare (Starting Price)
                    </Typography>
                    <TextField
                      type="number"
                      fullWidth
                      size="small"
                      value={fare.baseFare}
                      onChange={(e) => handleChange('baseFare', parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start" sx={{ color: currentTheme.accent }}>₹</InputAdornment>,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          background: currentTheme.inputBg,
                          color: currentTheme.text,
                          '& fieldset': {
                            borderColor: currentTheme.border,
                          },
                          '&:hover fieldset': {
                            borderColor: currentTheme.accent,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: currentTheme.accent,
                          },
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: currentTheme.textSecondary, mt: 0.5, display: 'block' }}>
                      Fixed starting price for any delivery
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1, color: currentTheme.text }}>
                      Per Kilometer Rate
                    </Typography>
                    <TextField
                      type="number"
                      fullWidth
                      size="small"
                      value={fare.perKmRate}
                      onChange={(e) => handleChange('perKmRate', parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start" sx={{ color: currentTheme.accent }}>₹</InputAdornment>,
                        endAdornment: <InputAdornment position="end" sx={{ color: currentTheme.textSecondary }}>/km</InputAdornment>,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          background: currentTheme.inputBg,
                          color: currentTheme.text,
                          '& fieldset': {
                            borderColor: currentTheme.border,
                          },
                          '&:hover fieldset': {
                            borderColor: currentTheme.accent,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: currentTheme.accent,
                          },
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: currentTheme.textSecondary, mt: 0.5, display: 'block' }}>
                      Additional charge per kilometer after base fare
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1, color: currentTheme.text }}>
                      Minimum Fare
                    </Typography>
                    <TextField
                      type="number"
                      fullWidth
                      size="small"
                      value={fare.minFare}
                      onChange={(e) => handleChange('minFare', parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start" sx={{ color: currentTheme.accent }}>₹</InputAdornment>,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          background: currentTheme.inputBg,
                          color: currentTheme.text,
                          '& fieldset': {
                            borderColor: currentTheme.border,
                          },
                          '&:hover fieldset': {
                            borderColor: currentTheme.accent,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: currentTheme.accent,
                          },
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: currentTheme.textSecondary, mt: 0.5, display: 'block' }}>
                      Minimum charge for any delivery (even short distances)
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    disabled={!hasChanges || isUpdating}
                    sx={{ 
                      borderRadius: 2, 
                      textTransform: 'none',
                      borderColor: currentTheme.border,
                      color: currentTheme.text,
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={!hasChanges || isUpdating}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      background: currentTheme.accentGradient,
                      boxShadow: isDark
                        ? '0 4px 15px rgba(0, 245, 255, 0.4)'
                        : currentTheme.shadow,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: isDark
                          ? '0 6px 20px rgba(0, 245, 255, 0.6)'
                          : currentTheme.hoverShadow,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Stack>
              </CardContent>
            </GlassCard>
          </motion.div>
        </Grid>

        {/* Fare Examples */}
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <GlassCard>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <Info sx={{ color: currentTheme.accent }} />
                  <Typography variant="h6" fontWeight={600} sx={{ color: currentTheme.text }}>
                    Fare Examples
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  {[
                    { distance: 1, label: '1 km' },
                    { distance: 3, label: '3 km' },
                    { distance: 5, label: '5 km' },
                    { distance: 10, label: '10 km' },
                  ].map((example) => (
                    <Box
                      key={example.distance}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: isDark ? 'rgba(0, 245, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        border: `1px solid ${currentTheme.border}`,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" sx={{ color: currentTheme.text }}>
                          {example.label}
                        </Typography>
                        <Typography variant="h6" fontWeight={600} sx={{ color: currentTheme.accent }}>
                          ₹{calculateFare(example.distance)}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>

                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 3,
                    background: isDark ? 'rgba(0, 245, 255, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                    color: currentTheme.text,
                    border: `1px solid ${currentTheme.border}`,
                  }}
                >
                  <Typography variant="caption" sx={{ color: currentTheme.text }}>
                    <strong>Formula:</strong> Base Fare + (Distance × Per km Rate) = Total Fare<br/>
                    <strong>Minimum:</strong> ₹{fare.minFare} even for short distances
                  </Typography>
                </Alert>
              </CardContent>
            </GlassCard>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
