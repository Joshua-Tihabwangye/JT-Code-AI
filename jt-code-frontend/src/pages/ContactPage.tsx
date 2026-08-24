import { Link } from 'react-router-dom';

export default function ContactPage() {
  return (
    <main className="legal-page">
      <section className="legal-card">
        <p className="legal-eyebrow">Contact</p>
        <h1>Get help with JT-Code</h1>
        <p>
          This release uses a mock frontend runtime, so the fastest path for support is the workspace itself.
          Use the auth reset flow, sign out/sign in cycle, or refresh to verify persistence while developing.
        </p>
        <p>
          If you want a real support route later, this page is now in place and can be wired to a ticketing or help
          center integration without changing the public navigation.
        </p>
        <div className="legal-actions">
          <Link to="/sign-in" className="primary-button primary-button--link">Back to sign in</Link>
          <Link to="/sign-up" className="secondary-button">Create account</Link>
        </div>
      </section>
    </main>
  );
}
