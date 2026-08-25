import { Link, useNavigate, type NavigateFunction } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Avatar, Dropdown, DropdownItem, DropdownSeparator, DropdownLabel } from '@/shared/components';
import { useAuth, useUser, supabase, type SupabaseUser } from '@/lib/supabase';
import { LogOut, Settings } from 'lucide-react';

const headerDropdownContent = (
  displayName: string,
  user: SupabaseUser,
  navigate: NavigateFunction,
  handleSignOut: () => void,
  t: (key: string) => string,
) => (
  <>
    <DropdownLabel>
      <div className="px-2 py-1.5 text-sm">
        <div className="font-medium">{displayName}</div>
        <div className="text-muted-foreground">{user.email}</div>
      </div>
    </DropdownLabel>
    <DropdownSeparator />
    <DropdownItem onClick={() => void navigate('/app/settings')}>
      <Settings size={16} className="mr-2" />
      {t('menu.profileAndSettings')}
    </DropdownItem>
    <DropdownSeparator />
    <DropdownItem onClick={handleSignOut}>
      <LogOut size={16} className="mr-2" />
      {t('menu.signOut')}
    </DropdownItem>
  </>
);

export function Header() {
  const { isSignedIn } = useAuth();
  const user = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    void navigate('/sign-in');
  };

  if (isSignedIn && user) {
    const displayName =
      String(user.user_metadata?.full_name ?? '') ||
      String(user.user_metadata?.name ?? '') ||
      user.email ||
      t('menu.account');
    const avatarUrl =
      typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : undefined;

    return (
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Dropdown
            trigger={
              <button className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium hover:bg-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <Avatar src={avatarUrl} alt={displayName} size="sm" />
                <span>{displayName}</span>
              </button>
            }
            content={headerDropdownContent(displayName, user, navigate, () => void handleSignOut(), t)}
          />
        </div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/sign-in">{t('menu.signIn')}</Link>
        </Button>
        <Button variant="primary" size="sm" asChild>
          <Link to="/sign-up">{t('menu.getStarted')}</Link>
        </Button>
      </div>
    </header>
  );
}