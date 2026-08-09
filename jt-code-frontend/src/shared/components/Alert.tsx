import { forwardRef, type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  onClose?: () => void;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', children, onClose, ...props }, ref) => {
    const variants = {
      default: 'border-border bg-background',
      destructive: 'border-destructive/50 bg-destructive/10 text-destructive',
      success: 'border-green-500/50 bg-green-500/10 text-green-900 dark:text-green-100',
      warning: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-900 dark:text-yellow-100',
    };

    return (
      <div
        ref={ref}
        className={clsx('relative w-full rounded-lg border p-4', variants[variant], className)}
        role="alert"
        {...props}
      >
        {children}
        {onClose && (
          <button
            type="button"
            className="absolute right-2 top-2 rounded-sm p-0.5 hover:bg-background/50"
            onClick={onClose}
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = 'Alert';