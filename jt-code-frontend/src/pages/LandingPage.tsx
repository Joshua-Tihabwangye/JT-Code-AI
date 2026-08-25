import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/supabase';

export function LandingPage() {
  const { isSignedIn } = useAuth();
  const { t } = useTranslation();

  return (
    <main className="landing">
      <header className="landing-header">
        <div className="brand"><span className="brand-mark">JT</span><span>JT-Code</span></div>
        <div className="header-actions">
          {isSignedIn ? (
            <Link className="button primary" to="/app/chat">{t('landing.openApp')}</Link>
          ) : (
            <>
              <Link className="button ghost" to="/sign-in">{t('landing.signIn')}</Link>
              <Link className="button primary" to="/sign-up">{t('landing.createAccount')}</Link>
            </>
          )}
        </div>
      </header>
      <section className="hero">
        <p className="eyebrow">{t('landing.eyebrow')}</p>
        <h1>{t('landing.headline')}</h1>
        <p className="hero-copy">{t('landing.copy')}</p>
        {isSignedIn ? (
          <Link className="button primary large" to="/app/chat">{t('landing.continueToWorkspace')}</Link>
        ) : (
          <Link className="button primary large" to="/sign-up">{t('landing.startWith')}</Link>
        )}
      </section>
      <section className="feature-grid" aria-label={t('landing.foundationsLabel')}>
        <article><h2>{t('landing.feature1Title')}</h2><p>{t('landing.feature1Desc')}</p></article>
        <article><h2>{t('landing.feature2Title')}</h2><p>{t('landing.feature2Desc')}</p></article>
        <article><h2>{t('landing.feature3Title')}</h2><p>{t('landing.feature3Desc')}</p></article>
      </section>
    </main>
  );
}
