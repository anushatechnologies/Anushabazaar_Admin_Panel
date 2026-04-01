import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  useGetFareSettingsQuery, 
  useUpdateFareSettingsMutation 
} from '../../delivery/api/deliveryApi';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';

export default function DeliverySetup() {
  const { data, isLoading, refetch } = useGetFareSettingsQuery();
  const [updateFare, { isLoading: isUpdating }] = useUpdateFareSettingsMutation();

  const [formData, setFormData] = useState({
    baseFare: 0,
    perKmRate: 0,
    minimumFare: 0,
    maximumFare: 0
  });

  useEffect(() => {
    if (data?.fareSettings) {
      setFormData({
        baseFare: data.fareSettings.baseFare,
        perKmRate: data.fareSettings.perKmRate,
        minimumFare: data.fareSettings.minimumFare,
        maximumFare: data.fareSettings.maximumFare
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSave = async () => {
    try {
      await updateFare(formData).unwrap();
      toast.success('Fare settings updated successfully');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update fare settings');
    }
  };

  if (isLoading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Delivery Fare Settings</Typography>
      <Typography color="text.secondary" mb={4}>Configure global pricing for delivery services</Typography>

      <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 800 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Base Fare (₹)"
              name="baseFare"
              type="number"
              value={formData.baseFare}
              onChange={handleChange}
              helperText="Initial charge before mileage"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Per Km Rate (₹)"
              name="perKmRate"
              type="number"
              value={formData.perKmRate}
              onChange={handleChange}
              helperText="Charge applied per kilometer"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Minimum Fare (₹)"
              name="minimumFare"
              type="number"
              value={formData.minimumFare}
              onChange={handleChange}
              helperText="Lowest possible delivery charge"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Maximum Fare (₹)"
              name="maximumFare"
              type="number"
              value={formData.maximumFare}
              onChange={handleChange}
              helperText="Highest possible delivery charge"
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button 
                variant="outlined" 
                onClick={() => refetch()}
                disabled={isUpdating}
              >
                Reset
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSave}
                disabled={isUpdating}
              >
                {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Save Settings'}
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {data?.fareSettings?.updatedAt && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Last updated: {new Date(data.fareSettings.updatedAt).toLocaleString()}
          </Typography>
        )}
      </Paper>
      
      <Alert severity="info" sx={{ mt: 4, maxWidth: 800 }}>
        These settings are applied globally to all delivery calculations. Ensure rates are competitive for your region.
      </Alert>
    </Box>
  );
}
