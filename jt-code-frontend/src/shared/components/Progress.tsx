import { clsx } from 'clsx';

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

export function Progress({ value, max = 100, label, className }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={clsx('progress', className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div className="progress-bar" style={{ width: `${clamped}%` }} />
    </div>
  );
}
