import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const token = localStorage.getItem('accessToken');

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If we have a token but not authenticated yet, show loading
  // This prevents redirect while getCurrentUser is verifying the token
  if (token && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Only redirect if no token AND not authenticated
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
