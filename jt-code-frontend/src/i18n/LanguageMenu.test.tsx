import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageMenu } from './LanguageMenu';

// Mock the useLanguage hook - use the actual module path
const mockSetLanguage = vi.fn();
vi.mock('./useLanguage', () => ({
  useLanguage: () => ({
    currentLanguage: 'en',
    setLanguage: mockSetLanguage,
    languages: [
      { code: 'en', englishName: 'English', nativeName: 'English' },
      { code: 'fr', englishName: 'French', nativeName: 'Français' },
      { code: 'ar', englishName: 'Arabic', nativeName: 'العربية', rtl: true },
    ],
  }),
}));

describe('LanguageMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the language trigger button', () => {
    render(<LanguageMenu />);
    expect(screen.getByRole('button', { name: /English/i })).toBeInTheDocument();
  });

  it('applies collapsed class when collapsed prop is true', () => {
    const { container } = render(<LanguageMenu collapsed />);
    expect(container.querySelector('.language-menu')).toHaveClass('language-menu--collapsed');
  });

  it('does not apply collapsed class by default', () => {
    const { container } = render(<LanguageMenu />);
    expect(container.querySelector('.language-menu')).not.toHaveClass('language-menu--collapsed');
  });

  it('opens popover on click and shows language options', () => {
    render(<LanguageMenu />);
    const trigger = screen.getByRole('button', { name: /English/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /English/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Français/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /العربية/ })).toBeInTheDocument();
  });

  it('language options have aria-selected attribute', () => {
    render(<LanguageMenu />);
    fireEvent.click(screen.getByRole('button', { name: /English/i }));
    const englishOption = screen.getByRole('option', { name: /English/ });
    expect(englishOption).toHaveAttribute('aria-selected', 'true');
    const frenchOption = screen.getByRole('option', { name: /Français/ });
    expect(frenchOption).toHaveAttribute('aria-selected', 'false');
  });

  it('selecting a language calls setLanguage and closes popover', () => {
    render(<LanguageMenu />);
    fireEvent.click(screen.getByRole('button', { name: /English/i }));
    fireEvent.click(screen.getByRole('option', { name: /Français/ }));
    expect(mockSetLanguage).toHaveBeenCalledWith('fr');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
