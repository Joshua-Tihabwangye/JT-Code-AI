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
  FileText,
  FolderOpen,
  LogOut,
} from 'lucide-react';
import { Avatar, Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from '@/shared/components';
import { useAppStore } from '@/lib/appStore';
import { useTheme } from '@/lib/theme';
import { supabase, useAuth, useUser } from '@/lib/supabase';

const navigation = [
  { name: 'Chat', href: '/app/chat', icon: MessageSquare },
  { name: 'Image Playground', href: '/app/image', icon: ImageIcon },
  { name: 'History', href: '/app/history', icon: History },
  { name: 'Files', href: '/app/files', icon: FolderOpen },
  { name: 'Documents', href: '/app/documents', icon: FileText },
  { name: 'Billing', href: '/app/billing', icon: CreditCard },
];

export function AppShell() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isSignedIn } = useAuth();
  const user = useUser();
  const navigate = useNavigate();

  const displayName =
    String(user?.user_metadata?.full_name ?? '') ||
    String(user?.user_metadata?.name ?? '') ||
    user?.email ||
    'Account';
  const avatarUrl = typeof user?.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : undefined;

  const signOut = async () => {
    await supabase.auth.signOut();
    void navigate('/sign-in');
  };

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
          <button type="button" onClick={toggleTheme} title={collapsed ? 'Toggle theme' : undefined}>
            {resolvedTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            {!collapsed && <span className="footer-label">Theme</span>}
          </button>

          <NavLink to="/app/settings" title={collapsed ? 'Settings' : undefined}>
            <Settings size={18} />
            {!collapsed && <span className="footer-label">Settings</span>}
          </NavLink>

          {isSignedIn && user && (
            <Dropdown
              trigger={
                <button type="button" className="account-row" title={collapsed ? displayName : undefined}>
                  <Avatar src={avatarUrl} alt={displayName} size="sm" />
                  {!collapsed && <span className="footer-label truncate">{displayName}</span>}
                </button>
              }
              content={
                <>
                  <DropdownLabel>
                    <div className="px-2 py-1.5 text-sm">
                      <div className="font-medium">{displayName}</div>
                      <div className="text-muted-foreground">{user.email}</div>
                    </div>
                  </DropdownLabel>
                  <DropdownSeparator />
                  <DropdownItem onClick={() => void navigate('/app/settings')}>
                    <Settings size={16} className="mr-2" /> Settings
                  </DropdownItem>
                  <DropdownSeparator />
                  <DropdownItem onClick={() => void signOut()}>
                    <LogOut size={16} className="mr-2" /> Sign out
                  </DropdownItem>
                </>
              }
            />
          )}

          <button type="button" onClick={toggleSidebar} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
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
