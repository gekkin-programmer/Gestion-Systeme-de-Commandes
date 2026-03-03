'use client';

import { ICONS, type IconName } from '@/lib/icons';

interface LordIconProps {
  name: IconName;
  trigger?: 'hover' | 'click' | 'loop' | 'loop-on-hover' | 'in' | 'boomerang';
  size?: number;
  /** Format: "primary:#hexcolor,secondary:#hexcolor" */
  colors?: string;
  className?: string;
}

const DEFAULT_COLORS = 'primary:#1a1a1a,secondary:#f97316';
const WHITE_COLORS   = 'primary:#ffffff,secondary:#f97316';

export function LordIcon({
  name,
  trigger = 'hover',
  size = 24,
  colors = DEFAULT_COLORS,
  className,
}: LordIconProps) {
  return (
    <lord-icon
      src={ICONS[name]}
      trigger={trigger}
      colors={colors}
      style={{ width: size, height: size, display: 'block' }}
      class={className}
    />
  );
}

// Preset variants for common use-cases
export function LordIconWhite(props: Omit<LordIconProps, 'colors'>) {
  return <LordIcon {...props} colors={WHITE_COLORS} />;
}

export function LordIconBrand(props: Omit<LordIconProps, 'colors'>) {
  return <LordIcon {...props} colors="primary:#f97316,secondary:#1a1a1a" />;
}
