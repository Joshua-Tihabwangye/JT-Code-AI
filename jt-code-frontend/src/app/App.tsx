import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '@/auth/ProtectedRoute';
import { AuthLayout } from '@/auth/AuthLayout';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';
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
import { HistoryPage } from '@/features/history/HistoryPage';

export function App() {
  return (
    <Routes>
      {/* Public routes - redirect to app if signed in */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<AuthLayout><SignInPage /></AuthLayout>} />
        <Route path="/sign-up" element={<AuthLayout><SignUpPage /></AuthLayout>} />
      </Route>

      {/* Protected routes - redirect to sign-in if not signed in */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppPage />}>
          <Route index element={<Navigate to="chat" replace />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="image" element={<ImagePlaygroundPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}