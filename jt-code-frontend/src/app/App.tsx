import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '@/auth/ProtectedRoute';
import { AppPage } from '@/pages/AppPage';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import SsoCallbackPage from '@/pages/SsoCallbackPage';
import { ChatPage } from '@/features/chat/ChatPage';
import { FilesPage } from '@/features/files/FilesPage';
import { DocumentsPage } from '@/features/documents/DocumentsPage';
import { ImagePlaygroundPage } from '@/features/image/ImagePlaygroundPage';
import { BillingPage } from '@/features/billing/BillingPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { HistoryPage } from '@/features/history/HistoryPage';
import { IntegrationsPage } from '@/features/integrations/IntegrationsPage';
import { KnowledgePage } from '@/features/knowledge/KnowledgePage';

export function App() {
  return (
    <Routes>
      {/* Public routes - redirect to app if signed in */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/sso-callback" element={<SsoCallbackPage />} />
      </Route>

      {/* Protected routes - redirect to sign-in if not signed in */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppPage />}>
          <Route index element={<Navigate to="chat" replace />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="image" element={<ImagePlaygroundPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}