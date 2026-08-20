import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/auth/AuthLayout';
import { SignupForm } from '@/features/auth/signup';

export default function SignUpPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <SignupForm onSignedUp={() => { void navigate('/app/chat'); }} />
    </AuthLayout>
  );
}
