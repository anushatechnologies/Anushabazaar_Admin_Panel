import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Fade,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { useChangePasswordMutation } from '@features/auth/api/authApi';
import { clearMustChangePassword } from '@features/auth/authSlice';
import { showSnackbar } from '@components/snackbarUtils';
import { useAppTheme } from '@contexts/ThemeContext';

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentTheme } = useAppTheme();
  const user = useAppSelector((s) => s.auth.user);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (!user?.email) {
      setError('Session expired. Please log in again.');
      return;
    }

    try {
      await changePassword({
        email: user.email,
        currentPassword,
        newPassword,
      }).unwrap();

      dispatch(clearMustChangePassword());
      showSnackbar({ message: 'Password changed successfully!', severity: 'success' });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'var(--color-bg)',
      }}
    >
      <Fade in timeout={500}>
        <Paper
          elevation={0}
          sx={{
            maxWidth: 440,
            width: '100%',
            p: 5,
            borderRadius: 4,
            border: `1px solid ${currentTheme.border}`,
            background: 'var(--color-surface)',
          }}
        >
          <Typography variant="h5" fontWeight={800} mb={1}>
            Set Your Password
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Your account still requires a password update. Please set a new permanent password to
            continue.
          </Typography>

          {error && (
            <Fade in>
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            </Fade>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="body2" fontWeight={600} mb={0.5}>
              Current Password
            </Typography>
            <TextField
              fullWidth
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowCurrent((p) => !p)}>
                      {showCurrent ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Typography variant="body2" fontWeight={600} mb={0.5}>
              New Password
            </Typography>
            <TextField
              fullWidth
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Minimum 8 characters"
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowNew((p) => !p)}>
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Typography variant="body2" fontWeight={600} mb={0.5}>
              Confirm New Password
            </Typography>
            <TextField
              fullWidth
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
              sx={{
                background: currentTheme.accentGradient,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              {isLoading ? 'Saving...' : 'Set New Password & Continue'}
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default ChangePasswordPage;
