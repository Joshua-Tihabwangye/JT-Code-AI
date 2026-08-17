import type { ReactNode } from 'react'
import { MessageSquareText, Sparkles, ShieldCheck, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme'

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
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="auth-page">
      <button
        type="button"
        className="auth-theme-toggle"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
        {isDark ? 'Light' : 'Dark'}
      </button>

      <main className="auth-grid">
        <section className="brand-panel" aria-label="JT-Code">
          <div className="brand-panel__inner">
            <div className="brand-logo">
              <div className="brand-logo__mark">JT</div>
              <span>JT-Code</span>
            </div>

            <div className="brand-copy">
              <h1>One workspace for questions, files, research and creation.</h1>
              <p>JT-Code is your general AI assistant — chat, upload files, and create across one calm interface.</p>
            </div>

            <div className="brand-illustration-wrap">
              <img
                src="/auth-illustration.png"
                className="brand-illustration"
                alt="The JT-Code assistant interface"
              />
            </div>

            <div className="auth-features">
              <Feature
                icon={<MessageSquareText size={20} strokeWidth={2.1} />}
                title="Chat & research"
                text="Ask, draft, and reason across tasks"
              />
              <Feature
                icon={<Sparkles size={20} strokeWidth={2.1} />}
                title="Create & edit"
                text="Images, documents, and more"
              />
              <Feature
                icon={<ShieldCheck size={20} strokeWidth={2.1} />}
                title="Private by design"
                text="Your data stays yours"
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
