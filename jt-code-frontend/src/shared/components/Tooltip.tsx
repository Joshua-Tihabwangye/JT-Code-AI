import { useId, useState, type ReactNode } from 'react';
import { clsx } from 'clsx';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'right' | 'left';
}

// Lightweight accessible tooltip: the trigger is described by the tooltip via
// aria-describedby, and the tooltip is also shown on hover/focus visually.
export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span
      className="tooltip-root"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined}>{children}</span>
      <span role="tooltip" id={id} className={clsx('tooltip', `tooltip-${side}`, open ? 'tooltip-open' : '')} hidden={!open}>
        {content}
      </span>
    </span>
  );
}
