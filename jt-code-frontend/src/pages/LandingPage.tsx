import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/supabase';

export function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <main className="landing">
      <header className="landing-header">
        <div className="brand"><span className="brand-mark">JT</span><span>JT-Code</span></div>
        <div className="header-actions">
          {isSignedIn ? (
            <Link className="button primary" to="/app/chat">Open JT-Code</Link>
          ) : (
            <>
              <Link className="button ghost" to="/sign-in">Sign in</Link>
              <Link className="button primary" to="/sign-up">Create account</Link>
            </>
          )}
        </div>
      </header>
      <section className="hero">
        <p className="eyebrow">WEB + MOBILE AI ASSISTANT</p>
        <h1>One clear workspace for questions, files, research and creation.</h1>
        <p className="hero-copy">
          JT-Code is the only assistant name used throughout this platform. The web client is React and TypeScript; authentication is handled by Supabase Auth and all business state lives in the Django API.
        </p>
        {isSignedIn ? (
          <Link className="button primary large" to="/app/chat">Continue to workspace</Link>
        ) : (
          <Link className="button primary large" to="/sign-up">Start with JT-Code</Link>
        )}
      </section>
      <section className="feature-grid" aria-label="Platform foundations">
        <article><h2>Secure identity</h2><p>Supabase Auth sessions are verified again by Django before every protected action.</p></article>
        <article><h2>Durable data</h2><p>Supabase-hosted PostgreSQL remains the transactional source of truth.</p></article>
        <article><h2>Managed assets</h2><p>Signed Cloudinary uploads keep secrets outside the browser.</p></article>
      </section>
    </main>
  );
}
