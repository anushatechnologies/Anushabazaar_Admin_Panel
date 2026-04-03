import { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  useGetFareSettingsQuery, 
  useUpdateFareSettingsMutation 
} from '../../delivery/api/deliveryApi';
import { Box, Typography, Button, TextField, Stack, CircularProgress, Card, Grid } from '@mui/material';

export default function App() {
  // Fare Settings API
  const { data: fareData, isLoading: isFareLoading } = useGetFareSettingsQuery();
  const [updateFare, { isLoading: isUpdatingFare }] = useUpdateFareSettingsMutation();

  const [fareForm, setFareForm] = useState({
    baseFare: 0,
    perKmFare: 0,
    surgeMultiplier: 1.0,
    maxSurgeBonus: 0
  });

  // Sync fare data when loaded
  useEffect(() => {
    if (fareData?.fareSettings) {
        setFareForm({
            baseFare: fareData.fareSettings.baseFare,
            perKmFare: fareData.fareSettings.perKmFare,
            surgeMultiplier: fareData.fareSettings.surgeMultiplier,
            maxSurgeBonus: fareData.fareSettings.maxSurgeBonus
        });
    }
  }, [fareData]);

  const handleFareSave = async () => {
    try {
        await updateFare(fareForm).unwrap();
        toast.success('Fare settings updated successfully');
    } catch (err) {
        toast.error('Failed to update fare settings');
    }
  };

  return (
    <Box className="min-h-screen bg-gray-50 p-8">
      <Stack spacing={4} maxWidth="600px" mx="auto">
        <Typography variant="h4" fontWeight={700} textAlign="center">Settings</Typography>

        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Box p={3} borderBottom="1px solid" borderColor="divider">
              <Typography variant="h6">Delivery Fare Settings</Typography>
          </Box>
          <Box p={3}>
              {isFareLoading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress size={32} />
                  </Box>
              ) : (
                  <Stack spacing={3}>
                      <Box>
                          <Typography variant="caption" color="text.secondary">Base Fare (₹)</Typography>
                          <TextField fullWidth size="small" type="number" value={fareForm.baseFare} onChange={(e) => setFareForm({...fareForm, baseFare: Number(e.target.value)})} />
                      </Box>
                      <Box>
                          <Typography variant="caption" color="text.secondary">Per KM Fare (₹)</Typography>
                          <TextField fullWidth size="small" type="number" value={fareForm.perKmFare} onChange={(e) => setFareForm({...fareForm, perKmFare: Number(e.target.value)})} />
                      </Box>
                      <Stack direction="row" spacing={2}>
                          <Box flex={1}>
                              <Typography variant="caption" color="text.secondary">Surge Multiplier</Typography>
                              <TextField fullWidth size="small" type="number" inputProps={{ step: 0.1 }} value={fareForm.surgeMultiplier} onChange={(e) => setFareForm({...fareForm, surgeMultiplier: Number(e.target.value)})} />
                          </Box>
                          <Box flex={1}>
                              <Typography variant="caption" color="text.secondary">Max Surge Bonus</Typography>
                              <TextField fullWidth size="small" type="number" value={fareForm.maxSurgeBonus} onChange={(e) => setFareForm({...fareForm, maxSurgeBonus: Number(e.target.value)})} />
                          </Box>
                      </Stack>
                      <Button 
                          fullWidth 
                          variant="contained" 
                          color="primary" 
                          onClick={handleFareSave}
                          disabled={isUpdatingFare}
                          sx={{ 
                            mt: 2,
                            borderRadius: 2,
                            py: 1.2,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                          }}
                      >
                          {isUpdatingFare ? <CircularProgress size={20} color="inherit" /> : 'Update Fare Settings'}
                      </Button>
                  </Stack>
              )}
          </Box>
        </Card>
      </Stack>
    </Box>
  );
}
