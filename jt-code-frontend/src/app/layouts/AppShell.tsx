import { NavLink, Outlet } from 'react-router-dom';
import { Header } from './Header';

const navigation = [
  { name: 'Chat', href: '/app/chat', icon: '💬' },
  { name: 'Documents', href: '/app/documents', icon: '📄' },
  { name: 'Knowledge', href: '/app/knowledge', icon: '🧠' },
  { name: 'Image Playground', href: '/app/image', icon: '🎨' },
  { name: 'Files', href: '/app/files', icon: '📁' },
  { name: 'Integrations', href: '/app/integrations', icon: '🔗' },
  { name: 'Billing', href: '/app/billing', icon: '💳' },
  { name: 'Settings', href: '/app/settings', icon: '⚙️' },
];

export function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <NavLink to="/app/chat" className="brand" aria-label="JT-Code home">
          <span className="brand-mark">JT</span>
          <span>JT-Code</span>
        </NavLink>
        <nav className="nav-links">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content flex flex-col">
        <Header />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}