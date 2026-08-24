import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Moon, ShieldCheck, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="auth-page auth-page--centered">
      <button
        type="button"
        className="auth-theme-toggle"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
        {isDark ? 'Light' : 'Dark'}
      </button>

      <main className="auth-shell">
        <div className="auth-shell__brand">
          <Link to="/" className="brand">
            <span className="brand-mark">JT</span>
            <span>JT-Code</span>
          </Link>
          <span className="auth-shell__tag">Private AI workspace</span>
        </div>

        <div className="auth-shell__panel">{children}</div>

        <div className="auth-shell__notice">
          <ShieldCheck size={18} />
          <p>Your data stays in the workspace and mock auth persists across refreshes.</p>
        </div>
      </main>

      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} JT-Code, Inc.</span>
        <nav>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}
