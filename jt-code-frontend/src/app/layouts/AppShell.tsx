import { useState } from 'react';
import { NavLink, Outlet, useNavigate, type NavigateFunction } from 'react-router-dom';
import { Avatar, Dropdown, DropdownItem, DropdownSeparator, DropdownLabel, Button } from '@/shared/components';
import { useAuth, useUser, supabase, type SupabaseUser } from '@/lib/supabase';
import {
  ChevronLeft, ChevronRight, MessageCircle, Image as ImageIcon, CreditCard, Settings as SettingsIcon, LogOut
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/client';
import { getUsage, getSubscription } from '@/features/billing/api';

const navigation = [
  { name: 'Chat', href: '/app/chat', icon: MessageCircle },
  { name: 'Image Studio', href: '/app/image', icon: ImageIcon },
  { name: 'Billing', href: '/app/billing', icon: CreditCard },
  { name: 'Settings', href: '/app/settings', icon: SettingsIcon },
];

const sidebarDropdownContent = (displayName: string, user: SupabaseUser, navigate: NavigateFunction, handle: () => void, _collapsed: boolean) => (
  <>
    <DropdownLabel>
      <div className="px-2 py-1.5 text-sm">
        <div className="font-medium">{displayName}</div>
        <div className="text-muted-foreground">{user.email}</div>
      </div>
    </DropdownLabel>
    <DropdownSeparator />
    <DropdownItem onClick={() => void navigate('/app/settings')}>
      <SettingsIcon size={16} className="mr-2" />
      Settings
    </DropdownItem>
    <DropdownSeparator />
    <DropdownItem onClick={handle}>
      <LogOut size={16} className="mr-2" />
      Sign out
    </DropdownItem>
  </>
);

const headerDropdownContent = (displayName: string, user: SupabaseUser, navigate: NavigateFunction, handle: () => void) => (
  <>
    <DropdownLabel>
      <div className="px-2 py-1.5 text-sm">
        <div className="font-medium">{displayName}</div>
        <div className="text-muted-foreground">{user.email}</div>
      </div>
    </DropdownLabel>
    <DropdownSeparator />
    <DropdownItem onClick={() => void navigate('/app/settings')}>
      <SettingsIcon size={16} className="mr-2" />
      Settings
    </DropdownItem>
    <DropdownSeparator />
    <DropdownItem onClick={handle}>
      <LogOut size={16} className="mr-2" />
      Sign out
    </DropdownItem>
  </>
);

export function AppShell() {
  const client = useApiClient();
  const [collapsed, setCollapsed] = useState(false);

  const usage = useQuery({ queryKey: ['usage'], queryFn: () => getUsage(client) });
  const subscription = useQuery({ queryKey: ['subscription'], queryFn: () => getSubscription(client) });

  const limit = subscription.data ? 5000 : 5000;
  const used = usage.data?.total_credits ?? 0;
  const percentage = Math.min(100, Math.max(0, limit > 0 ? (used / limit) * 100 : 0));
  const displayUsed = used.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const displayLimit = limit.toLocaleString();

  const { isSignedIn } = useAuth();
  const user = useUser();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    void navigate('/sign-in');
  };

  const onSignOut = () => void handleSignOut();

  const displayName =
    String(user?.user_metadata?.full_name ?? '') ||
    String(user?.user_metadata?.name ?? '') ||
    user?.email ||
    'Account';

  const avatarUrl =
    typeof user?.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : undefined;

  return (
    <div className={`app-shell ${collapsed ? 'collapsed' : ''}`}>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Primary navigation">
        <div className="flex items-center justify-between">
          <NavLink to="/app/chat" className="brand" aria-label="JT-Code home">
            <span className="brand-mark">JT</span>
            {!collapsed && <span>JT-Code</span>}
          </NavLink>
        </div>

        <nav className="nav-links">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.name : undefined}
            >
              <span className="nav-icon">{item.icon && <item.icon size={18} />}</span>
              {!collapsed && <span className="nav-label">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Credits Card */}
        <div className={`credits-card ${collapsed ? 'collapsed' : ''}`}>
          {!collapsed ? (
            <>
              <div className="credits-card-header">
                <span className="credits-card-title">Credits</span>
                <span className="credits-card-fraction">{displayUsed} / {displayLimit}</span>
              </div>
              <div className="credits-progress">
                <div className="credits-progress-bar" style={{ width: `${percentage}%` }} />
              </div>
              <NavLink to="/app/billing" className="manage-plan">
                Manage Plan
              </NavLink>
            </>
          ) : (
            <>
              <div className="credits-mini">{Math.round(percentage)}%</div>
              <div className="credits-progress">
                <div className="credits-progress-bar" style={{ width: `${percentage}%` }} />
              </div>
            </>
          )}
        </div>

        <div className="sidebar-footer">
          {!collapsed ? (
            <Button
              variant="ghost"
              size="sm"
              className="sidebar-toggle w-full"
              onClick={() => setCollapsed(true)}
            >
              <ChevronLeft size={16} /> Collapse
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="sidebar-toggle w-full"
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
            >
              <ChevronRight size={16} />
            </Button>
          )}

          {!collapsed && isSignedIn && user && (
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium hover:bg-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full">
                  <Avatar src={avatarUrl} alt={displayName} size="sm" />
                  <span className="truncate">{displayName}</span>
                </button>
              }
              content={sidebarDropdownContent(displayName, user, navigate, onSignOut, collapsed)}
            />
          )}
        </div>
      </aside>

      <main className="main-content flex flex-col">
        <header className="flex items-center justify-end px-6 py-3 border-b border-border bg-card">
          {isSignedIn && user && (
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium hover:bg-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <Avatar src={avatarUrl} alt={displayName} size="sm" />
                  {!collapsed && <span>{displayName}</span>}
                </button>
              }
              content={headerDropdownContent(displayName, user, navigate, onSignOut)}
            />
          )}
        </header>
        <div className="flex-1 overflow-auto">
          <div className="page-wrapper">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}