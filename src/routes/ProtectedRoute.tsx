import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@app/hooks';
import { getStoredAccessToken, getStoredRefreshToken } from '@features/auth/authCookies';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const isLoggedIn = useAppSelector((state: any) => state.auth?.isLoggedIn);
  const userRole = useAppSelector((state: any) => state.auth?.user?.role);

  const hasToken = !!getStoredAccessToken();
  const hasRefreshToken = !!getStoredRefreshToken();

  if (isLoggedIn || hasToken || hasRefreshToken) {
    if (allowedRoles?.length && (!userRole || !allowedRoles.includes(userRole))) {
      return <Navigate to="/" replace />;
    }
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
