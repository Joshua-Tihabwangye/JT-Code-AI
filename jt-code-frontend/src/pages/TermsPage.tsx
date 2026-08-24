import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <main className="legal-page">
      <section className="legal-card">
        <p className="legal-eyebrow">Terms of Service</p>
        <h1>JT-Code Terms</h1>
        <p>
          This workspace is currently running in mock mode. By using it, you agree that data entered into the app
          may be stored locally in your browser for product testing and development.
        </p>
        <p>
          The frontend may simulate authentication, billing, file storage and content workflows until the API mode is
          connected.
        </p>
        <div className="legal-actions">
          <Link to="/sign-up" className="primary-button primary-button--link">Create account</Link>
          <Link to="/contact" className="secondary-button">Contact support</Link>
        </div>
      </section>
    </main>
  );
}
