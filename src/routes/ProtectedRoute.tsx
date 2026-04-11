import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@app/hooks';
import { getStoredAccessToken, getStoredRefreshToken } from '@features/auth/authCookies';

const ProtectedRoute = () => {
  const isLoggedIn = useAppSelector((state: any) => state.auth?.isLoggedIn);

  const hasToken = !!getStoredAccessToken();
  const hasRefreshToken = !!getStoredRefreshToken();

  console.log(
    'ProtectedRoute - isLoggedIn:',
    isLoggedIn,
    'hasToken:',
    hasToken,
    'hasRefreshToken:',
    hasRefreshToken,
  );

  if (isLoggedIn || hasToken || hasRefreshToken) {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
