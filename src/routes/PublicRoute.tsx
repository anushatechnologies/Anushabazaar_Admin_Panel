import { Navigate, Outlet } from 'react-router-dom';
import { getStoredAccessToken, getStoredRefreshToken } from '@features/auth/authCookies';

const PublicRoute = () => {
  const token = getStoredAccessToken();
  const refreshToken = getStoredRefreshToken();

  return token || refreshToken ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;
