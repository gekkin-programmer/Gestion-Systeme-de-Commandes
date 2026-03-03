import type { CSSProperties } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': {
        src?: string;
        trigger?: 'hover' | 'click' | 'loop' | 'loop-on-hover' | 'morph' | 'boomerang' | 'in' | 'sequence';
        colors?: string;
        style?: CSSProperties;
        class?: string;
        target?: string;
        state?: string;
        delay?: number | string;
        speed?: number | string;
      };
    }
  }
}
