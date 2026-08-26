import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell';

// Mock dependencies
vi.mock('@/lib/appStore', () => ({
  useAppStore: (selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      sidebarCollapsed: false,
      toggleSidebar: vi.fn(),
    };
    return selector(state);
  },
}));

vi.mock('@/lib/theme', () => ({
  useTheme: () => ({
    resolvedTheme: 'dark',
    toggleTheme: vi.fn(),
  }),
}));

vi.mock('@/lib/supabase', () => ({
  useAuth: () => ({ isSignedIn: false }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'chrome.openNavigation': 'Open navigation',
        'chrome.closeNavigation': 'Close navigation',
        'chrome.toggleTheme': 'Toggle theme',
        'chrome.theme': 'Theme',
        'chrome.expandSidebar': 'Expand sidebar',
        'chrome.collapseSidebar': 'Collapse sidebar',
        'chrome.collapse': 'Collapse',
        'nav.primary': 'Primary',
        'nav.chat': 'Chat',
        'nav.images': 'Images',
        'menu.signIn': 'Sign in',
      };
      return translations[key] ?? key;
    },
  }),
}));

vi.mock('@/i18n/LanguageMenu', () => ({
  LanguageMenu: ({ collapsed }: { collapsed?: boolean }) => (
    <div data-testid="language-menu" data-collapsed={collapsed}>Language Menu</div>
  ),
}));

vi.mock('@/app/layouts/AccountMenu', () => ({
  AccountMenu: ({ collapsed }: { collapsed?: boolean }) => (
    <div data-testid="account-menu" data-collapsed={collapsed}>Account Menu</div>
  ),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Page content</div>,
  };
});

function renderWithRouter(ui: React.ReactNode) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('AppShell', () => {
  it('renders the mobile topbar with hamburger button', () => {
    renderWithRouter(<AppShell />);
    const hamburger = screen.getByRole('button', { name: /open navigation/i });
    expect(hamburger).toBeInTheDocument();
  });

  it('mobile topbar has correct CSS class', () => {
    const { container } = renderWithRouter(<AppShell />);
    const topbar = container.querySelector('.mobile-topbar');
    expect(topbar).toBeInTheDocument();
  });

  it('renders brand text in mobile topbar', () => {
    renderWithRouter(<AppShell />);
    expect(screen.getAllByText('JT-Code').length).toBeGreaterThanOrEqual(1);
  });

  it('toggles drawer on hamburger click', () => {
    renderWithRouter(<AppShell />);
    const hamburger = screen.getByRole('button', { name: /open navigation/i });
    fireEvent.click(hamburger);
    // After click, the label should change to "Close navigation"
    expect(screen.getByRole('button', { name: /close navigation/i })).toBeInTheDocument();
  });

  it('renders sidebar with language menu and account menu', () => {
    renderWithRouter(<AppShell />);
    expect(screen.getByTestId('language-menu')).toBeInTheDocument();
    expect(screen.getByTestId('account-menu')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithRouter(<AppShell />);
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Images')).toBeInTheDocument();
  });
});
