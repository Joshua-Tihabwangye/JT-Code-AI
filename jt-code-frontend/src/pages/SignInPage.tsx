import { SignIn } from '@clerk/react';

export function SignInPage() {
  return (
    <main className="auth-page">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </main>
  );
}