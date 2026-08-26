import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  ChevronDown,
} from 'lucide-react';
import { IconButton, Select, Button } from '@/shared/components';
import { useAppStore } from '@/lib/appStore';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n/useLanguage';
import { AccountMenu } from '@/app/layouts/AccountMenu';

const publicNav = [
  { nameKey: 'chat', href: '/app/chat', icon: MessageSquare },
  { nameKey: 'images', href: '/app/images', icon: ImageIcon },
];

const authenticatedNav = [
  { nameKey: 'history', href: '/app/history', icon: History },
  { nameKey: 'billing', href: '/app/billing', icon: CreditCard },
];

type NavItem = { nameKey: string; href: string; icon: typeof MessageSquare };

function NavItems({ items, collapsed, onNavigate }: { items: NavItem[]; collapsed: boolean; onNavigate: () => void }) {
  const { t } = useTranslation();
  return items.map((item) => (
    <NavLink
      key={item.nameKey}
      to={item.href}
      title={collapsed ? t(`nav.${item.nameKey}`) : undefined}
      aria-label={collapsed ? t(`nav.${item.nameKey}`) : undefined}
      className={({ isActive }) => (isActive ? 'active' : '')}
      onClick={onNavigate}
    >
      <item.icon size={18} aria-hidden />
      {!collapsed && <span className="nav-label">{t(`nav.${item.nameKey}`)}</span>}
    </NavLink>
  ));
}

export function AppShell() {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isSignedIn, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeDrawer = () => setMobileNavOpen(false);

  return (
    <div className={`app-shell ${collapsed ? 'collapsed' : ''} ${mobileNavOpen ? 'drawer-open' : ''}`}>
      {mobileNavOpen && <div className="sidebar-backdrop" onClick={closeDrawer} aria-hidden />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Primary navigation">
        <div className="sidebar-logo-row">
          <IconButton className="mobile-only" aria-label={t('chrome.openNavigation')} onClick={() => setMobileNavOpen(true)}>
            <Menu size={18} aria-hidden />
          </IconButton>
          <NavLink to="/app/chat" className="brand" aria-label="JT-Code home">
            <span className="brand-mark">JT</span>
            {!collapsed && <span className="nav-label">JT-Code</span>}
          </NavLink>
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
            <label className="language-select-row">
              <Globe size={18} aria-hidden />
              <Select
                aria-label={t('settings.language')}
                options={languages.map((l) => ({ value: l.code, label: l.englishName }))}
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value)}
              />
              <ChevronDown size={14} aria-hidden />
            </label>
          )}
        </div>

        <nav className="nav-links compact" aria-label={t('nav.primary')}>
          <NavItems items={publicNav} collapsed={collapsed} onNavigate={closeDrawer} />
          {isSignedIn && <NavItems items={authenticatedNav} collapsed={collapsed} onNavigate={closeDrawer} />}
        </nav>

        <div className="sidebar-footer compact">
          <button type="button" onClick={toggleTheme} title={collapsed ? t('chrome.toggleTheme') : undefined} aria-label={t('chrome.toggleTheme')}>
            {resolvedTheme === 'dark' ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
            {!collapsed && <span className="footer-label">{t('chrome.theme')}</span>}
          </button>

          <AccountMenu collapsed={collapsed} />

          <button type="button" onClick={toggleSidebar} title={collapsed ? t('chrome.expandSidebar') : t('chrome.collapseSidebar')} aria-label={collapsed ? t('chrome.expandSidebar') : t('chrome.collapseSidebar')}>
            {collapsed ? <PanelLeft size={18} aria-hidden /> : <PanelLeftClose size={18} aria-hidden />}
            {!collapsed && <span className="footer-label">{t('chrome.collapse')}</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="app-header">
          <span className="sr-only">JT-Code application</span>
          {!loading && !isSignedIn && (
            <Button variant="ghost" onClick={() => { void navigate('/sign-in'); }}>
              {t('menu.signIn')}
            </Button>
          )}
        </header>
        <div className="page-scroll">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
