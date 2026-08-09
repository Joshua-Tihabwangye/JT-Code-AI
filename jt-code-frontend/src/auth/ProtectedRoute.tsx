import { Show, RedirectToSignIn } from '@clerk/react';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  return (
    <Show when="signed-in" fallback={<RedirectToSignIn />}>
      <Outlet />
    </Show>
  );
}

export function PublicRoute() {
  return (
    <Show when="signed-out">
      <Outlet />
    </Show>
  );
}