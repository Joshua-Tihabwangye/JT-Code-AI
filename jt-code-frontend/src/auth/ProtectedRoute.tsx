import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/supabase';
import { RouteLoading } from '@/app/layouts/RouteLoading';

export function ProtectedRoute() {
  const { isSignedIn, loading } = useAuth();

  if (loading) {
    return <RouteLoading />;
  }

  return isSignedIn ? <Outlet /> : <Navigate to="/sign-in" replace />;
}

export function PublicRoute() {
  const { isSignedIn, loading } = useAuth();

  if (loading) {
    return <RouteLoading />;
  }

  return isSignedIn ? <Navigate to="/app/chat" replace /> : <Outlet />;
}
