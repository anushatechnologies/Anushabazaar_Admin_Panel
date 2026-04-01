import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';

interface Props {
  email: string;
  onSubmit: (otp: string, newPassword: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

const ResetPasswordForm: React.FC<Props> = ({ email, onSubmit, onBack, isLoading }) => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || !newPassword || newPassword.length < 6) {
      setError('Please enter valid 6-digit OTP and password (min 6 chars)');
      return;
    }
    setError('');
    onSubmit(otp, newPassword);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
      <IconButton onClick={onBack} sx={{ mb: 2 }}>
        <ArrowBack />
      </IconButton>

      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: 'text.primary', mb: 2, textAlign: 'center' }}
      >
        Reset Password
      </Typography>

      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center' }}>
        Enter OTP sent to <strong>{email}</strong> and new password.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        autoComplete="off"
      >
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 1 }}>OTP (6 digits)</Typography>
          <TextField
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            inputProps={{ maxLength: 6 }}
            disabled={isLoading}
            autoComplete="off"
            sx={{
              '& .MuiInputBase-input': {
                textAlign: 'center',
                fontSize: '1.5rem',
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
              },
            }}
          />
        </Box>

        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 1 }}>New Password</Typography>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="new-password"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={isLoading || otp.length !== 6 || newPassword.length < 6}
          sx={{
            py: 1.5,
            borderRadius: 3,
            textTransform: 'none',
            fontSize: 16,
            fontWeight: 600,
            bgcolor: 'success.main',
            '&:hover': { bgcolor: 'success.dark' },
          }}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? 'Reset Password...' : 'Reset Password'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' },
            }}
            onClick={onBack}
          >
            ← Back to email
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPasswordForm;
