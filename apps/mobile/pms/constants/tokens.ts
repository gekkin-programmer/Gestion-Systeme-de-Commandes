// ─── Design System ────────────────────────────────────────────────────────────
// Palette: Black / White / Orange
// Font: Inter

export const colors = {
  // ── Raw Palette ──────────────────────────────────────────────────────────────
  black:  '#000000',
  white:  '#FFFFFF',
  orange: '#FF4444',
  charcoal: '#424242',   // replaces black for primary text
  silver:   '#BDBDBD',   // secondary/muted text

  // ── Backgrounds ──────────────────────────────────────────────────────────────
  bg:           '#FFFFFF',   // main background
  bgDeep:       '#F5F5F5',   // subtle off-white (cards, inputs)
  surface:      '#F9F9F9',   // card surface
  surfaceRaised:'#F0F0F0',   // elevated surface

  // ── Text ─────────────────────────────────────────────────────────────────────
  textPrimary:   '#424242',  // charcoal — headings, body
  textSecondary: '#BDBDBD',  // silver — secondary labels
  textDim:       '#BDBDBD',  // placeholders, disabled

  // ── Borders ──────────────────────────────────────────────────────────────────
  line:       'rgba(0, 0, 0, 0.08)',
  lineBright: 'rgba(0, 0, 0, 0.2)',

  // ── Primary accent (CTAs, active states, highlights) ─────────────────────────
  primary:     '#FF4444',
  primaryDark: '#CC2222',
  primaryGlow: 'rgba(255, 68, 68, 0.15)',

  // ── Secondary (used sparingly) ────────────────────────────────────────────────
  secondary:     '#000000',
  secondaryDark: '#333333',
  secondaryGlow: 'rgba(0, 0, 0, 0.08)',

  // ── Status ────────────────────────────────────────────────────────────────────
  statusPending:   '#FF4444',  // orange-red — received/pending
  statusProgress:  '#FF8800',  // amber — in progress
  statusDone:      '#22AA66',  // green — completed/delivered
  statusCancelled: '#999999',  // dim — cancelled

  // ── Danger ───────────────────────────────────────────────────────────────────
  danger:     '#FF4444',
  dangerMuted:'rgba(255, 68, 68, 0.1)',

  // ── Gradient helpers ─────────────────────────────────────────────────────────
  gradientStart: '#FF4444',
  gradientMid:   '#FF7700',
  gradientEnd:   '#000000',
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const radius = {
  none: 0,
  sm:   4,
  md:   8,
  lg:   16,
  full: 999,
} as const;

export const typography = {
  // Inter — UI, forms, labels
  fontDisplay:  'Inter_700Bold',
  fontSemiBold: 'Inter_600SemiBold',
  fontBody:     'Inter_400Regular',
  fontLabel:    'Inter_500Medium',
  // Rubik — headings & display text (guest-facing screens)
  rubikRegular:  'Rubik_400Regular',
  rubikMedium:   'Rubik_500Medium',
  rubikSemiBold: 'Rubik_600SemiBold',

  size: {
    xs:      10,
    sm:      12,
    md:      14,
    base:    16,
    lg:      18,
    xl:      22,
    xxl:     28,
    display: 36,
  },

  tracking: {
    normal:  0,
    wide:    0.5,
    wider:   1.5,
    widest:  3,
  },
} as const;

export const shadows = {
  cardGlow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;
