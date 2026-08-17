import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { config } from '@/lib/config';

export type { User as SupabaseUser } from '@supabase/supabase-js';

export const supabase = createBrowserClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
) as SupabaseClient;

interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  isSignedIn: boolean;
  isSignedOut: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  loading: true,
  isSignedIn: false,
  isSignedOut: true,
});

export function SupabaseProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setInitialized(true);
    };
    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isSignedIn: !!user && initialized,
      isSignedOut: !user && initialized,
    }),
    [user, session, loading, initialized],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export function useSupabase(): SupabaseClient {
  return supabase;
}

export function useSession(): Session | null {
  const { session } = useAuth();
  return session;
}

export function useUser(): SupabaseUser | null {
  const { user } = useAuth();
  return user;
}