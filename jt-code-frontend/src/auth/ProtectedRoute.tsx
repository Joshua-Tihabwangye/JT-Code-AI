import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/supabase';
import { RouteLoading } from '@/app/layouts/RouteLoading';

export function ProtectedRoute() {
  const { isSignedIn, loading } = useAuth();

  if (loading) {
    return <RouteLoading />;
  }

  return isSignedIn ? <Outlet /> : <Navigate to="/sign-in" replace />;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isSignedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteLoading />;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function PublicRoute() {
  const { isSignedIn, loading } = useAuth();

  if (loading) {
    return <RouteLoading />;
  }

  return isSignedIn ? <Navigate to="/app/chat" replace /> : <Outlet />;
}
