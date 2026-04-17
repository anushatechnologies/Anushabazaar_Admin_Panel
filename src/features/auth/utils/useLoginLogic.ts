import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useFirebaseLoginMutation, useLoginMutation } from '@features/auth/api/authApi';
import { useAppDispatch } from '@app/hooks';
import { setCredentials } from '@features/auth/authSlice';
import { showSnackbar } from '@components/snackbarUtils';
import { firebaseAuth } from '@/lib/firebase';
import { saveAdminAccessChallenge } from '@features/auth/authCookies';

export const useLoginLogic = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [firebaseLogin, { isLoading: isFirebaseLoginLoading }] = useFirebaseLoginMutation();
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
      let result: any;

      try {
        result = await login(loginData).unwrap();
      } catch (localError: any) {
        try {
          const credential = await signInWithEmailAndPassword(
            firebaseAuth,
            loginData.email,
            loginData.password,
          );
          const idToken = await credential.user.getIdToken();
          result = await firebaseLogin({ idToken }).unwrap();
        } catch (firebaseError: any) {
          const localMessage =
            localError?.data?.message || localError?.message || 'Bad credentials';
          const firebaseCode = firebaseError?.code || '';
          const firebaseMessage =
            firebaseCode === 'auth/invalid-credential' ||
            firebaseCode === 'auth/wrong-password' ||
            firebaseCode === 'auth/user-not-found'
              ? 'Bad credentials'
              : firebaseCode === 'auth/too-many-requests'
                ? 'Too many attempts. Please try again later.'
                : firebaseError?.data?.message || firebaseError?.message || localMessage;

          throw new Error(firebaseMessage || localMessage);
        }
      }

      if (result.adminCodeRequired && result.adminCodeChallengeToken) {
        saveAdminAccessChallenge({
          challengeToken: result.adminCodeChallengeToken,
          id: result.id,
          email: result.email,
          role: result.role,
          name: result.name,
          mustChangePassword: result.mustChangePassword,
        });
        showSnackbar({
          message: 'Enter the 6-digit admin access code to continue.',
          severity: 'info',
        });
        navigate('/admin-code');
        return;
      }

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
      setError(err?.data?.message || err?.message || 'Login failed');
    }
  };

  const isLoginDisabled = !loginData.email || !loginData.password;

  return {
    loginData,
    error,
    showPassword,
    isLoginLoading: isLoginLoading || isFirebaseLoginLoading,
    onchangeHandler,
    handleLogin,
    isLoginDisabled,
    setShowPassword,
  };
};
