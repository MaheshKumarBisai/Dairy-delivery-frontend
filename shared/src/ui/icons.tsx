import { createContext, useContext, type ReactNode } from 'react';
import { Circle, Path, Rect } from 'react-native-svg';
import Svg from './svg';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors } from './tokens';

/** Feather-style 24px stroke icon set used across both DairyFresh apps.
 *  Rendered with react-native-svg so the same component works on iOS, Android and web.
 *
 *  Icon colour: pass `color`, or wrap a subtree in <IconColorProvider value=...>
 *  to inherit a foreground colour (mirrors CSS `currentColor` semantics). */

const paths: Record<string, ReactNode> = {
  chevronLeft: <Path d="M15 18l-6-6 6-6" />,
  chevronRight: <Path d="M9 18l6-6-6-6" />,
  chevronDown: <Path d="M6 9.5l6 6 6-6" />,
  chevronUp: <Path d="M18 14.5l-6-6-6 6" />,
  arrowRight: <Path d="M4 12h15m-6-6l6 6-6 6" />,
  arrowLeft: <Path d="M20 12H5m6 6l-6-6 6-6" />,
  search: (
    <>
      <Circle cx="11" cy="11" r="7" />
      <Path d="M20.5 20.5L16.7 16.7" />
    </>
  ),
  bell: (
    <>
      <Path d="M18 8.5a6 6 0 10-12 0c0 6-2.5 8-2.5 8h17S18 14.5 18 8.5" />
      <Path d="M13.7 20.5a2 2 0 01-3.4 0" />
    </>
  ),
  home: (
    <>
      <Path d="M3.5 9.7L12 3l8.5 6.7V20a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 20z" />
      <Path d="M9.5 21.5V13h5v8.5" />
    </>
  ),
  grid: (
    <>
      <Rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <Rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <Rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <Rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </>
  ),
  cart: (
    <>
      <Path d="M2.5 3.5h2.4l2.3 12a2 2 0 002 1.6h8.7a2 2 0 002-1.6l1.6-7.5H6.2" />
      <Circle cx="9.5" cy="20" r="1.6" />
      <Circle cx="17.5" cy="20" r="1.6" />
    </>
  ),
  package: (
    <>
      <Path d="M20.5 16.5V7.6L12 3 3.5 7.6v8.9L12 21z" />
      <Path d="M3.8 7.8L12 12.3l8.2-4.5M12 12.3V21" />
    </>
  ),
  user: (
    <>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4.5 20.5c0-3.7 3.4-6 7.5-6s7.5 2.3 7.5 6" />
    </>
  ),
  userCircle: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Circle cx="12" cy="10" r="3" />
      <Path d="M6.4 18.9a6.2 6.2 0 0111.2 0" />
    </>
  ),
  settings: (
    <>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.2 14.6a1.5 1.5 0 00.3 1.7l.1.1a1.9 1.9 0 11-2.7 2.7l-.1-.1a1.5 1.5 0 00-1.7-.3 1.5 1.5 0 00-.9 1.4v.3a1.9 1.9 0 11-3.8 0v-.2a1.5 1.5 0 00-1-1.4 1.5 1.5 0 00-1.7.3l-.1.1a1.9 1.9 0 11-2.7-2.7l.1-.1a1.5 1.5 0 00.3-1.7 1.5 1.5 0 00-1.4-.9h-.3a1.9 1.9 0 010-3.8h.2a1.5 1.5 0 001.4-1 1.5 1.5 0 00-.3-1.7l-.1-.1a1.9 1.9 0 112.7-2.7l.1.1a1.5 1.5 0 001.7.3h.1a1.5 1.5 0 00.9-1.4v-.3a1.9 1.9 0 013.8 0v.2a1.5 1.5 0 00.9 1.4 1.5 1.5 0 001.7-.3l.1-.1a1.9 1.9 0 112.7 2.7l-.1.1a1.5 1.5 0 00-.3 1.7v.1a1.5 1.5 0 001.4.9h.3a1.9 1.9 0 010 3.8h-.2a1.5 1.5 0 00-1.4.9z" />
    </>
  ),
  plus: <Path d="M12 5.5v13M5.5 12h13" />,
  minus: <Path d="M5.5 12h13" />,
  trash: (
    <>
      <Path d="M3.5 6.5h17M9 6.5v-2a1 1 0 011-1h4a1 1 0 011 1v2" />
      <Path d="M6.3 6.5l.9 13a1.5 1.5 0 001.5 1.4h6.6a1.5 1.5 0 001.5-1.4l.9-13" />
      <Path d="M10.5 10.5v6.5M13.5 10.5v6.5" />
    </>
  ),
  check: <Path d="M4.5 12.5l5 5 10-11" />,
  checkCircle: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M8 12.4l2.8 2.8 5.4-6" />
    </>
  ),
  x: <Path d="M6 6l12 12M18 6L6 18" />,
  mapPin: (
    <>
      <Path d="M12 21.5s7-6.4 7-11.3a7 7 0 10-14 0c0 4.9 7 11.3 7 11.3z" />
      <Circle cx="12" cy="10" r="2.6" />
    </>
  ),
  navigation: <Path d="M3.5 11.2l17-7.7-7.7 17-1.9-7.6z" />,
  phone: (
    <Path d="M21.5 16.9v2.8a2 2 0 01-2.2 2 19.5 19.5 0 01-8.5-3 19.2 19.2 0 01-5.9-5.9 19.5 19.5 0 01-3-8.6 2 2 0 012-2.2h2.8a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.4 9.9a15.7 15.7 0 005.8 5.8l1.3-1.3a2 2 0 012.1-.5c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z" />
  ),
  message: (
    <Path d="M20.5 11.6a8.1 8.1 0 01-8.7 8.1 8.6 8.6 0 01-3.7-.9L3.5 20.5l1.7-4.6a8.1 8.1 0 01-.9-3.8 8.1 8.1 0 018.1-8.1 8.1 8.1 0 018.1 8.1z" />
  ),
  star: (
    <Path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.2 6.6 20.1l1-6.1L3.2 9.7l6.1-.9z" />
  ),
  starOutline: (
    <Path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.2 6.6 20.1l1-6.1L3.2 9.7l6.1-.9z" />
  ),
  heart: (
    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  ),
  heartFilled: (
    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  ),
  carrot: (
    <>
      <Path d="M14.5 4.5c1.5-1.5 3-1.5 4.5 0s1.5 3 0 4.5l-9.5 9.5a2 2 0 01-2.5.3L4 16.5l-2 2a1 1 0 01-1.4-1.4l2-2-2.3-3a2 2 0 01.3-2.5z" />
      <Path d="M12 7l5 5M9 10l3 3" />
    </>
  ),
  milk: (
    <>
      <Path d="M9.2 2.5h5.6" />
      <Path d="M9.7 2.5v3.4L8.3 8.6V19a2 2 0 002 2h3.4a2 2 0 002-2V8.6l-1.4-2.7V2.5" />
      <Path d="M8.3 13.4h7.4" />
    </>
  ),
  bowl: (
    <>
      <Path d="M4 11.5h16a8 8 0 01-8 8 8 8 0 01-8-8z" />
      <Path d="M6.8 11.5c.8-2.4 2.8-4 5.2-4s4.4 1.6 5.2 4" />
    </>
  ),
  jar: (
    <>
      <Rect x="6.6" y="3.4" width="10.8" height="3.4" rx="1.2" />
      <Path d="M7.8 6.8v11.7a2.5 2.5 0 002.5 2.5h3.4a2.5 2.5 0 002.5-2.5V6.8" />
      <Path d="M9.9 13.6c1.4-1.1 2.8-1.1 4.2 0" />
    </>
  ),
  cheese: (
    <>
      <Path d="M3.5 17.5L12 5.5l8.5 12z" />
      <Circle cx="10.2" cy="14.6" r="1" />
      <Circle cx="14.6" cy="15.4" r="0.8" />
      <Circle cx="13" cy="11" r="0.7" />
    </>
  ),
  filter: <Path d="M4 6.5h16M7 12h10M10 17.5h4" />,
  sliders: (
    <>
      <Path d="M4 7h16M4 12h16M4 17h16" />
      <Circle cx="9" cy="7" r="2.2" fill="#fff" />
      <Circle cx="15.5" cy="12" r="2.2" fill="#fff" />
      <Circle cx="7.5" cy="17" r="2.2" fill="#fff" />
    </>
  ),
  calendar: (
    <>
      <Rect x="3.5" y="5" width="17" height="16" rx="3" />
      <Path d="M8 3v4M16 3v4M3.5 10h17" />
    </>
  ),
  clock: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5.3l3.3 2" />
    </>
  ),
  sun: (
    <>
      <Circle cx="12" cy="12" r="4" />
      <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </>
  ),
  moon: <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />,
  edit: (
    <>
      <Path d="M4 20h4.2L20 8.2 15.8 4 4 15.8z" />
      <Path d="M14.2 5.6l4.2 4.2" />
    </>
  ),
  logout: (
    <>
      <Path d="M9.5 21H5.5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <Path d="M15.5 17l5-5-5-5M20.5 12H9" />
    </>
  ),
  wallet: (
    <>
      <Rect x="3" y="6" width="18" height="13" rx="3" />
      <Path d="M3 10.5h18" />
      <Path d="M16.5 14.8h.01" strokeWidth="2.6" />
    </>
  ),
  truck: (
    <>
      <Path d="M3 6.5h10.5v10H3z" />
      <Path d="M13.5 10h3.7l3.3 3.3v3.2h-7" />
      <Circle cx="7" cy="18" r="1.9" />
      <Circle cx="17" cy="18" r="1.9" />
    </>
  ),
  store: (
    <>
      <Path d="M4 9.5L5.4 4.2h13.2L20 9.5" />
      <Path d="M4 9.5h16v10.8a1 1 0 01-1 1H5a1 1 0 01-1-1z" />
      <Path d="M4 9.5a2.4 2.4 0 004 1.5 2.4 2.4 0 004 0 2.4 2.4 0 004 0 2.4 2.4 0 004-1.5" />
      <Path d="M9.8 21.3v-5.2h4.4v5.2" />
    </>
  ),
  camera: (
    <>
      <Path d="M4 8.2h2.8L8.3 6h7.4l1.5 2.2H20a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-9a1 1 0 011-1z" />
      <Circle cx="12" cy="13.6" r="3.3" />
    </>
  ),
  signature: <Path d="M3 16.5c2.6 0 3-8.5 5.6-8.5s3 8.5 5.6 8.5 2.4-3.8 5-3.8h3.8" />,
  refresh: (
    <>
      <Path d="M20.5 12a8.5 8.5 0 11-2.5-6" />
      <Path d="M20.5 4.5V10H15" />
    </>
  ),
  info: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 11.2v5M12 7.9h.01" />
    </>
  ),
  alert: (
    <>
      <Path d="M12 3.5l9 16H3z" />
      <Path d="M12 9.5v4.2M12 17h.01" />
    </>
  ),
  eye: (
    <>
      <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <Circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <Path d="M9.7 6.1A9.6 9.6 0 0112 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 01-3.2 4.1M6.4 7.7A16.7 16.7 0 002.5 12S6 18.5 12 18.5a9.4 9.4 0 003.9-.8" />
      <Path d="M3.5 3.5l17 17" />
    </>
  ),
  lock: (
    <>
      <Rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" />
      <Path d="M8.2 10.5V7.4a3.8 3.8 0 017.6 0v3.1" />
    </>
  ),
  mail: (
    <>
      <Rect x="3" y="5" width="18" height="14.5" rx="3" />
      <Path d="M3.8 7.5L12 13l8.2-5.5" />
    </>
  ),
  creditCard: (
    <>
      <Rect x="2.5" y="5.5" width="19" height="13.5" rx="3" />
      <Path d="M2.5 10h19" />
      <Path d="M6.5 14.8h3" />
    </>
  ),
  bank: (
    <>
      <Path d="M3 10.2L12 4l9 6.2" />
      <Path d="M5.2 10.5v8.2M9.7 10.5v8.2M14.3 10.5v8.2M18.8 10.5v8.2" />
      <Path d="M3 21h18" />
    </>
  ),
  smartphone: (
    <>
      <Rect x="6.5" y="2.5" width="11" height="19" rx="3" />
      <Path d="M11 18.4h2" />
    </>
  ),
  banknote: (
    <>
      <Rect x="2.5" y="6" width="19" height="12" rx="3" />
      <Circle cx="12" cy="12" r="2.6" />
      <Path d="M6 12h.01M18 12h.01" strokeWidth="2.4" />
    </>
  ),
  pause: <Path d="M9.5 5v14M14.5 5v14" strokeWidth="2.6" />,
  play: <Path d="M7.5 4.8l11.5 7.2-11.5 7.2z" />,
  skip: (
    <>
      <Path d="M5.5 5l9.5 7-9.5 7z" />
      <Path d="M18.5 5v14" />
    </>
  ),
  repeat: (
    <>
      <Path d="M16.5 2.5l4 4-4 4" />
      <Path d="M3.5 12v-2a4 4 0 014-4h13" />
      <Path d="M7.5 21.5l-4-4 4-4" />
      <Path d="M20.5 12v2a4 4 0 01-4 4h-13" />
    </>
  ),
  file: (
    <>
      <Path d="M13.8 3H7.5a2 2 0 00-2 2v14a2 2 0 002 2h9a2 2 0 002-2V7.8z" />
      <Path d="M13.5 3v5h5" />
      <Path d="M8.8 13h6.4M8.8 16.5h4.4" />
    </>
  ),
  help: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M9.6 9.6a2.5 2.5 0 014.9.7c0 1.7-2.4 2.4-2.4 2.4" />
      <Path d="M12 16.8h.01" strokeWidth="2.4" />
    </>
  ),
  gift: (
    <>
      <Path d="M20.5 12v8.5a1 1 0 01-1 1h-15a1 1 0 01-1-1V12" />
      <Rect x="2.5" y="7.5" width="19" height="4.5" rx="1" />
      <Path d="M12 21.5V7.5" />
      <Path d="M12 7.5H7.7a2.4 2.4 0 010-4.8C10.5 2.7 12 7.5 12 7.5zM12 7.5h4.3a2.4 2.4 0 000-4.8C13.5 2.7 12 7.5 12 7.5z" />
    </>
  ),
  list: (
    <>
      <Path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12" />
      <Path d="M4 6.5h.01M4 12h.01M4 17.5h.01" strokeWidth="2.4" />
    </>
  ),
  target: (
    <>
      <Circle cx="12" cy="12" r="8.5" />
      <Circle cx="12" cy="12" r="3.4" />
      <Path d="M12 1.5v3.2M12 19.3v3.2M1.5 12h3.2M19.3 12h3.2" />
    </>
  ),
  chart: (
    <>
      <Path d="M4 20.5V11M9.7 20.5V4.5M15.3 20.5v-6.8M21 20.5V8.5" strokeWidth="2.2" />
    </>
  ),
  power: (
    <>
      <Path d="M12 3.2v8.6" />
      <Path d="M6.6 6.9a8 8 0 1010.8 0" />
    </>
  ),
  leaf: (
    <>
      <Path d="M4 20c0-9 6-15 16-15 0 10-5.5 15-12 15H4z" />
      <Path d="M4 20c3.5-4.5 7-7.5 12-9.5" />
    </>
  ),
  location: (
    <>
      <Circle cx="12" cy="12" r="3.2" />
      <Circle cx="12" cy="12" r="8" />
      <Path d="M12 1.8v2.6M12 19.6v2.6M1.8 12h2.6M19.6 12h2.6" />
    </>
  ),
  basket: (
    <>
      <Path d="M3 9.5h18l-1.7 9.2a2 2 0 01-2 1.8H6.7a2 2 0 01-2-1.8z" />
      <Path d="M8 9.5l3-6M16 9.5l-3-6" />
      <Path d="M9.5 13.5v3M14.5 13.5v3" />
    </>
  ),
  sparkle: (
    <Path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM18.5 15.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" />
  ),
  route: (
    <>
      <Circle cx="6" cy="18.5" r="2.6" />
      <Circle cx="18" cy="5.5" r="2.6" />
      <Path d="M8.6 18.5H14a3.5 3.5 0 000-7h-4a3.5 3.5 0 010-7h5.4" />
    </>
  ),
  shield: (
    <>
      <Path d="M12 3l7.5 3v6c0 4.5-3.1 7.9-7.5 9-4.4-1.1-7.5-4.5-7.5-9V6z" />
      <Path d="M9 12.2l2.2 2.2 4-4.4" />
    </>
  ),
  bike: (
    <>
      <Circle cx="6" cy="17" r="3.4" />
      <Circle cx="18" cy="17" r="3.4" />
      <Path d="M6 17l4-8h5l3 8M9.5 9h5.5M13 17h-4" />
    </>
  ),
  dot: <Circle cx="12" cy="12" r="4" stroke="none" />,
};

export type IconName = keyof typeof paths;

const IconColorContext = createContext<string | undefined>(undefined);

/** Mimics CSS `currentColor` — descendants inherit the given icon colour. */
export function IconColorProvider({ color, children }: { color: string; children: ReactNode }) {
  return <IconColorContext.Provider value={color}>{children}</IconColorContext.Provider>;
}

export interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  /** Explicit colour; falls back to the nearest IconColorProvider, then to ink. */
  color?: string;
  fill?: string;
  style?: StyleProp<ViewStyle>;
}

const SOLID_ICONS: IconName[] = ['dot', 'star', 'heartFilled'];

export function Icon({
  name,
  size = 21,
  strokeWidth = 1.9,
  color,
  fill,
  style,
}: IconProps) {
  const inherited = useContext(IconColorContext);
  const stroke = color ?? inherited ?? colors.ink;
  const isSolid = SOLID_ICONS.includes(name);
  const effectiveFill = fill ?? (isSolid ? stroke : 'none');
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={effectiveFill}
      stroke={isSolid && !fill ? 'none' : stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {paths[name]}
    </Svg>
  );
}

export const iconNames = Object.keys(paths) as IconName[];

/** Maps a backend category name to its most related icon (shared by Home and
 *  Categories so the two screens never drift apart). */
export function categoryIconName(name: string): IconName {
  const n = name.toLowerCase();
  if (/(curd|yog|dahi|lassi|cream|malai)/.test(n)) return 'bowl';
  if (/milk/.test(n)) return 'milk';
  if (/(ghee|butter|oil)/.test(n)) return 'jar';
  if (/(paneer|cheese)/.test(n)) return 'cheese';
  if (/(sweet|dessert|mithai|kheer)/.test(n)) return 'gift';
  return 'grid';
}
