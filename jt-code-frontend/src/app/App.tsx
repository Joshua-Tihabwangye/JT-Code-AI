import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth, PublicRoute } from '@/auth/ProtectedRoute';
import { AppShell } from '@/app/layouts/AppShell';
import { NotFoundPage } from '@/pages/NotFoundPage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import SsoCallbackPage from '@/pages/SsoCallbackPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import ContactPage from '@/pages/ContactPage';
import { ChatPage } from '@/features/chat/ChatPage';
import { ImagePlaygroundPage } from '@/features/image/ImagePlaygroundPage';
import { BillingPage } from '@/features/billing/BillingPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { HistoryPage } from '@/features/history/HistoryPage';

export function App() {
  return (
    <Routes>
      {/* Public marketing routes - redirect to app if signed in */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Navigate to="/app/chat" replace />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/sso-callback" element={<SsoCallbackPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* App shell is PUBLIC. The sidebar, chat landing page, theme, language,
          collapse and account controls are available to guests. Only account-
          specific features (history, billing, settings) are guarded. */}
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="chat" replace />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="image" element={<Navigate to="/app/images" replace />} />
        <Route path="images" element={<ImagePlaygroundPage />} />
        <Route path="history" element={<RequireAuth><HistoryPage /></RequireAuth>} />
        <Route path="billing" element={<RequireAuth><BillingPage /></RequireAuth>} />
        <Route path="settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}