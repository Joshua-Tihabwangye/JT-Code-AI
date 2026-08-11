import type { ReactNode } from 'react'
import { Code2, ShieldCheck, Zap } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="auth-feature">
      <div className="auth-feature__icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  )
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <main className="auth-grid">
        <section className="brand-panel" aria-label="JT-Code">
          <div className="brand-panel__inner">
            <div className="brand-logo">
              <div className="brand-logo__mark">JT</div>
              <span>JT-Code</span>
            </div>

            <div className="brand-copy">
              <h1>Your AI agent for<br />focused work</h1>
              <p>JT-Code understands your codebase, helps you move faster, and keeps you in flow.</p>
            </div>

            <div className="brand-illustration-wrap">
              <img
                src="/auth-illustration.png"
                className="brand-illustration"
                alt="JT-Code assisting with code refactoring"
              />
            </div>

            <div className="auth-features">
              <Feature
                icon={<Code2 size={22} strokeWidth={2.1} />}
                title="Understand"
                text="Your entire codebase"
              />
              <Feature
                icon={<Zap size={22} strokeWidth={2.1} />}
                title="Assist"
                text="With intelligent suggestions"
              />
              <Feature
                icon={<ShieldCheck size={22} strokeWidth={2.1} />}
                title="Protect"
                text="Your data and privacy"
              />
            </div>
          </div>
        </section>

        <section className="form-panel">
          <div className="form-panel__inner">{children}</div>
          <div className="trust-note">
            <ShieldCheck size={21} />
            <div>
              <p>Your data is secure and never used to train models.</p>
              <span>
                Read our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms of Service</a>.
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="auth-footer">
        <span>© {new Date().getFullYear()} JT-Code, Inc. All rights reserved.</span>
        <nav>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/contact">Contact</a>
        </nav>
      </footer>
    </div>
  )
}
