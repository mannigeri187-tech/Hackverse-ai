import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isDemoMode = searchParams.get('demo') === 'true';

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && !isDemoMode) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if email is confirmed. If not, redirect to verification page.
  // We check email_confirmed_at. Some providers might auto-confirm, but for email/password this applies.
  if (user && !user.email_confirmed_at) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}
