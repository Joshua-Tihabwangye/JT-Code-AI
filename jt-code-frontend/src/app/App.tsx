import { Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import SsoCallbackPage from '@/pages/SsoCallbackPage';
import { AppPage } from '@/pages/AppPage';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ChatPage } from '@/features/chat/ChatPage';
import { DocumentsPage } from '@/features/documents/DocumentsPage';
import { ImagePlaygroundPage } from '@/features/image/ImagePlaygroundPage';
import { BillingPage } from '@/features/billing/BillingPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { Show } from '@clerk/react';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sign-in" replace />} />
      <Route
        path="/sign-in"
        element={
          <Show when="signed-out" fallback={<Navigate to="/app" replace />}>
            <SignInPage />
          </Show>
        }
      />
      <Route
        path="/sign-up"
        element={
          <Show when="signed-out" fallback={<Navigate to="/app" replace />}>
            <SignUpPage />
          </Show>
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/sso-callback" element={<SsoCallbackPage />} />
      <Route
        path="/app"
        element={
          <Show when="signed-in" fallback={<Navigate to="/sign-in" replace />}>
            <AppPage />
          </Show>
        }
      >
        <Route index element={<Navigate to="chat" replace />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="image" element={<ImagePlaygroundPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}