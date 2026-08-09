import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/layouts/AppShell';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ChatPage } from '@/features/chat/ChatPage';
import { FilesPage } from '@/features/files/FilesPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

function ProtectedApp() {
  return (
    <>
      <SignedIn>
        <AppShell />
      </SignedIn>
      <SignedOut>
        <Navigate to="/" replace />
      </SignedOut>
    </>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<ProtectedApp />}>
        <Route index element={<Navigate to="chat" replace />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="files" element={<FilesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
