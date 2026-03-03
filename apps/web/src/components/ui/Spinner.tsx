import { LordIcon } from './LordIcon';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 48, className }: SpinnerProps) {
  return (
    <div className={className}>
      <LordIcon name="loading" trigger="loop" size={size} colors="primary:#f97316,secondary:#1a1a1a" />
    </div>
  );
}
