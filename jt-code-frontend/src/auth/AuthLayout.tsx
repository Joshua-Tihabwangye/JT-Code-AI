import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, ShieldCheck, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className="auth-page auth-page--centered">
      <button
        type="button"
        className="auth-theme-toggle"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={isDark ? t('authLayout.switchToLight') : t('authLayout.switchToDark')}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
        {isDark ? t('authLayout.light') : t('authLayout.dark')}
      </button>

      <main className="auth-shell">
        <div className="auth-shell__brand">
          <Link to="/" className="brand">
            <span className="brand-mark">JT</span>
            <span>JT-Code</span>
          </Link>
          <span className="auth-shell__tag">{t('authLayout.tagline')}</span>
        </div>

        <div className="auth-shell__panel">{children}</div>

        <div className="auth-shell__notice">
          <ShieldCheck size={18} />
          <p>{t('authLayout.notice')}</p>
        </div>
      </main>

      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} JT-Code, Inc.</span>
        <nav>
          <Link to="/privacy">{t('legal.privacy.eyebrow')}</Link>
          <Link to="/terms">{t('legal.terms.eyebrow')}</Link>
          <Link to="/contact">{t('legal.contact.eyebrow')}</Link>
        </nav>
      </footer>
    </div>
  );
}
