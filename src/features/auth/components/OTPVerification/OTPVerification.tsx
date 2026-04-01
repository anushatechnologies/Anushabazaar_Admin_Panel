import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Fade } from '@mui/material';
import styles from './OTPVerification.module.scss';

interface OTPVerificationProps {
  email: string;
  onVerifySuccess: (otp: string) => void;
  resendOtpHandler: () => void;
  onBack: () => void;
  isLoading?: boolean;
  mode?: 'login' | 'forgot';
}

const OTPVerification = ({
  email,
  onVerifySuccess,
  onBack,
  isLoading,
  resendOtpHandler,
  mode = 'login',
}: OTPVerificationProps) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    onVerifySuccess(otp.join(''));
  };

  const handleResendOTP = () => {
    setError('');
    setOtp(['', '', '', '', '', '']);
    setTimeout(() => setError(''), 500);
    resendOtpHandler();
  };

  const handleOtpChange = (index: number, value: string) => {
    value = value.replace(/\D/g, '');
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // 🔥 New: Handle paste event
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasteData = e.clipboardData.getData('Text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      // Move focus to last input after paste
      const lastInput = document.getElementById(`otp-5`);
      lastInput?.focus();
    }
  };

  return (
    <Fade in>
      <Box className={styles.otpVerification}>
        <Box className={styles.header}>
          <Typography className={styles.title}>Verify OTP</Typography>
          <Typography className={styles.subtitle}>
            Enter the 6-digit code sent to {email}
          </Typography>
        </Box>

        {error && (
          <Fade in>
            <Alert severity="error" className={styles.alert}>
              {error}
            </Alert>
          </Fade>
        )}

        <Box component="form" onSubmit={handleVerifyOTP} className={styles.otpForm}>
          <Typography className={styles.otpLabel}>Enter OTP Code</Typography>
          <Box className={styles.otpInputs}>
            {otp.map((digit, index) => (
              <TextField
                key={index}
                id={`otp-${index}`}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={handleOtpPaste} // ✅ Added paste handler
                inputProps={{ maxLength: 1, inputMode: 'numeric' }}
                sx={{
                  width: 50,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: digit ? '#1565c0' : '#ddd',
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: '#1565c0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1565c0',
                    },
                  },
                }}
              />
            ))}
          </Box>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={isLoading || otp.some((d) => !d)}
            className={styles.verifyButton}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>

          <Box className={styles.bottomSection}>
            <Typography className={styles.resendText}>
              Didn’t receive the code?{' '}
              <Box component="span" onClick={handleResendOTP} className={styles.resendLink}>
                Resend OTP
              </Box>
            </Typography>
            {mode && (
              <Button
                size="small"
                onClick={() => {
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                  onBack();
                }}
                className={styles.backButton}
              >
                ← Back to Login
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default OTPVerification;
