import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Alert, Fade, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '@features/auth/api/authApi';
import { showSnackbar } from '@components/snackbarUtils';
import styles from './RegisterPage.module.scss';
import { LoginIllustration } from '@features/auth/components/LoginIllustration';

const RegisterPage: React.FC = () => {
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await register(formData).unwrap();
      showSnackbar({
        message: 'Registration successful! Please login.',
        severity: 'success',
      });
      navigate('/login');
    } catch (err: any) {
      setError(err?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box
      className={`min-h-screen flex items-center justify-center bg-gray-50 p-1 ${styles.registerPage}`}
    >
      <Fade in timeout={600}>
        <Paper elevation={0} className={styles.registerPaper} sx={{ maxWidth: '1000px' }}>
          <Box
            className={`${styles.registerContainer} grid`}
            sx={{ gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}
          >
            {/* LEFT SECTION - FORM */}
            <Box className={styles.formSection}>
              <Box className={styles.headerBox}>
                <Typography className={styles.registerTitle}>Anusha Bazaar</Typography>
                <Typography className={styles.registerSubtitle}>Create your account</Typography>
              </Box>

              {error && (
                <Fade in>
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                </Fade>
              )}

              <Box component="form" onSubmit={handleSubmit} className={styles.form} autoComplete="off">
                <Box className={styles.fieldWrapper}>
                  <Typography className={styles.label}>Email</Typography>
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="off"
                    className={styles.inputField}
                    required
                  />
                </Box>

                <Box className={styles.fieldWrapper}>
                  <Typography className={styles.label}>Password</Typography>
                  <TextField
                    fullWidth
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className={styles.inputField}
                    required
                  />
                </Box>

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={isLoading || !formData.email || !formData.password}
                  className={styles.registerButton}
                >
                  {isLoading ? 'Creating Account...' : 'Register'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2">
                    Already have an account?{' '}
                    <Link href="/login" className={styles.loginLink}>
                      Login here
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* RIGHT SECTION - ILLUSTRATION */}
            <Box className={styles.illustrationWrapper}>
              <Box className={`${styles.circle} ${styles.circleOne}`} />
              <Box className={`${styles.circle} ${styles.circleTwo}`} />
              <Box className={`${styles.circle} ${styles.circleThree}`} />
              <LoginIllustration />
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default RegisterPage;
