import React, { useState } from 'react';
import { Box, Paper, Fade, Alert, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { usePreparePasswordResetMutation } from '@features/auth/api/authApi';
import { sendAdminPasswordResetEmail } from '@/lib/firebase';
import { showSnackbar } from '@components/snackbarUtils';

import ForgotPasswordForm from './compoents/ForgotPasswordForm';

import styles from './ForgotPasswordPage.module.scss';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [preparePasswordReset, { isLoading }] = usePreparePasswordResetMutation();
  const [emailSentTo, setEmailSentTo] = useState('');

  const handleSendResetLink = async (emailValue: string) => {
    try {
      await preparePasswordReset({ email: emailValue }).unwrap();
      await sendAdminPasswordResetEmail(emailValue);

      setEmailSentTo(emailValue);
      showSnackbar({
        message: 'Password reset link sent successfully!',
        severity: 'success',
      });
    } catch (error: any) {
      showSnackbar({
        message: error?.data?.message || error?.message || 'Failed to send reset link',
        severity: 'error',
      });
    }
  };

  return (
    <Box
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 ${styles.forgotPage}`}
    >
      <Fade in timeout={600}>
        <Paper elevation={8} className={styles.forgotPaper}>
          <div className={styles.content}>
            {emailSentTo ? (
              <Box sx={{ maxWidth: 420, mx: 'auto', p: { xs: 2, md: 4 }, textAlign: 'center' }}>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Reset link sent to <strong>{emailSentTo}</strong>
                </Alert>
                <Typography variant="body1" color="text.secondary" mb={3}>
                  Open the Firebase reset email, set your new password on the Firebase page, then
                  come back and log in with the same new password.
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  If you do not see the mail in 1 to 2 minutes, check Spam, Promotions, and All Mail
                  folders for the Firebase reset email.
                </Typography>
                <Typography
                  variant="body2"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: 'var(--highlight-color)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Back to Login
                </Typography>
              </Box>
            ) : (
              <ForgotPasswordForm
                onSubmit={handleSendResetLink}
                onBack={() => navigate('/login')}
                isLoading={isLoading}
              />
            )}
          </div>
        </Paper>
      </Fade>
    </Box>
  );
};

export default ForgotPasswordPage;
