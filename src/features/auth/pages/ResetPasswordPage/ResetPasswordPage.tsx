import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import {
  confirmPasswordReset,
  signInWithEmailAndPassword,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@app/hooks';
import { setCredentials } from '@features/auth/authSlice';
import { useSyncFirebasePasswordMutation } from '@features/auth/api/authApi';
import { showSnackbar } from '@components/snackbarUtils';
import { firebaseAuth } from '@/lib/firebase';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pageError, setPageError] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [syncFirebasePassword] = useSyncFirebasePasswordMutation();

  const oobCode = useMemo(() => searchParams.get('oobCode') || '', [searchParams]);
  const mode = useMemo(() => searchParams.get('mode') || '', [searchParams]);

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode || mode !== 'resetPassword') {
        setPageError('This reset link is invalid. Please request a new one.');
        setIsVerifying(false);
        return;
      }

      try {
        const resolvedEmail = await verifyPasswordResetCode(firebaseAuth, oobCode);
        setEmail(resolvedEmail);
      } catch (error: any) {
        setPageError(error?.message || 'This reset link has expired. Please request a new one.');
      } finally {
        setIsVerifying(false);
      }
    };

    void verifyCode();
  }, [mode, oobCode]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      setPageError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPageError('Passwords do not match.');
      return;
    }
    if (!email) {
      setPageError('Unable to resolve the admin email for this reset link.');
      return;
    }

    setPageError('');
    setIsSubmitting(true);

    try {
      await confirmPasswordReset(firebaseAuth, oobCode, newPassword);
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, newPassword);
      const idToken = await credential.user.getIdToken();
      const result = await syncFirebasePassword({ idToken, newPassword }).unwrap();

      dispatch(
        setCredentials({
          token: result.accessToken || result.token,
          refreshToken: result.refreshToken,
          user: {
            id: result.id,
            email: result.email,
            role: result.role,
            name: result.name,
            mustChangePassword: result.mustChangePassword,
          },
        }),
      );

      showSnackbar({ message: 'Password updated successfully!', severity: 'success' });
      navigate('/', { replace: true });
    } catch (error: any) {
      setPageError(error?.data?.message || error?.message || 'Failed to finish password reset.');
    } finally {
      setIsSubmitting(false);
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
        background: 'linear-gradient(135deg, #f5f7ff 0%, #eef6ff 100%)',
      }}
    >
      <Paper sx={{ width: '100%', maxWidth: 460, p: 4, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={800} mb={1}>
          Set Your Admin Password
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Finish the Firebase reset flow and we will sync the new password back into the admin
          panel.
        </Typography>

        {isVerifying ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {pageError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {pageError}
              </Alert>
            )}

            {email && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Resetting password for <strong>{email}</strong>
              </Alert>
            )}

            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting || !email}
              sx={{ py: 1.4, fontWeight: 700, textTransform: 'none' }}
            >
              {isSubmitting ? 'Saving Password...' : 'Save Password'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;
