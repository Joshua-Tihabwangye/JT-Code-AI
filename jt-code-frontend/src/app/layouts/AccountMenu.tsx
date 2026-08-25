import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Keyboard, type LucideIcon } from 'lucide-react';
import { Avatar, Badge } from '@/shared/components';
import { supabase, useAuth, useUser } from '@/lib/supabase';

interface AccountMenuProps {
  collapsed: boolean;
}

export function AccountMenu({ collapsed }: AccountMenuProps) {
  const user = useUser();
  const { isSignedIn } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const displayName =
    String(user?.user_metadata?.full_name ?? '') ||
    String(user?.user_metadata?.name ?? '') ||
    user?.email ||
    t('menu.account');
  const email = user?.email ?? '';
  const avatarUrl = typeof user?.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : undefined;
  const plan = String(user?.user_metadata?.plan ?? 'Free');

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (
        !menuRef.current?.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  useEffect(() => {
    if (open) {
      const first = menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]');
      first?.focus();
    }
  }, [open]);

  const closeAnd = (action: () => void | Promise<void>) => () => {
    setOpen(false);
    buttonRef.current?.focus();
    void action();
  };

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [],
    );
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    void navigate('/sign-in');
  };

  if (!isSignedIn || !user) return null;

  const items: { label: string; icon: LucideIcon; onClick: () => void }[] = [
    { label: t('menu.settings'), icon: Settings, onClick: closeAnd(() => navigate('/app/settings')) },
    {
      label: t('menu.keyboardShortcuts'),
      icon: Keyboard,
      onClick: closeAnd(() => navigate('/app/settings')),
    },
  ];

  return (
    <div className="account-menu-root">
      <button
        ref={buttonRef}
        type="button"
        className="account-row"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        title={collapsed ? displayName : undefined}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Avatar src={avatarUrl} alt={displayName} size="sm" />
        {!collapsed && <span className="footer-label truncate">{displayName}</span>}
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={t('menu.account')}
          className={`account-popover ${collapsed ? 'collapsed' : ''}`}
          onKeyDown={onMenuKeyDown}
        >
          <div className="account-popover-header">
            <Avatar src={avatarUrl} alt={displayName} size="md" />
            <div className="min-w-0">
              <div className="account-popover-name">{displayName}</div>
              <div className="account-popover-email">{email}</div>
            </div>
            <Badge variant="secondary" className="account-plan-badge">
              {plan}
            </Badge>
          </div>
          <div className="account-popover-separator" />
          {items.map((item) => (
            <button key={item.label} type="button" role="menuitem" className="account-popover-item" onClick={item.onClick}>
              <item.icon size={16} aria-hidden />
              <span>{item.label}</span>
            </button>
          ))}
          <div className="account-popover-separator" />
          <button
            type="button"
            role="menuitem"
            className="account-popover-item danger"
            onClick={closeAnd(() => signOut())}
          >
            <LogOut size={16} aria-hidden />
            <span>{t('menu.signOut')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
