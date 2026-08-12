import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/supabase';

export function ProtectedRoute() {
  const { isSignedIn, loading } = useAuth();

  if (loading) {
    return null;
  }

  return isSignedIn ? <Outlet /> : <Navigate to="/sign-in" replace />;
}

export function PublicRoute() {
  const { isSignedIn, loading } = useAuth();

  if (loading) {
    return null;
  }

  return isSignedIn ? <Navigate to="/app/chat" replace /> : <Outlet />;
}
