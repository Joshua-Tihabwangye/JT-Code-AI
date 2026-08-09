import type { PropsWithChildren } from 'react';
import { Header } from '@/app/layouts/Header';

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}