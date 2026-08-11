import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MessageCircle, Image as ImageIcon, CreditCard, Settings as SettingsIcon } from 'lucide-react';
import { UserButton } from '@clerk/react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components';
import { useApiClient } from '@/lib/api/client';
import { getWallet, getUsage, getSubscription } from '@/features/billing/api';

const navigation = [
  { name: 'Chat', href: '/app/chat', icon: MessageCircle },
  { name: 'Image Studio', href: '/app/image', icon: ImageIcon },
  { name: 'Billing', href: '/app/billing', icon: CreditCard },
  { name: 'Settings', href: '/app/settings', icon: SettingsIcon },
];

export function AppShell() {
  const client = useApiClient();
  const [collapsed, setCollapsed] = useState(false);

  const wallet = useQuery({ queryKey: ['wallet'], queryFn: () => getWallet(client) });
  const usage = useQuery({ queryKey: ['usage'], queryFn: () => getUsage(client) });
  const subscription = useQuery({ queryKey: ['subscription'], queryFn: () => getSubscription(client) });

  const limit = subscription.data?.plan?.monthly_credits ?? 5000;
  const used = usage.data?.total_credits ?? 0;
  const percentage = Math.min(100, Math.max(0, limit > 0 ? (used / limit) * 100 : 0));
  const displayUsed = used.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const displayLimit = limit.toLocaleString();

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
        </div>
      </aside>

      <main className="main-content flex flex-col">
        <header className="flex items-center justify-end px-6 py-3 border-b border-border bg-card">
          <UserButton showName={false} />
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
