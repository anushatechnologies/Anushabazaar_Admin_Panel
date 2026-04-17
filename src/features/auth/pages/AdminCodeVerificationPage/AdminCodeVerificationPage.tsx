import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Fade,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { LockClock, Security } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useVerifyAdminCodeMutation } from '@features/auth/api/authApi';
import {
  clearAdminAccessChallenge,
  getStoredAdminAccessChallenge,
} from '@features/auth/authCookies';
import { useAppDispatch } from '@app/hooks';
import { setCredentials } from '@features/auth/authSlice';
import { showSnackbar } from '@components/snackbarUtils';
import { useAppTheme } from '@contexts/ThemeContext';
import styles from './AdminCodeVerificationPage.module.scss';

const OTP_LENGTH = 6;

const AdminCodeVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentTheme, isDark } = useAppTheme();
  const [verifyAdminCode, { isLoading }] = useVerifyAdminCodeMutation();

  const challenge = useMemo(() => getStoredAdminAccessChallenge(), []);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [statusText, setStatusText] = useState('Waiting for the full 6-digit access code');
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!challenge) {
      navigate('/login', { replace: true });
    }
  }, [challenge, navigate]);

  useEffect(() => {
    if (!challenge) {
      return;
    }

    const code = digits.join('');
    if (code.length !== OTP_LENGTH || isLoading || isVerified) {
      return;
    }

    const verify = async () => {
      try {
        setError('');
        setStatusText('Verifying your admin access code...');
        const result = await verifyAdminCode({
          challengeToken: challenge.challengeToken,
          code,
        }).unwrap();

        clearAdminAccessChallenge();
        setIsVerified(true);
        setStatusText('Access granted. Opening your admin dashboard...');

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

        showSnackbar({ message: 'Admin access verified successfully!', severity: 'success' });

        window.setTimeout(() => {
          if (result.mustChangePassword) {
            navigate('/change-password', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 450);
      } catch (verifyError: any) {
        setError(
          verifyError?.data?.message || verifyError?.message || 'Invalid admin access code.',
        );
        setStatusText('Verification failed. Enter the 6-digit code again.');
        setDigits(Array(OTP_LENGTH).fill(''));
        window.setTimeout(() => inputRefs.current[0]?.focus(), 0);
      }
    };

    void verify();
  }, [challenge, digits, dispatch, isLoading, isVerified, navigate, verifyAdminCode]);

  const focusIndex = (index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  const handleDigitChange = (index: number, value: string) => {
    const numeric = value.replace(/\D/g, '');
    if (!numeric) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      setError('');
      setStatusText('Waiting for the full 6-digit access code');
      return;
    }

    const next = [...digits];
    next[index] = numeric[numeric.length - 1];
    setDigits(next);
    setError('');
    if (index < OTP_LENGTH - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      focusIndex(index - 1);
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      focusIndex(index - 1);
    }
    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusIndex(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH)
      .split('');

    if (!pastedDigits.length) {
      return;
    }

    const next = Array(OTP_LENGTH).fill('');
    pastedDigits.forEach((digit, index) => {
      next[index] = digit;
    });
    setDigits(next);
    setError('');

    const nextIndex = Math.min(pastedDigits.length, OTP_LENGTH - 1);
    window.setTimeout(() => focusIndex(nextIndex), 0);
  };

  if (!challenge) {
    return null;
  }

  return (
    <Box className={styles.verificationPage} sx={{ background: 'transparent' }}>
      <Fade in timeout={500}>
        <Paper
          elevation={0}
          className={styles.verificationPaper}
          sx={{
            border: `1px solid ${currentTheme.border}`,
            background: isDark ? 'rgba(15,20,35,0.88)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(26px)',
            boxShadow: currentTheme.shadow,
          }}
        >
          <Box
            className={styles.verificationContainer}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
            }}
          >
            <Box
              className={styles.leftPanel}
              sx={{
                background: isDark ? 'rgba(16,24,39,0.72)' : 'rgba(232,240,247,0.85)',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Chip
                  icon={<LockClock />}
                  label="Second Step Security"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 2, fontWeight: 700 }}
                />
                <Typography variant="h4" fontWeight={800} mb={1}>
                  Enter Admin Access Code
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {challenge.name || challenge.email} must enter the 6-digit code set by the super
                  admin before the dashboard opens.
                </Typography>
              </Box>

              <Box onPaste={handlePaste}>
                <Box className={styles.otpRow}>
                  {digits.map((digit, index) => (
                    <TextField
                      key={index}
                      value={digit}
                      inputRef={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      onChange={(event) => handleDigitChange(index, event.target.value)}
                      onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) =>
                        handleKeyDown(index, event)
                      }
                      className={styles.otpInput}
                      inputProps={{
                        maxLength: 1,
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                        autoComplete: 'one-time-code',
                      }}
                      disabled={isLoading || isVerified}
                    />
                  ))}
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" className={styles.helperText}>
                No submit button needed. Verification starts automatically after the 6th digit.
              </Typography>

              <Box
                sx={{
                  mt: 3,
                  minHeight: 72,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isLoading ? (
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <CircularProgress size={22} />
                    <Typography variant="body2">{statusText}</Typography>
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ width: '100%', borderRadius: 3 }}>
                    {error}
                  </Alert>
                ) : isVerified ? (
                  <Alert severity="success" sx={{ width: '100%', borderRadius: 3 }}>
                    {statusText}
                  </Alert>
                ) : (
                  <Alert severity="info" sx={{ width: '100%', borderRadius: 3 }}>
                    {statusText}
                  </Alert>
                )}
              </Box>

              <Typography
                variant="body2"
                sx={{
                  mt: 2.5,
                  textAlign: 'center',
                  color: currentTheme.accent,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                onClick={() => {
                  clearAdminAccessChallenge();
                  navigate('/login', { replace: true });
                }}
              >
                Back to Login
              </Typography>
            </Box>

            <Box
              className={styles.rightPanel}
              sx={{
                background:
                  "linear-gradient(55deg, rgba(8,12,26,0.94), rgba(22,28,61,0.88)), url('https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1400&q=80')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: currentTheme.accentGradient,
                  opacity: 0.18,
                }}
              />
              <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 360 }}>
                <Security sx={{ fontSize: 54, mb: 2 }} />
                <Typography variant="h3" fontWeight={800} mb={2} lineHeight={1.15}>
                  Secure
                  <br />
                  Admin Entry
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.82)', mb: 3 }}>
                  Password checks who you are. The admin access code confirms the super admin has
                  allowed this panel login.
                </Typography>
                <Chip
                  label="Challenge expires in 10 minutes"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.28)',
                    background: 'rgba(255,255,255,0.08)',
                  }}
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default AdminCodeVerificationPage;
