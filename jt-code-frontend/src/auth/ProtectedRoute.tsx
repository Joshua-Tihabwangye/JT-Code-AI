import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/react';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  return (
    <>
      <SignedIn>
        <Outlet />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export function PublicRoute() {
  return (
    <>
      <SignedOut>
        <Outlet />
      </SignedOut>
      <SignedIn>
        <Navigate to="/app" replace />
      </SignedIn>
    </>
  );
}