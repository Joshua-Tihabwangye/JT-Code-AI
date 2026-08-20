export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  contact: string;
  countryCode: string;
  countryName: string;
  dialCode: string;
  timezone: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface LocalSession {
  accessToken: string;
  userId: string;
  issuedAt: string;
}

const USERS_KEY = 'jtcode_users';
const SESSION_KEY = 'jtcode_session';

type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeAuth(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — frontend-only mode */
  }
}

export function getStoredUsers(): StoredUser[] {
  return readJSON<StoredUser[]>(USERS_KEY, []);
}

export function saveStoredUsers(users: StoredUser[]): void {
  writeJSON(USERS_KEY, users);
}

export function hashPassword(password: string): string {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = (hash * 33) ^ password.charCodeAt(i);
  }
  return `h${(hash >>> 0).toString(16)}`;
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const normalized = email.trim().toLowerCase();
  return getStoredUsers().find((user) => user.email.toLowerCase() === normalized);
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  contact: string;
  countryCode: string;
  countryName: string;
  dialCode: string;
  timezone: string;
}

export function createUser(data: CreateUserData): StoredUser {
  const users = getStoredUsers();
  const user: StoredUser = {
    id: crypto.randomUUID(),
    email: data.email.trim(),
    passwordHash: hashPassword(data.password),
    firstName: data.firstName,
    lastName: data.lastName,
    contact: data.contact,
    countryCode: data.countryCode,
    countryName: data.countryName,
    dialCode: data.dialCode,
    timezone: data.timezone,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveStoredUsers(users);
  return user;
}

export function findOrCreateOAuthUser(provider: string): StoredUser {
  const email = `${provider}@local.dev`;
  const existing = findUserByEmail(email);
  if (existing) return existing;

  const name = provider.charAt(0).toUpperCase() + provider.slice(1);
  const user: StoredUser = {
    id: crypto.randomUUID(),
    email,
    passwordHash: '',
    firstName: name,
    lastName: 'User',
    contact: '',
    countryCode: 'UG',
    countryName: 'Uganda',
    dialCode: '+256',
    timezone: 'Africa/Kampala',
    avatarUrl: null,
    createdAt: new Date().toISOString(),
  };
  const users = getStoredUsers();
  users.push(user);
  saveStoredUsers(users);
  return user;
}

export function verifyCredentials(email: string, password: string): StoredUser | null {
  const user = findUserByEmail(email);
  if (!user) return null;
  if (user.passwordHash !== hashPassword(password)) return null;
  return user;
}

export function getSession(): LocalSession | null {
  return readJSON<LocalSession | null>(SESSION_KEY, null);
}

export function setSession(session: LocalSession | null): void {
  if (session) {
    writeJSON(SESSION_KEY, session);
  } else {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }
  notify();
}

export function getCurrentUser(): StoredUser | null {
  const session = getSession();
  if (!session) return null;
  return getStoredUsers().find((user) => user.id === session.userId) ?? null;
}

export function createSession(userId: string): LocalSession {
  return {
    accessToken: `local.${crypto.randomUUID()}`,
    userId,
    issuedAt: new Date().toISOString(),
  };
}
