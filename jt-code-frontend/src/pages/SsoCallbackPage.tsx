import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function SsoCallbackPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          // Try exchanging the OAuth code if present
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) throw exchangeError;
          }
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          void navigate('/app/chat', { replace: true });
        } else {
          void navigate('/sign-in', { replace: true });
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Authentication failed.');
        setTimeout(() => { void navigate('/sign-in', { replace: true }); }, 3000);
      } finally {
        setLoading(false);
      }
    };

    void handleCallback();
  }, [navigate]);

  return (
    <div className="sso-loading">
      <div className="sso-loading__mark">JT</div>
      {errorMsg ? <p>{errorMsg}</p> : <p>{loading ? 'Finishing sign in…' : 'Redirecting…'}</p>}
    </div>
  );
}