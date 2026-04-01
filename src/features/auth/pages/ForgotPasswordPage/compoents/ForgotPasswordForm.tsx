import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { showSnackbar } from '@components/snackbarUtils';

interface Props {
  onSubmit: (email: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

const ForgotPasswordForm: React.FC<Props> = ({ onSubmit, onBack, isLoading }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showSnackbar({
        message: 'Please enter a valid email address!',
        severity: 'error',
      });
      return;
    }

    onSubmit(email);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text-color)', mb: 1 }}>
          Forgot Password?
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Enter your registered email address to receive an OTP code to reset your password.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 14, color: 'var(--text-color)', mb: 1, fontWeight: 500 }}>
            Email Address
          </Typography>
          <TextField
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'var(--card-bg)',
                borderRadius: 2,
              },
            }}
          />
        </Box>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={isLoading || !email}
          sx={{
            py: 1.5,
            mb: 2,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          {isLoading ? 'Sending OTP...' : 'Send OTP Code'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography
            variant="body2"
            onClick={onBack}
            sx={{
              color: 'var(--highlight-color)',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            ← Back to Login
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPasswordForm;
