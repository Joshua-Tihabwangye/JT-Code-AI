import { forwardRef, type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
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
      </div>
    );
  }
);
Alert.displayName = 'Alert';