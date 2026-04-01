import React, { useState } from 'react';
import { Box, Paper, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSendOtpMutation, useVerifyOtpMutation } from '@features/auth/api/authApi';
import { showSnackbar } from '@components/snackbarUtils';

import ForgotPasswordForm from './compoents/ForgotPasswordForm';
import ResetPassword from './compoents/ResetPasswordForm';

import styles from './ForgotPasswordPage.module.scss';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [sendOtp, { isLoading: sendOtpLoading }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifyOtpLoading }] = useVerifyOtpMutation();

  const [step, setStep] = useState<'email' | 'reset'>('email');

  // STEP 1: Send OTP
  const handleSendOtp = async (emailValue: string) => {
    try {
      await sendOtp({ email: emailValue }).unwrap();

      // ✅ store email
      localStorage.setItem('resetEmail', emailValue);

      setStep('reset');

      showSnackbar({
        message: 'OTP sent to your email!',
        severity: 'success',
      });
    } catch (error: any) {
      showSnackbar({
        message: error?.data?.message || 'Failed to send OTP',
        severity: 'error',
      });
    }
  };

  // STEP 2: Verify OTP + Reset Password
  const handleResetPassword = async (otp: string, newPassword: string) => {
    try {
      const email = localStorage.getItem('resetEmail') || '';

      await verifyOtp({ email, otp, newPassword }).unwrap();

      localStorage.removeItem('resetEmail');

      showSnackbar({
        message: 'Password reset successfully!',
        severity: 'success',
      });

      navigate('/login');
    } catch (error: any) {
      showSnackbar({
        message: error?.data?.message || 'Password reset failed',
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
            {step === 'email' ? (
              <ForgotPasswordForm
                onSubmit={handleSendOtp}
                onBack={() => navigate('/login')}
                isLoading={sendOtpLoading}
              />
            ) : (
              <ResetPassword
                onSubmit={handleResetPassword}
                onBackToLogin={() => navigate('/login')}
                isLoading={verifyOtpLoading}
              />
            )}
          </div>
        </Paper>
      </Fade>
    </Box>
  );
};

export default ForgotPasswordPage;
