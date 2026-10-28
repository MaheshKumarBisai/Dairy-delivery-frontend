import type { ReactElement } from 'react';
import { Path, Circle, Rect, Ellipse, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Svg from '../ui/svg';
import { Image, Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../ui/tokens';

/** Bundled DairyFresh / DAILYMILK artwork.
 *  Uses the authentic black-and-white vintage etched cow brand mark. */

const VINTAGE_LOGO_TRANSPARENT = require('../../assets/vintage_logo_transparent.png');
const VINTAGE_LOGO_CIRCLE = require('../../assets/vintage_logo_circle.png');
const VINTAGE_LOGO_ORIGINAL = require('../../assets/vintage_logo_original.png');

export interface BrandLogoProps {
  size?: number;
  variant?: 'transparent' | 'circle' | 'original';
  style?: StyleProp<ViewStyle>;
}

/* ------------------------------------------------------------- brand mark -- */

export function BrandLogo({ size = 64, variant = 'transparent', style }: BrandLogoProps) {
  const source =
    variant === 'circle'
      ? VINTAGE_LOGO_CIRCLE
      : variant === 'original'
      ? VINTAGE_LOGO_ORIGINAL
      : VINTAGE_LOGO_TRANSPARENT;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: variant === 'circle' ? size / 2 : undefined,
        },
        style,
      ]}
    >
      <Image
        source={source}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.wordmarkRow}>
      <BrandLogo size={compact ? 34 : 46} />
      <View>
        <Text style={[styles.wordmarkTitle, { fontSize: compact ? 20 : 26 }]}>
          Dairy<Text style={styles.wordmarkAccent}>Fresh</Text>
        </Text>
        {!compact && <Text style={styles.wordmarkTagline}>Fresh Dairy, Healthier You</Text>}
      </View>
    </View>
  );
}

/* --------------------------------------------------------- product artwork -- */

function Frame({ children, tone = 'green' }: { children: React.ReactNode; tone?: 'green' | 'warm' }) {
  const id = tone === 'green' ? 'a' : 'b';
  return (
    <Svg viewBox="0 0 160 160" width="100%" height="100%">
      <Defs>
        <LinearGradient id={`df-art-bg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={tone === 'green' ? '#f0fdf4' : '#fffbeb'} />
          <Stop offset="100%" stopColor={tone === 'green' ? '#dcfce7' : '#fef3c7'} />
        </LinearGradient>
        <LinearGradient id={`df-art-shine-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <Stop offset="100%" stopColor="#e6f7ec" stopOpacity="0.2" />
        </LinearGradient>
      </Defs>
      <Rect width="160" height="160" rx="26" fill={`url(#df-art-bg-${id})`} />
      <Circle cx="126" cy="34" r="34" fill="#ffffff" opacity="0.5" />
      <Circle cx="30" cy="132" r="26" fill="#ffffff" opacity="0.45" />
      {children}
    </Svg>
  );
}

export function MilkBottleArt() {
  return (
    <Frame>
      <Ellipse cx="80" cy="134" rx="42" ry="8" fill="#16a34a" opacity="0.14" />
      <Path
        d="M64 44c0-6 4-9 4-14h24c0 5 4 8 4 14v58c0 9-7 16-16 16s-16-7-16-16z"
        fill="#ffffff"
        stroke="#cbd5e1"
        strokeWidth="2"
      />
      <Path d="M68 78h24v24c0 7-5 12-12 12s-12-5-12-12z" fill="#f8fafc" />
      <Path d="M68 86c4 3 8 4 12 4s8-1 12-4v18c0 7-5 12-12 12s-12-5-12-12z" fill="#eff6ff" />
      <Rect x="66" y="26" width="28" height="14" rx="5" fill="#16a34a" />
      <Rect x="70" y="42" width="6" height="52" rx="3" fill="#ffffff" opacity="0.9" />
      <Path d="M56 122c8 8 16 12 24 12s16-4 24-12" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Circle cx="46" cy="60" r="6" fill="#bbf7d0" />
      <Circle cx="118" cy="96" r="8" fill="#bbf7d0" opacity="0.8" />
    </Frame>
  );
}

export function CurdBowlArt() {
  return (
    <Frame>
      <Ellipse cx="80" cy="132" rx="46" ry="9" fill="#16a34a" opacity="0.14" />
      <Path d="M34 78h92c0 26-20 46-46 46S34 104 34 78z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
      <Ellipse cx="80" cy="78" rx="46" ry="15" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="2" />
      <Path d="M50 76c8-6 16-8 30-8s22 2 30 8" stroke="#86efac" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Circle cx="66" cy="72" r="5" fill="#ffffff" />
      <Circle cx="94" cy="74" r="4" fill="#ffffff" />
      <Rect x="64" y="122" width="32" height="8" rx="4" fill="#16a34a" opacity="0.55" />
      <Path d="M110 46c6-10 16-12 22-9-3 8-11 14-20 14-4 0-6-2-2-5z" fill="#4ade80" opacity="0.9" />
    </Frame>
  );
}

export function GheeJarArt() {
  return (
    <Frame tone="warm">
      <Ellipse cx="80" cy="134" rx="40" ry="8" fill="#d97706" opacity="0.16" />
      <Rect x="54" y="52" width="52" height="72" rx="14" fill="#fffbeb" stroke="#fcd34d" strokeWidth="2" />
      <Rect x="54" y="72" width="52" height="52" rx="14" fill="#fde68a" />
      <Rect x="58" y="34" width="44" height="22" rx="8" fill="#16a34a" />
      <Rect x="66" y="30" width="28" height="8" rx="4" fill="#15803d" />
      <Rect x="64" y="86" width="32" height="22" rx="6" fill="#ffffff" opacity="0.92" />
      <Path d="M72 97h16M76 92v10" stroke="#16a34a" strokeWidth="2.6" strokeLinecap="round" />
      <Rect x="62" y="60" width="8" height="44" rx="4" fill="#ffffff" opacity="0.7" />
      <Circle cx="124" cy="60" r="7" fill="#fde68a" />
      <Circle cx="36" cy="96" r="6" fill="#fde68a" />
    </Frame>
  );
}

export function PaneerArt() {
  return (
    <Frame>
      <Ellipse cx="80" cy="132" rx="44" ry="8" fill="#16a34a" opacity="0.14" />
      <Rect x="42" y="82" width="76" height="34" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
      <Rect x="50" y="56" width="34" height="30" rx="7" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
      <Rect x="86" y="60" width="30" height="26" rx="7" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
      <Path d="M58 66h6M66 74h6M96 70h6" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      <Path d="M42 100h76" stroke="#e2e8f0" strokeWidth="2" />
      <Path d="M112 34c8-8 20-8 26-4-4 8-14 14-24 12-4-1-5-5-2-8z" fill="#4ade80" />
      <Circle cx="38" cy="56" r="6" fill="#dcfce7" />
    </Frame>
  );
}

export function ButterArt() {
  return (
    <Frame tone="warm">
      <Ellipse cx="80" cy="132" rx="44" ry="8" fill="#d97706" opacity="0.16" />
      <Path d="M38 84l26-16h60l-26 16z" fill="#fef3c7" stroke="#fcd34d" strokeWidth="2" />
      <Path d="M38 84v26l60 16V100z" fill="#fde68a" stroke="#fcd34d" strokeWidth="2" />
      <Path d="M98 100v26l26-16V84z" fill="#fbbf24" stroke="#fcd34d" strokeWidth="2" />
      <Path d="M52 76l26-16 44 4-26 16z" fill="#fffbeb" />
      <Path d="M64 88v10M76 92v10" stroke="#f59e0b" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
      <Circle cx="126" cy="52" r="7" fill="#fde68a" />
    </Frame>
  );
}

export function CheeseArt() {
  return (
    <Frame tone="warm">
      <Ellipse cx="80" cy="132" rx="44" ry="8" fill="#d97706" opacity="0.16" />
      <Path d="M34 104l86-40 6 12-86 40z" fill="#fde68a" />
      <Path d="M34 104v14l86-24V76z" fill="#fbbf24" />
      <Path d="M120 76l6 12v14l-6-6z" fill="#f59e0b" />
      <Circle cx="66" cy="96" r="6" fill="#fffbeb" />
      <Circle cx="94" cy="86" r="4.5" fill="#fffbeb" />
      <Circle cx="78" cy="106" r="3.5" fill="#fffbeb" />
    </Frame>
  );
}

export function GenericDairyArt() {
  return (
    <Frame>
      <Ellipse cx="80" cy="134" rx="42" ry="8" fill="#16a34a" opacity="0.14" />
      <Path d="M60 52c0-6 5-8 5-13h30c0 5 5 7 5 13v54c0 9-8 17-20 17s-20-8-20-17z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
      <Rect x="64" y="30" width="32" height="13" rx="5" fill="#16a34a" />
      <Path d="M64 86h32v20c0 8-7 14-16 14s-16-6-16-14z" fill="#dcfce7" />
      <Path d="M46 66c-6 6-8 16-6 26" stroke="#4ade80" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Path d="M114 66c6 6 8 16 6 26" stroke="#4ade80" strokeWidth="3" fill="none" strokeLinecap="round" />
    </Frame>
  );
}

const ART_BY_KEYWORD: [RegExp, () => ReactElement][] = [
  [/milk|doodh|buttermilk|lassi|MILK/i, MilkBottleArt],
  [/curd|yogurt|dahi|yoghurt/i, CurdBowlArt],
  [/ghee|clarified/i, GheeJarArt],
  [/paneer|cheese|cottage/i, PaneerArt],
  [/butter|makhan/i, ButterArt],
];

/** Picks the closest bundled illustration for a product/category name. */
export function ProductArt({ name, category }: { name: string; category?: string }) {
  const haystack = `${name ?? ''} ${category ?? ''}`;
  if (/cheese/i.test(haystack) && !/paneer/i.test(haystack)) return <CheeseArt />;
  for (const [pattern, Art] of ART_BY_KEYWORD) {
    if (pattern.test(haystack)) return <Art />;
  }
  if (/butter/i.test(haystack)) return <ButterArt />;
  return <GenericDairyArt />;
}

/* ------------------------------------------------------------ scene art -- */

export function FarmScene({
  style,
  height = 180,
}: {
  style?: StyleProp<ViewStyle>;
  height?: number;
}) {
  return (
    <View
      style={[
        {
          width: '100%',
          height,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Svg
        viewBox="0 0 400 300"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
      <Defs>
        <LinearGradient id="df-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#e0f2fe" />
          <Stop offset="60%" stopColor="#f0fdf4" />
          <Stop offset="100%" stopColor="#ffffff" />
        </LinearGradient>
        <LinearGradient id="df-hill1" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#86efac" />
          <Stop offset="22%" stopColor="#22c55e" />
        </LinearGradient>
        <LinearGradient id="df-hill2" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#4ade80" />
          <Stop offset="100%" stopColor="#16a34a" />
        </LinearGradient>
        <LinearGradient id="df-hill3" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#16a34a" />
          <Stop offset="100%" stopColor="#14532d" />
        </LinearGradient>
      </Defs>
      <Rect width="400" height="300" fill="url(#df-sky)" />
      <Circle cx="330" cy="62" r="30" fill="#fde68a" opacity="0.85" />
      <Circle cx="330" cy="62" r="42" fill="#fde68a" opacity="0.25" />
      <Path d="M40 70c8-12 28-12 34 0 12-6 24 2 24 12H32c0-6 4-11 8-12z" fill="#ffffff" opacity="0.95" />
      <Path d="M170 46c6-9 21-9 26 0 9-5 18 2 18 9h-49c0-4 3-8 5-9z" fill="#ffffff" opacity="0.9" />
      {/* barn */}
      <Path d="M96 132l26-20 26 20v34H96z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <Path d="M92 134l30-24 30 24" stroke="#ef4444" strokeWidth="6" fill="none" strokeLinecap="round" />
      <Rect x="112" y="144" width="20" height="22" rx="3" fill="#16a34a" />
      {/* trees */}
      <Rect x="58" y="146" width="7" height="20" rx="3" fill="#92400e" />
      <Circle cx="61.5" cy="138" r="17" fill="#22c55e" />
      <Circle cx="52" cy="146" r="11" fill="#16a34a" />
      <Rect x="300" y="150" width="7" height="18" rx="3" fill="#92400e" />
      <Circle cx="303.5" cy="142" r="16" fill="#22c55e" />
      {/* hills */}
      <Path d="M0 168c60-34 118-30 172 2 46 28 108 26 228-16v146H0z" fill="url(#df-hill1)" />
      <Path d="M0 206c70-30 130-20 186 8 52 26 124 20 214-18v104H0z" fill="url(#df-hill2)" />
      {/* cow */}
      <G transform="translate(238 176)">
        <Ellipse cx="34" cy="46" rx="34" ry="19" fill="#ffffff" />
        <Ellipse cx="46" cy="40" rx="12" ry="9" fill="#f1f5f9" />
        <Path d="M14 30c-2-10 4-18 14-18 6 0 10 3 12 8" fill="#ffffff" />
        <Ellipse cx="64" cy="30" rx="14" ry="12" fill="#ffffff" />
        <Ellipse cx="72" cy="34" rx="7" ry="5" fill="#fbcfe8" />
        <Circle cx="60" cy="26" r="2.4" fill="#0f172a" />
        <Path d="M56 20c-3-6-1-11 3-12M70 19c3-6 1-11-3-12" stroke="#cbd5e1" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <Path d="M8 44c-6 4-8 12-4 18" stroke="#e2e8f0" strokeWidth="5" fill="none" strokeLinecap="round" />
        <Ellipse cx="24" cy="34" rx="7" ry="6" fill="#0f172a" opacity="0.85" />
        <Ellipse cx="40" cy="50" rx="6" ry="5" fill="#0f172a" opacity="0.85" />
        <Path d="M18 62v12M30 64v12M46 62v12M56 60v10" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
      </G>
      {/* milk bottles */}
      <G transform="translate(44 190)">
        <Path d="M14 16c0-5 4-7 4-11h16c0 4 4 6 4 11v46c0 8-6 13-12 13s-12-5-12-13z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
        <Rect x="16" y="0" width="20" height="9" rx="4" fill="#16a34a" />
        <Path d="M18 44h16v16c0 6-4 10-8 10s-8-4-8-10z" fill="#eff6ff" />
      </G>
      <G transform="translate(84 206) scale(0.82)">
        <Path d="M14 16c0-5 4-7 4-11h16c0 4 4 6 4 11v46c0 8-6 13-12 13s-12-5-12-13z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
        <Rect x="16" y="0" width="20" height="9" rx="4" fill="#15803d" />
        <Path d="M18 44h16v16c0 6-4 10-8 10s-8-4-8-10z" fill="#eff6ff" />
      </G>
      {/* splash */}
      <Path d="M0 268c40-16 84-16 128-2 46 14 96 14 148-4 44-16 88-14 124 2v36H0z" fill="#ffffff" opacity="0.92" />
      <Path d="M0 278c44-14 88-12 132 2 44 14 92 12 140-6 42-16 86-12 128 4v22H0z" fill="#f0fdf4" />
    </Svg>
    </View>
  );
}

export function OnboardingScene({ variant = 1 }: { variant?: 1 | 2 | 3 }) {
  if (variant === 2) {
    return (
      <Svg viewBox="0 0 400 260" style={{ width: '100%', aspectRatio: 400 / 260 }}>
        <Defs>
          <LinearGradient id="df-ob2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#dcfce7" />
            <Stop offset="100%" stopColor="#ffffff" />
          </LinearGradient>
        </Defs>
        <Rect width="400" height="260" rx="30" fill="url(#df-ob2)" />
        <Rect x="70" y="52" width="260" height="168" rx="24" fill="#ffffff" stroke="#bbf7d0" strokeWidth="3" />
        <Rect x="94" y="76" width="120" height="14" rx="7" fill="#dcfce7" />
        <Rect x="94" y="102" width="212" height="10" rx="5" fill="#f1f5f9" />
        <Rect x="94" y="120" width="176" height="10" rx="5" fill="#f1f5f9" />
        {[0, 1, 2, 3].map((i) => (
          <G key={i} transform={`translate(${94 + i * 54} 148)`}>
            <Circle cx="18" cy="18" r="18" fill={i % 2 ? '#16a34a' : '#dcfce7'} />
            <Path d="M11 18l5 5 9-10" stroke={i % 2 ? '#ffffff' : '#16a34a'} strokeWidth="3" fill="none" strokeLinecap="round" />
          </G>
        ))}
        <Rect x="94" y="188" width="140" height="16" rx="8" fill="#16a34a" />
        <Circle cx="330" cy="66" r="26" fill="#16a34a" />
        <Path d="M320 66l7 7 14-15" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
      </Svg>
    );
  }
  if (variant === 3) {
    return (
      <Svg viewBox="0 0 400 260" style={{ width: '100%', aspectRatio: 400 / 260 }}>
        <Defs>
          <LinearGradient id="df-ob3" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#eff6ff" />
            <Stop offset="100%" stopColor="#f0fdf4" />
          </LinearGradient>
        </Defs>
        <Rect width="400" height="260" rx="30" fill="url(#df-ob3)" />
        <Rect x="46" y="40" width="308" height="180" rx="24" fill="#eef4f1" />
        <Path d="M46 96h308M46 150h308M120 40v180M240 40v180" stroke="#dfe8e4" strokeWidth="6" />
        <Path d="M78 196c40-8 58-46 96-52s66 22 96-18 44-38 56-42" stroke="#2563eb" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="1 14" />
        <Circle cx="78" cy="196" r="14" fill="#16a34a" />
        <Path d="M78 196l0-24" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" />
        <Circle cx="326" cy="84" r="16" fill="#ef4444" />
        <Circle cx="326" cy="84" r="6" fill="#fff" />
        <G transform="translate(180 132)">
          <Circle cx="20" cy="20" r="22" fill="#ffffff" stroke="#16a34a" strokeWidth="4" />
          <Path d="M12 24l6-10 5 6 5-8" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
        </G>
      </Svg>
    );
  }
  return (
    <Svg viewBox="0 0 400 260" style={{ width: '100%', aspectRatio: 400 / 260 }}>
      <Defs>
        <LinearGradient id="df-ob1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#f0fdf4" />
          <Stop offset="100%" stopColor="#dbeafe" />
        </LinearGradient>
      </Defs>
      <Rect width="400" height="260" rx="30" fill="url(#df-ob1)" />
      <Path d="M0 196c60-26 120-26 180 0s120 26 220-6v70H0z" fill="#bbf7d0" />
      <Path d="M0 220c70-20 130-16 190 6s130 20 210-10v44H0z" fill="#86efac" />
      <G transform="translate(128 60)">
        <Path d="M44 34c0-9 7-13 7-21h44c0 8 7 12 7 21v96c0 14-11 24-29 24s-29-10-29-24z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
        <Rect x="48" y="-2" width="40" height="16" rx="7" fill="#16a34a" />
        <Path d="M50 96h46v34c0 11-9 18-23 18s-23-7-23-18z" fill="#eff6ff" />
        <Path d="M36 158c14 12 30 18 46 18s32-6 46-18" stroke="#16a34a" strokeWidth="5" fill="none" strokeLinecap="round" />
      </G>
      <G transform="translate(62 96) rotate(-8)">
        <Path d="M8 24c0-7 5-10 5-16h34c0 6 5 9 5 16v54c0 11-9 18-22 18S8 89 8 78z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
        <Rect x="11" y="0" width="33" height="13" rx="6" fill="#15803d" />
        <Path d="M14 60h27v20c0 8-6 13-13 13s-14-5-14-13z" fill="#fef3c7" />
      </G>
      <G transform="translate(268 104) rotate(7)">
        <Ellipse cx="34" cy="66" rx="34" ry="24" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
        <Ellipse cx="34" cy="52" rx="34" ry="18" fill="#fefce7" stroke="#fde68a" strokeWidth="3" />
        <Path d="M18 50c8-6 14-8 30-6" stroke="#facc15" strokeWidth="4" fill="none" strokeLinecap="round" />
      </G>
      <Circle cx="330" cy="52" r="24" fill="#fde68a" opacity="0.9" />
    </Svg>
  );
}

export function RiderScene({
  style,
  height = 160,
}: {
  style?: StyleProp<ViewStyle>;
  height?: number;
}) {
  return (
    <View
      style={[
        {
          width: '100%',
          height,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Svg
        viewBox="0 0 400 300"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
      <Defs>
        <LinearGradient id="df-rider-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#f0fdf4" />
          <Stop offset="55%" stopColor="#dcfce7" />
          <Stop offset="100%" stopColor="#bfdbfe" />
        </LinearGradient>
        <LinearGradient id="df-rider-box" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#22c55e" />
          <Stop offset="100%" stopColor="#14532d" />
        </LinearGradient>
      </Defs>
      <Rect width="400" height="300" fill="url(#df-rider-bg)" />
      <Path d="M0 236c60-24 120-24 180 0s140 24 220-8v72H0z" fill="#86efac" opacity="0.85" />
      <Path d="M0 262c80-18 150-12 220 8s120 14 180-8v38H0z" fill="#22c55e" />
      <Path d="M0 284h400v16H0z" fill="#14532d" opacity="0.35" />
      {/* pins */}
      <G transform="translate(64 62)" opacity="0.9">
        <Path d="M16 0C7 0 0 7 0 16c0 12 16 26 16 26s16-14 16-26C32 7 25 0 16 0z" fill="#16a34a" />
        <Circle cx="16" cy="16" r="6" fill="#fff" />
      </G>
      <G transform="translate(316 44)" opacity="0.9">
        <Path d="M16 0C7 0 0 7 0 16c0 12 16 26 16 26s16-14 16-26C32 7 25 0 16 0z" fill="#ef4444" />
        <Circle cx="16" cy="16" r="6" fill="#fff" />
      </G>
      {/* scooter (rear view) */}
      <G transform="translate(120 96)">
        <Ellipse cx="80" cy="176" rx="76" ry="12" fill="#14532d" opacity="0.25" />
        {/* wheels */}
        <Ellipse cx="30" cy="156" rx="16" ry="24" fill="#0f172a" />
        <Ellipse cx="30" cy="156" rx="7" ry="13" fill="#334155" />
        <Ellipse cx="132" cy="156" rx="16" ry="24" fill="#0f172a" />
        <Ellipse cx="132" cy="156" rx="7" ry="13" fill="#334155" />
        {/* body */}
        <Path d="M42 132c-6-30 8-52 40-54h24c26 2 40 18 40 44 0 18-10 30-30 34H66c-16-2-22-12-24-24z" fill="#ef4444" />
        <Path d="M50 118c8-22 26-34 52-34 20 0 34 10 40 26" fill="#dc2626" />
        <Ellipse cx="88" cy="96" rx="34" ry="12" fill="#f8fafc" />
        <Rect x="62" y="72" width="52" height="26" rx="10" fill="#e2e8f0" />
        {/* tail light */}
        <Rect x="70" y="128" width="36" height="14" rx="7" fill="#fca5a5" />
        {/* delivery box */}
        <G transform="translate(46 8)">
          <Rect x="0" y="0" width="82" height="72" rx="14" fill="url(#df-rider-box)" />
          <Rect x="8" y="8" width="66" height="56" rx="10" fill="#16a34a" />
          <Circle cx="41" cy="36" r="20" fill="#ffffff" />
          <Path d="M41 24c-5 0-9 4-9 9 0 6 9 14 9 14s9-8 9-14c0-5-4-9-9-9z" fill="#16a34a" opacity="0.18" />
          <Path d="M34 34a7 7 0 0114 0c0 5-7 11-7 11s-7-6-7-11z" fill="#16a34a" />
          <Circle cx="41" cy="34" r="3" fill="#fff" />
          <Rect x="0" y="66" width="82" height="12" rx="6" fill="#14532d" />
        </G>
        {/* rider */}
        <G transform="translate(56 -6)">
          <Path d="M24 44c0-16 12-26 28-26s28 10 28 26v22H24z" fill="#14532d" />
          <Circle cx="52" cy="8" r="20" fill="#16a34a" />
          <Path d="M36 6a16 16 0 0132 0z" fill="#15803d" />
          <Rect x="38" y="2" width="28" height="12" rx="6" fill="#0f172a" opacity="0.6" />
          <Path d="M24 40l-14 20M80 40l14 20" stroke="#14532d" strokeWidth="10" strokeLinecap="round" />
        </G>
      </G>
    </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wordmarkTitle: {
    fontWeight: '800',
    letterSpacing: -0.8,
    color: colors.greenDark,
    lineHeight: 32,
  },
  wordmarkAccent: {
    color: colors.green,
  },
  wordmarkTagline: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.muted,
    marginTop: 4,
  },
});
