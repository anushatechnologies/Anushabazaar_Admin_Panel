import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useLoginMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from '@features/auth/api/authApi';
import { useAppDispatch } from '@app/hooks';
import { setCredentials } from '@features/auth/authSlice';
import { showSnackbar } from '@components/snackbarUtils';

export const useLoginLogic = () => {
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [sendOtp, { isLoading: sendOtpLoading }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifyOtpLoading }] = useVerifyOtpMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onchangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError('');
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(loginData).unwrap();

      console.log('✅ Login API Response:', result);
      console.log('✅ Token:', result.token);
      console.log('✅ User Info:', {
        id: result.id,
        email: result.email,
        role: result.role,
      });

      dispatch(
        setCredentials({
          token: result.token,
          user: { id: result.id, email: result.email, role: result.role },
        }),
      );

      showSnackbar({
        message: 'Login successful!',
        severity: 'success',
      });

      navigate('/');
    } catch (err: any) {
      console.log('❌ Login Error:', err);

      if (err?.data?.status_code === 401) {
        console.log('⚠️ Password expired - sending OTP');

        await sendOtp({ email: loginData.email });
        setStep('otp');
        setError('Please verify with OTP');
      } else {
        setError(err?.data?.message || 'Login failed');
      }
    }
  };

  const handleLoginSuccess = async (otp: string) => {
    try {
      const result = await verifyOtp({
        email: loginData.email,
        otp,
        newPassword: loginData.password,
      }).unwrap();

      // Login after password reset
      const loginResult = await login(loginData).unwrap();

      dispatch(
        setCredentials({
          token: loginResult.token,
          user: { id: loginResult.id, email: loginResult.email, role: loginResult.role },
        }),
      );

      showSnackbar({
        message: 'Password reset and login successful!',
        severity: 'success',
      });

      navigate('/');
    } catch (err: any) {
      setError(err?.data?.message || 'OTP verification failed');
    }
  };

  const handleBackToLogin = () => {
    setStep('login');
    setLoginData({ email: '', password: '' });
    setError('');
  };

  const handleResendOTP = async () => {
    await sendOtp({ email: loginData.email });
    showSnackbar({
      message: 'OTP resent successfully!',
      severity: 'success',
    });
  };

  const isLoginDisabled = !loginData.email || !loginData.password;

  return {
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
  };
};
