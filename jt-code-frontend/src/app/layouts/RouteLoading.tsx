import { Spinner } from '@/shared/components';

interface RouteLoadingProps {
  label?: string;
}

// Branded loading shell used while auth/repository bootstrap is in flight
// (replaces the previous blank `null` returns in route guards).
export function RouteLoading({ label = 'Loading JT-Code' }: RouteLoadingProps) {
  return (
    <div className="route-loading">
      <span className="brand-mark">JT</span>
      <Spinner />
      <p>{label}</p>
    </div>
  );
}
