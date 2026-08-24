import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  MessageSquare,
  Image as ImageIcon,
  History,
  CreditCard,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
  Menu,
  Search,
} from 'lucide-react';
import { IconButton } from '@/shared/components';
import { useAppStore } from '@/lib/appStore';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/supabase';
import { AccountMenu } from './AccountMenu';
import { GlobalSearch } from '@/app/GlobalSearch';

const primaryNav = [
  { name: 'Chat', href: '/app/chat', icon: MessageSquare },
  { name: 'Images', href: '/app/image', icon: ImageIcon },
  { name: 'History', href: '/app/history', icon: History },
];

const accountNav = [
  { name: 'Billing', href: '/app/billing', icon: CreditCard },
];

type NavItem = { name: string; href: string; icon: typeof MessageSquare };

function NavSection({
  label,
  items,
  collapsed,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  collapsed: boolean;
  onNavigate: () => void;
}) {
  return (
    <>
      {!collapsed && <span className="nav-section-label">{label}</span>}
      {items.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          title={collapsed ? item.name : undefined}
          className={({ isActive }) => (isActive ? 'active' : '')}
          onClick={onNavigate}
        >
          <item.icon size={18} aria-hidden />
          {!collapsed && <span className="nav-label">{item.name}</span>}
        </NavLink>
      ))}
    </>
  );
}

export function AppShell() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isSignedIn } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const closeDrawer = () => setMobileNavOpen(false);

  return (
    <div className={`app-shell ${collapsed ? 'collapsed' : ''} ${mobileNavOpen ? 'drawer-open' : ''}`}>
      {mobileNavOpen && <div className="sidebar-backdrop" onClick={closeDrawer} aria-hidden />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Primary navigation">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconButton className="mobile-only" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}>
              <Menu size={18} aria-hidden />
            </IconButton>
            <NavLink to="/app/chat" className="brand" aria-label="JT-Code home">
              <span className="brand-mark">JT</span>
              {!collapsed && <span className="nav-label">JT-Code</span>}
            </NavLink>
          </div>
        </div>

        <button type="button" className="search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search (Ctrl/Cmd + K)">
          <Search size={16} aria-hidden />
          {!collapsed && <span>Search…</span>}
          {!collapsed && <kbd className="search-kbd">⌘K</kbd>}
        </button>

        <nav className="nav-links compact">
          <NavSection label="Primary" items={primaryNav} collapsed={collapsed} onNavigate={closeDrawer} />
          <NavSection label="Account" items={accountNav} collapsed={collapsed} onNavigate={closeDrawer} />
        </nav>

        <div className="sidebar-footer compact">
          <button type="button" onClick={toggleTheme} title={collapsed ? 'Toggle theme' : undefined}>
            {resolvedTheme === 'dark' ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
            {!collapsed && <span className="footer-label">Theme</span>}
          </button>

          {isSignedIn && <AccountMenu collapsed={collapsed} />}

          <button type="button" onClick={toggleSidebar} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <PanelLeft size={18} aria-hidden /> : <PanelLeftClose size={18} aria-hidden />}
            {!collapsed && <span className="footer-label">Collapse</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-scroll">
          <Outlet />
        </div>
      </main>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
