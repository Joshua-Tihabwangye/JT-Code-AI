import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import SsoCallbackPage from '@/pages/SsoCallbackPage';
import { AppPage } from '@/pages/AppPage';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ChatPage } from '@/features/chat/ChatPage';
import { FilesPage } from '@/features/files/FilesPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { KnowledgePage } from '@/features/knowledge/KnowledgePage';
import { BillingPage } from '@/features/billing/BillingPage';
import { IntegrationsPage } from '@/features/integrations/IntegrationsPage';
import { ImagePlaygroundPage } from '@/features/image/ImagePlaygroundPage';
import { DocumentsPage } from '@/features/documents/DocumentsPage';
import { Show } from '@clerk/react';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sign-in" replace />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
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
        <Route path="files" element={<FilesPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="knowledge" element={<KnowledgePage />} />
        <Route path="image" element={<ImagePlaygroundPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}