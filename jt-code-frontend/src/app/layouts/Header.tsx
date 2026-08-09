import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Show when="signed-out">
          <div className="flex items-center gap-2">
            <SignInButton mode="modal" className="button ghost text-sm">
              Sign In
            </SignInButton>
            <SignUpButton mode="modal" className="button primary text-sm">
              Get Started
            </SignUpButton>
          </div>
        </Show>
        <Show when="signed-in">
          <UserButton showName afterSignOutUrl="/" />
        </Show>
      </div>
    </header>
  );
}