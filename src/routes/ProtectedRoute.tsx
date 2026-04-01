import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@app/hooks';

const ProtectedRoute: React.FC = () => {
  const isLoggedIn = useAppSelector((state: any) => state.auth?.isLoggedIn);

  // ✅ ALSO CHECK localStorage as backup
  const token = localStorage.getItem('token');
  const hasToken = !!token;

  console.log('ProtectedRoute - isLoggedIn:', isLoggedIn, 'hasToken:', hasToken);

  // ✅ Allow access if Redux OR localStorage has token
  if (isLoggedIn || hasToken) {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
