import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/auth/AuthLayout';
import { SignInForm } from '@/features/auth/signin';

export default function SignInPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <SignInForm onSignedIn={() => { void navigate('/app/chat'); }} />
    </AuthLayout>
  );
}
