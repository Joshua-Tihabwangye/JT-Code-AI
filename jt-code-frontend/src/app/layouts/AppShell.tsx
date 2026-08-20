import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  LogOut,
} from 'lucide-react';
import {
  Avatar,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from '@/shared/components';
import { useAppStore } from '@/lib/appStore';
import { useTheme } from '@/lib/theme';
import { supabase, useAuth, useUser } from '@/lib/supabase';

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
  const { isSignedIn } = useAuth();
  const user = useUser();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const accountOpen = dropdownOpen && isSignedIn && Boolean(user);

  const displayName =
    String(user?.user_metadata?.full_name ?? '') ||
    String(user?.user_metadata?.name ?? '') ||
    user?.email ||
    'Account';
  const avatarUrl = typeof user?.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : undefined;

  const signOut = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    void navigate('/sign-in');
  };

  const brandLabelHidden = collapsed || accountOpen;

  return (
    <div className={`app-shell ${collapsed ? 'collapsed' : ''}`}>
      <aside ref={sidebarRef} className={`sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Primary navigation">
        <div className="flex items-center justify-between">
          <NavLink to="/app/chat" className="brand" aria-label="JT-Code home">
            <span className="brand-mark">JT</span>
            {!brandLabelHidden && <span className="nav-label">JT-Code</span>}
          </NavLink>
        </div>

        {!accountOpen && (
          <nav className="nav-links compact">
            <span className="nav-section-label">Workspace</span>
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
        )}

        <div className="sidebar-footer compact">
          {!accountOpen && (
            <>
              <button type="button" onClick={toggleTheme} title={collapsed ? 'Toggle theme' : undefined}>
                {resolvedTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                {!collapsed && <span className="footer-label">Theme</span>}
              </button>

              <NavLink to="/app/settings" title={collapsed ? 'Settings' : undefined}>
                <Settings size={18} />
                {!collapsed && <span className="footer-label">Settings</span>}
              </NavLink>
            </>
          )}

          {isSignedIn && user && (
            <button
              type="button"
              className="account-row"
              title={collapsed ? displayName : undefined}
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <Avatar src={avatarUrl} alt={displayName} size="sm" />
              {!collapsed && !accountOpen && <span className="footer-label truncate">{displayName}</span>}
            </button>
          )}

          {!accountOpen && (
            <button type="button" onClick={toggleSidebar} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
              {!collapsed && <span className="footer-label">Collapse</span>}
            </button>
          )}
        </div>

        {accountOpen && (
          <div className="account-overlay">
            <DropdownLabel>
              <div className="px-2 py-1.5 text-sm">
                <div className="font-medium">{displayName}</div>
                <div className="text-muted-foreground">{user?.email}</div>
              </div>
            </DropdownLabel>
            <DropdownSeparator />
            <DropdownItem onClick={() => { setDropdownOpen(false); void navigate('/app/settings'); }}>
              <Settings size={16} className="mr-2" /> Settings
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem onClick={() => void signOut()}>
              <LogOut size={16} className="mr-2" /> Sign out
            </DropdownItem>
          </div>
        )}
      </aside>

      <main className="main-content">
        <div className="page-scroll">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
