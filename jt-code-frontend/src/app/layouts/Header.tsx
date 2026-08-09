import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react';
import { Button } from '@/shared/components';

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Show when="signed-out">
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="primary" size="sm">Get Started</Button>
            </SignUpButton>
          </div>
        </Show>
        <Show when="signed-in">
          <UserButton showName />
        </Show>
      </div>
    </header>
  );
}