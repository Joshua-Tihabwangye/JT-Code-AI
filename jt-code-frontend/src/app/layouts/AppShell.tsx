import { useState } from 'react';
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
  Globe,
} from 'lucide-react';
import { IconButton, Select } from '@/shared/components';
import { useAppStore } from '@/lib/appStore';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n/useLanguage';
import { AccountMenu } from '@/app/layouts/AccountMenu';

const primaryNav = [
  { name: 'Chat', href: '/app/chat', icon: MessageSquare },
  { name: 'Images', href: '/app/image', icon: ImageIcon },
  { name: 'History', href: '/app/history', icon: History },
];

const accountNav = [
  { name: 'Billing', href: '/app/billing', icon: CreditCard },
];

type NavItem = { name: string; href: string; icon: typeof MessageSquare };

function PrimaryNavItems({ isSignedIn }: { isSignedIn: boolean }) {
  const items = isSignedIn
    ? primaryNav
    : primaryNav.filter((item) => item.name !== 'History');

  return items.map((item) => ({ ...item, name: item.name }));
}

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
  const { t } = useTranslation();
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isSignedIn } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeDrawer = () => setMobileNavOpen(false);

  return (
    <div className={`app-shell ${collapsed ? 'collapsed' : ''} ${mobileNavOpen ? 'drawer-open' : ''}`}>
      {mobileNavOpen && <div className="sidebar-backdrop" onClick={closeDrawer} aria-hidden />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Primary navigation">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconButton className="mobile-only" aria-label={t('chrome.openNavigation')} onClick={() => setMobileNavOpen(true)}>
              <Menu size={18} aria-hidden />
            </IconButton>
            <NavLink to="/app/chat" className="brand" aria-label="JT-Code home">
              <span className="brand-mark">JT</span>
              {!collapsed && <span className="nav-label">JT-Code</span>}
            </NavLink>
          </div>
        </div>

        <div className="sidebar-language">
          {collapsed ? (
            <button
              type="button"
              className="sidebar-icon-button"
              title={t('settings.language')}
              aria-label={t('settings.language')}
              onClick={toggleSidebar}
            >
              <Globe size={18} aria-hidden />
            </button>
          ) : (
            <>
              <span className="nav-section-label">{t('settings.language')}</span>
              <Select
                aria-label={t('settings.language')}
                options={languages.map((l) => ({ value: l.code, label: `${l.nativeName} — ${l.englishName}` }))}
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </>
          )}
        </div>

        <nav className="nav-links compact">
          <NavSection label={t('nav.primary')} items={PrimaryNavItems({ isSignedIn })} collapsed={collapsed} onNavigate={closeDrawer} />

          <NavSection
            label={t('nav.account')}
            items={isSignedIn ? accountNav.map((i) => ({ ...i, name: t(`nav.${i.name.toLowerCase()}`) })) : []}
            collapsed={collapsed}
            onNavigate={closeDrawer}
          />
        </nav>

        <div className="sidebar-footer compact">
          <button type="button" onClick={toggleTheme} title={collapsed ? t('chrome.toggleTheme') : undefined}>
            {resolvedTheme === 'dark' ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
            {!collapsed && <span className="footer-label">{t('chrome.theme')}</span>}
          </button>

          <AccountMenu collapsed={collapsed} />

          <button type="button" onClick={toggleSidebar} title={collapsed ? t('chrome.expandSidebar') : t('chrome.collapseSidebar')}>
            {collapsed ? <PanelLeft size={18} aria-hidden /> : <PanelLeftClose size={18} aria-hidden />}
            {!collapsed && <span className="footer-label">{t('chrome.collapse')}</span>}
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