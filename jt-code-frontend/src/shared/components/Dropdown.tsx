import { useState, useRef, useEffect, type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  trigger: React.ReactNode;
  content: React.ReactNode;
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, content, align = 'right', className, ...props }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={clsx('relative inline-block', className)} {...props}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={clsx(
            'absolute z-50 mt-2 min-w-[180px] rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ className, onClick, children, ...props }: HTMLAttributes<HTMLButtonElement> & { onClick?: () => void }) {
  return (
    <button
      className={clsx(
        'flex w-full items-center rounded-sm px-3 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      onClick={() => { onClick?.(); }}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('-mx-1 my-1 h-px bg-border', className)} {...props} />;
}

export function DropdownLabel({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('px-3 py-1.5 text-sm font-medium text-muted-foreground', className)} {...props}>{children}</div>;
}