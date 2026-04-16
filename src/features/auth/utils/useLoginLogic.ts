import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '@features/auth/api/authApi';
import { useAppDispatch } from '@app/hooks';
import { setCredentials } from '@features/auth/authSlice';
import { showSnackbar } from '@components/snackbarUtils';

export const useLoginLogic = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onchangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(loginData).unwrap();

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

      showSnackbar({ message: 'Login successful!', severity: 'success' });

      if (result.mustChangePassword) {
        navigate('/change-password', { replace: true });
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err?.data?.message || 'Login failed');
    }
  };

  const isLoginDisabled = !loginData.email || !loginData.password;

  return {
    loginData,
    error,
    showPassword,
    isLoginLoading,
    onchangeHandler,
    handleLogin,
    isLoginDisabled,
    setShowPassword,
  };
};
