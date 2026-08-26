import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { SupabaseClient, Session, User as SupabaseUser } from '@supabase/supabase-js';
import {
  createSession,
  createUser,
  consumeResetCode,
  getResetCodeRecord,
  findOrCreateOAuthUser,
  findUserByEmail,
  getCurrentUser,
  getSession,
  issueResetCode,
  setSession,
  subscribeAuth,
  updateUserPassword,
  verifyCredentials,
  type LocalSession,
  type StoredUser,
} from '@/lib/localAuth';

export type { User as SupabaseUser } from '@supabase/supabase-js';

function toSupabaseUser(stored: StoredUser | null): SupabaseUser | null {
  if (!stored) return null;
  const fullName = `${stored.firstName} ${stored.lastName}`.trim();
  return {
    id: stored.id,
    email: stored.email,
    app_metadata: {},
    user_metadata: {
      first_name: stored.firstName,
      last_name: stored.lastName,
      full_name: fullName,
      contact: stored.contact,
      country: stored.countryName,
      timezone: stored.timezone,
      avatar_url: stored.avatarUrl,
    },
    aud: 'authenticated',
    created_at: stored.createdAt,
  };
}

function toSession(session: LocalSession, stored: StoredUser): Session {
  return {
    access_token: session.accessToken,
    token_type: 'bearer',
    expires_in: 999999999,
    refresh_token: 'local',
    user: toSupabaseUser(stored) as SupabaseUser,
  } as unknown as Session;
}

const noopChain = new Proxy(function () {}, {
  get: () => noopChain,
  apply: () => noopChain,
}) as unknown as { [key: string]: unknown };

const storageStub = {
  from: () => ({
    upload: () => Promise.resolve({ data: { path: '' }, error: null }),
    getPublicUrl: () => ({ data: { publicUrl: '' } }),
    remove: () => Promise.resolve({ data: [], error: null }),
  }),
};

function metaString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export const supabase = {
  auth: {
    signUp({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, unknown> } }) {
      if (findUserByEmail(email)) {
        return { data: { user: null, session: null }, error: { message: 'An account with this email already exists.' } };
      }
      const meta = options?.data ?? {};
      const user = createUser({
        email,
        password,
        firstName: metaString(meta.first_name) || metaString(meta.firstName),
        lastName: metaString(meta.last_name) || metaString(meta.lastName),
        contact: metaString(meta.contact),
        countryCode: metaString(meta.country),
        countryName: metaString(meta.countryName) || metaString(meta.country),
        dialCode: metaString(meta.dialCode),
        timezone: metaString(meta.timezone),
      });
      const session = createSession(user.id);
      setSession(session);
      return { data: { user: toSupabaseUser(user), session: toSession(session, user) }, error: null };
    },
    signInWithPassword({ email, password }: { email: string; password: string }) {
      const user = verifyCredentials(email, password);
      if (!user) {
        return { data: { user: null, session: null }, error: { message: 'Invalid email or password.' } };
      }
      const session = createSession(user.id);
      setSession(session);
      return { data: { user: toSupabaseUser(user), session: toSession(session, user) }, error: null };
    },
    signInWithOAuth({ provider }: { provider?: string }) {
      const name = String(provider ?? 'oauth').replace(/[^a-z0-9]/gi, '').toLowerCase();
      const user = findOrCreateOAuthUser(name);
      const session = createSession(user.id);
      setSession(session);
      return { data: { user: toSupabaseUser(user), session: toSession(session, user), provider }, error: null };
    },
    signOut() {
      setSession(null);
      return { error: null };
    },
    getSession() {
      const session = getSession();
      const user = session ? getCurrentUser() : null;
      return { data: { session: session && user ? toSession(session, user) : null }, error: null };
    },
    getUser() {
      const user = getCurrentUser();
      return { data: { user: user ? toSupabaseUser(user) : null }, error: null };
    },
    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
      const unsubscribe = subscribeAuth(() => {
        const session = getSession();
        const user = session ? getCurrentUser() : null;
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session && user ? toSession(session, user) : null);
      });
      return { data: { subscription: { unsubscribe } } };
    },
    resetPasswordForEmail(email: string) {
      if (!findUserByEmail(email)) {
        return { data: {}, error: { message: 'No account exists for that email address.' } };
      }
      const record = issueResetCode(email);
      return { data: { email: record.email, resetCode: record.code }, error: null };
    },
    async resetPassword({
      email,
      code,
      newPassword,
    }: {
      email: string;
      code: string;
      newPassword: string;
    }) {
      const record = getResetCodeRecord(email);
      if (!record || record.code !== code) {
        return { data: {}, error: { message: 'Invalid or expired reset code.' } };
      }
      const ok = updateUserPassword(record.email, newPassword);
      if (!ok) {
        return { data: {}, error: { message: 'Sign in to reset your password.' } };
      }
      consumeResetCode(record.email, code);
      return { data: {}, error: null };
    },
    exchangeCodeForSession() {
      const session = getSession();
      const user = session ? getCurrentUser() : null;
      return {
        data: { session: session && user ? toSession(session, user) : null, user: user ? toSupabaseUser(user) : null },
        error: null,
      };
    },
  },
  storage: storageStub,
  from: () => noopChain,
  channel: () => noopChain,
  removeChannel: () => noopChain,
  rpc: () => noopChain,
} as unknown as SupabaseClient;

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  isSignedIn: boolean;
  isSignedOut: boolean;
}

const AuthContext = createContext<AuthState>({
  status: 'loading',
  user: null,
  session: null,
  loading: true,
  isSignedIn: false,
  isSignedOut: true,
});

export function SupabaseProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSessionState] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const sync = () => {
      const activeSession = getSession();
      const stored = activeSession ? getCurrentUser() : null;
      setUser(stored ? toSupabaseUser(stored) : null);
      setSessionState(activeSession && stored ? toSession(activeSession, stored) : null);
      setLoading(false);
      setInitialized(true);
    };
    sync();
    return subscribeAuth(sync);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      status: loading ? 'loading' : user ? 'authenticated' : 'unauthenticated',
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
