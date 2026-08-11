import { NavLink, Outlet } from 'react-router-dom';
import { UserButton } from '@clerk/react';
import {
  MessageSquare,
  Image as ImageIcon,
  History,
  CreditCard,
  Settings,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import { useTheme } from '@/lib/theme';

const navigation = [
  { name: 'Chat', href: '/app/chat', icon: MessageSquare },
  { name: 'Image Playground', href: '/app/image', icon: ImageIcon },
  { name: 'History', href: '/app/history', icon: History },
  { name: 'Billing', href: '/app/billing', icon: CreditCard },
];

export function AppShell() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className={`app-shell ${collapsed ? 'collapsed' : ''}`}>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Primary navigation">
        <div className="flex items-center justify-between">
          <NavLink to="/app/chat" className="brand" aria-label="JT-Code home">
            <span className="brand-mark">JT</span>
            {!collapsed && <span className="nav-label">JT-Code</span>}
          </NavLink>
        </div>

        <nav className="nav-links compact">
          {!collapsed && <span className="nav-section-label">Workspace</span>}
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              title={collapsed ? item.name : undefined}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <item.icon size={18} />
              {!collapsed && <span className="nav-label">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer compact">
          <button
            type="button"
            onClick={toggleTheme}
            title={collapsed ? 'Toggle theme' : undefined}
          >
            {resolvedTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            {!collapsed && <span className="footer-label">Theme</span>}
          </button>

          <NavLink
            to="/app/settings"
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings size={18} />
            {!collapsed && <span className="footer-label">Settings</span>}
          </NavLink>

          <div className="account-row">
            <UserButton
              showName={!collapsed}
              userProfileUrl="/app/settings"
              appearance={{
                elements: {
                  userButtonTrigger: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full',
                },
              }}
            />
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            {!collapsed && <span className="footer-label">Collapse</span>}
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div className="page-scroll">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
