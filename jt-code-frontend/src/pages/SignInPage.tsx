import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '@/auth/AuthLayout';
import { SignInForm } from '@/features/auth/signin';

export default function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/app/chat';

  return (
    <AuthLayout>
      <SignInForm onSignedIn={() => { void navigate(next.startsWith('/') ? next : '/app/chat'); }} />
    </AuthLayout>
  );
}
