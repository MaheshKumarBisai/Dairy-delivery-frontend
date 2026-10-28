import type { Tone } from './format';
export type { Tone };

/** DairyFresh design tokens — the RN translation of the web CSS custom properties
 *  (`:root` block in the former ui.css). Single source of truth for colour,
 *  spacing, radii, typography and shadows across both apps. */

export const colors = {
  green: '#53B175',
  greenHover: '#489E67',
  greenActive: '#3E8E5B',
  greenLight: '#E8F5EC',
  greenPale: '#F2F9F4',
  greenDark: '#181725',

  // Modern Dark-Charcoal & Electric Lime Design System Tokens
  heroDark: '#141518',
  heroCard: '#222428',
  heroCardHover: '#2A2C31',
  lime: '#CCFF00',
  limeDark: '#121316',
  limeSoft: '#F4FEDB',

  ink: '#181725',
  ink2: '#4C4F4D',
  muted: '#7C7C7C',
  muted2: '#B1B1B1',
  line: '#E8EAEF',
  lineStrong: '#C4C4C4',
  surface: '#F2F3F2',
  surface2: '#EAEAEA',
  bg: '#F8F9FB',

  amber: '#d97706',
  amberBg: '#fef3c7',
  red: '#dc2626',
  redBg: '#fee2e2',
  blue: '#2563eb',
  blueBg: '#dbeafe',
  slateBg: '#f1f5f9',

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  star: '#f59e0b',
  starOff: '#e2e8f0',
  skeleton: '#e7eeeb',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  hero: 32,
  pill: 999,
} as const;

export const shadows = {
  xs: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  lg: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 44,
    elevation: 10,
  },
  green: {
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 6,
  },
  greenSm: {
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 4,
  },
  lime: {
    shadowColor: '#CCFF00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 5,
  },
  dark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

/** Typographic presets (sizes/weights used across both apps). */
export const typography = {
  display: { fontSize: 30, fontWeight: '800', letterSpacing: -0.6, color: colors.ink },
  h1: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4, color: colors.ink },
  h2: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3, color: colors.ink },
  h3: { fontSize: 17, fontWeight: '700', color: colors.ink },
  body: { fontSize: 15, fontWeight: '400', color: colors.ink },
  bodyStrong: { fontSize: 15, fontWeight: '600', color: colors.ink },
  small: { fontSize: 13, fontWeight: '400', color: colors.ink2 },
  caption: { fontSize: 12, fontWeight: '500', color: colors.muted },
  micro: { fontSize: 11, fontWeight: '600', color: colors.muted },
} as const;

/** Layout constants mirrored from the web app. */
export const layout = {
  navHeight: 66,
  headerHeight: 58,
  screenPadding: 18,
  contentGap: 16,
} as const;

export const toneColors: Record<Tone, { bg: string; fg: string }> = {
  green: { bg: colors.greenLight, fg: colors.greenDark },
  amber: { bg: colors.amberBg, fg: colors.amber },
  red: { bg: colors.redBg, fg: colors.red },
  blue: { bg: colors.blueBg, fg: colors.blue },
  slate: { bg: colors.slateBg, fg: colors.ink2 },
  solid: { bg: colors.green, fg: colors.white },
  lime: { bg: '#CCFF00', fg: '#141518' },
};
