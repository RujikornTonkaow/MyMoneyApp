import { Platform, StyleSheet, View, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { blurIntensity, colors, radii, shadows } from '../../constants/theme';

type GlassTone = 'light' | 'tint' | 'dark';

type GlassCardProps = ViewProps & {
  intensity?: keyof typeof blurIntensity;
  tone?: GlassTone;
  radius?: keyof typeof radii;
  shadow?: keyof typeof shadows;
  withBorder?: boolean;
};

const iosTintByTone: Record<GlassTone, 'light' | 'default' | 'dark'> = {
  light: 'light',
  tint:  'light',
  dark:  'dark',
};

/**
 * ROOT FIX: Opacity must be LOW (0.15–0.30) for the card to look
 * like glass. High opacity (0.75+) makes it look like a solid card.
 *
 * The glass effect = seeing the background color/content THROUGH the card.
 */
const baseBgByTone: Record<GlassTone, string> = {
  light: 'rgba(255, 255, 255, 0.18)',   // was 0.75 → now 0.18
  tint:  'rgba(255, 250, 240, 0.22)',   // was 0.80 → now 0.22
  dark:  'rgba(30,  15,  5,   0.35)',   // was 0.58 → now 0.35
};

/**
 * Inner shine — the bright catch from above that sells "glass".
 * Must be gentle (0.20–0.30) to not obscure the transparency.
 */
const shineByTone: Record<GlassTone, [string, string, string]> = {
  light: ['rgba(255,255,255,0.40)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.00)'],
  tint:  ['rgba(255,248,230,0.35)', 'rgba(255,248,230,0.06)', 'rgba(255,248,230,0.00)'],
  dark:  ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)', 'rgba(255,255,255,0.00)'],
};

/**
 * Border is the #1 visual cue that makes a surface look like glass.
 * Brighter at top-left (light source), dimmer at bottom-right.
 */
const borderTopByTone: Record<GlassTone, string> = {
  light: 'rgba(255, 255, 255, 0.80)',   // bright white top edge
  tint:  'rgba(255, 250, 230, 0.75)',
  dark:  'rgba(255, 220, 160, 0.25)',
};

const borderBottomByTone: Record<GlassTone, string> = {
  light: 'rgba(200, 170, 120, 0.25)',   // warm subtle bottom edge
  tint:  'rgba(200, 160, 100, 0.30)',
  dark:  'rgba(0,   0,   0,   0.40)',
};

/**
 * Frosted glass card — the key principle is LOW background opacity
 * so the underlying page color/content shows through.
 *
 * iOS     → native BlurView (real blur)
 * Web     → CSS backdropFilter: blur()
 * Android → translucent base + inner-shine gradient
 */
export function GlassCard({
  intensity = 'regular',
  tone = 'light',
  radius = 'xl',
  shadow = 'sm',
  withBorder = true,
  style,
  children,
  ...rest
}: GlassCardProps) {
  const borderRadius = radii[radius];
  const shadowStyle  = shadows[shadow];

  const sharedOuter = {
    borderRadius,
    overflow: 'hidden' as const,
  };

  // Inner border overlay — bright top/left, dim bottom/right (like real glass)
  const innerBorderOverlay = withBorder ? (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius,
          borderWidth:       1.2,
          borderTopColor:    borderTopByTone[tone],
          borderLeftColor:   borderTopByTone[tone],
          borderBottomColor: borderBottomByTone[tone],
          borderRightColor:  borderBottomByTone[tone],
        },
      ]}
      pointerEvents="none"
    />
  ) : null;

  // Shine gradient (light catch from above)
  const shineOverlay = (
    <LinearGradient
      colors={shineByTone[tone]}
      locations={[0, 0.4, 1]}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );

  // ── iOS: native BlurView ──────────────────────────────────────────────

  if (Platform.OS === 'ios') {
    return (
      <View {...rest} style={[sharedOuter, shadowStyle, style]}>
        <BlurView
          intensity={blurIntensity[intensity]}
          tint={iosTintByTone[tone]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {/* Tinted base over blur so it's not pure blur */}
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: baseBgByTone[tone] }]}
          pointerEvents="none"
        />
        {shineOverlay}
        {innerBorderOverlay}
        {children}
      </View>
    );
  }

  // ── Web: CSS backdropFilter ───────────────────────────────────────────

  if (Platform.OS === 'web') {
    const webBlurStyle = {
      backdropFilter:       `blur(${blurIntensity[intensity]}px)`,
      WebkitBackdropFilter: `blur(${blurIntensity[intensity]}px)`,
      backgroundColor:      baseBgByTone[tone],
    } as never;

    return (
      <View {...rest} style={[sharedOuter, shadowStyle, webBlurStyle, style]}>
        {shineOverlay}
        {innerBorderOverlay}
        {children}
      </View>
    );
  }

  // ── Android: glass illusion ───────────────────────────────────────────

  return (
    <View {...rest} style={[sharedOuter, shadowStyle, style]}>
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: baseBgByTone[tone] }]}
        pointerEvents="none"
      />
      {shineOverlay}
      {innerBorderOverlay}
      {children}
    </View>
  );
}
