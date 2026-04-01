import React from 'react';
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
import { LoginIllustration } from '@features/auth/components/LoginIllustration';
import OTPVerification from '@features/auth/components/OTPVerification/OTPVerification';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.scss';
import { useLoginLogic } from '@features/auth/utils/useLoginLogic';
import { useAppTheme } from '@contexts/ThemeContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme, isDark } = useAppTheme();

  const {
    step,
    loginData,
    error,
    showPassword,
    isLoginLoading,
    verifyOtpLoading,
    onchangeHandler,
    handleBackToLogin,
    handleLogin,
    handleLoginSuccess,
    handleResendOTP,
    isLoginDisabled,
    setShowPassword,
  } = useLoginLogic();

  // ✅ FIX 2: Direct navigation handlers
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Box
      className={`${styles.loginPage}`}
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 2,
        background: 'transparent' // the parent WithoutAuthLayout has the background
      }}
    >
      <Fade in timeout={600}>
        <Paper
          elevation={0}
          className={styles.loginPaper}
          sx={{ 
            maxWidth: step === 'otp' ? '500px' : '900px',
            width: '100%',
            overflow: 'hidden',
            borderRadius: 4,
            border: `1px solid ${currentTheme.border}`,
            background: isDark ? 'rgba(15,20,35,0.85)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(30px)',
            boxShadow: currentTheme.shadow
          }}
        >
          <Box
            className={`${styles.loginContainer} grid`}
            sx={{ gridTemplateColumns: step === 'otp' ? '1fr' : { xs: '1fr', md: '1fr 1fr' } }}
          >
            {/* LEFT SECTION */}
            <Box className={styles.formSection}>
              {step === 'login' ? (
                <>
                  <Box className={styles.headerBox}>
                    <Typography className={styles.loginTitle}>Anusha Bazaar</Typography>
                    <Typography className={styles.loginSubtitle}>
                      Please login to your account
                    </Typography>
                  </Box>

                  {error && (
                    <Fade in>
                      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                      </Alert>
                    </Fade>
                  )}

                  <Box component="form" onSubmit={handleLogin} autoComplete="off">
                    {/* EMAIL */}
                    <Box className={styles.fieldWrapper}>
                      <Typography className={styles.label}>Email id</Typography>
                      <TextField
                        fullWidth
                        name="email"
                        type="email"
                        value={loginData.email}
                        onChange={onchangeHandler}
                        autoComplete="off"
                        className={styles.inputField}
                      />
                    </Box>

                    {/* PASSWORD */}
                    <Box className={styles.fieldWrapper}>
                      <Typography className={styles.label}>Password</Typography>
                      <TextField
                        fullWidth
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={onchangeHandler}
                        autoComplete="new-password"
                        className={styles.inputField}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword((prev) => !prev)}
                                size="small"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={isLoginDisabled || isLoginLoading}
                      className={styles.loginButton}
                      sx={{
                        background: currentTheme.accentGradient,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '1rem',
                        mt: 2
                      }}
                    >
                      {isLoginLoading ? 'Logging In...' : 'Login'}
                    </Button>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                      <Typography
                        component="span"
                        onClick={handleForgotPassword}
                        sx={{
                          cursor: 'pointer',
                          color: currentTheme.accent,
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          '&:hover': { opacity: 0.8 },
                        }}
                      >
                        Forgot Password?
                      </Typography>
                    </Box>

                    {/* ✅ REGISTER BUTTON */}
                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                      <Typography
                        component="span"
                        onClick={handleRegister}
                        className={styles.forgotLink}
                        sx={{
                          cursor: 'pointer',
                          color: '#28a745',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        Don't have an account? <strong>Register here</strong>
                      </Typography>
                    </Box>
                  </Box>
                </>
              ) : (
                <OTPVerification
                  email={loginData.email}
                  isLoading={verifyOtpLoading}
                  onVerifySuccess={handleLoginSuccess}
                  resendOtpHandler={handleResendOTP}
                  onBack={handleBackToLogin}
                />
              )}
            </Box>

            {/* RIGHT SECTION - Info Panel */}
            {step === 'login' && (
              <Box
                className={`${styles.rightPanel} hidden md:flex`}
                sx={{
                  background: `linear-gradient(45deg, rgba(8,12,26,0.9), rgba(13,21,41,0.8)), url('https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  color: 'white',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: 6,
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute', inset: 0,
                    background: currentTheme.accentGradient,
                    opacity: 0.2
                  }}
                />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.2 }}>
                    Admin<br />Dashboard
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', mb: 4, maxWidth: '80%' }}>
                    Manage your users, orders, and delivery fleet efficiently all from one central unified platform.
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default LoginPage;
