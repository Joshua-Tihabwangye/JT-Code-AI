import { forwardRef, type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={orientation}
      {...props}
    />
  )
);
Separator.displayName = 'Separator';