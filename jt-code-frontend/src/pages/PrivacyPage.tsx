import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <section className="legal-card">
        <p className="legal-eyebrow">Privacy Policy</p>
        <h1>JT-Code Privacy</h1>
        <p>
          JT-Code stores account and workspace state locally in mock mode so the frontend can run without a backend.
          Browser storage is used to preserve sessions, conversations, files, documents and other sample data.
        </p>
        <p>
          When API mode is enabled, the same product surfaces can switch to transport-backed repositories without
          changing the page components.
        </p>
        <div className="legal-actions">
          <Link to="/sign-in" className="primary-button primary-button--link">Sign in</Link>
          <Link to="/terms" className="secondary-button">Read terms</Link>
        </div>
      </section>
    </main>
  );
}
