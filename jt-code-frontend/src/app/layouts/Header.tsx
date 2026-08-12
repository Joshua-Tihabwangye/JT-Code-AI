import { Link, useNavigate } from 'react-router-dom';
import { Button, Avatar, Dropdown, DropdownItem, DropdownSeparator, DropdownLabel } from '@/shared/components';
import { useAuth, useUser, supabase } from '@/lib/supabase';
import { LogOut, Settings } from 'lucide-react';

export function Header() {
  const { isSignedIn } = useAuth();
  const user = useUser();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/sign-in');
  };

  if (isSignedIn && user) {
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email ||
      'Account';

    return (
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Dropdown
            trigger={
              <button className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium hover:bg-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <Avatar src={user.user_metadata?.avatar_url} alt={displayName} size="sm" />
                <span>{displayName}</span>
              </button>
            }
          >
            <DropdownLabel>
              <div className="px-2 py-1.5 text-sm">
                <div className="font-medium">{displayName}</div>
                <div className="text-muted-foreground">{user.email}</div>
              </div>
            </DropdownLabel>
            <DropdownSeparator />
            <DropdownItem onClick={() => navigate('/app/settings')}>
              <Settings size={16} className="mr-2" />
              Profile & Settings
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem onClick={handleSignOut}>
              <LogOut size={16} className="mr-2" />
              Sign out
            </DropdownItem>
          </Dropdown>
        </div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/sign-in">Sign In</Link>
        </Button>
        <Button variant="primary" size="sm" asChild>
          <Link to="/sign-up">Get Started</Link>
        </Button>
      </div>
    </header>
  );
}
