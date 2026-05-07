import { useCallback, useRef } from 'react';
import {
  Animated,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { colors, radii, shadows, spacing } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label:      string;
  variant?:   Variant;
  size?:      Size;
  iconLeft?:  keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  loading?:   boolean;
  haptic?:    boolean;
  fullWidth?: boolean;
  style?:     ViewStyle;
};

const sizePad: Record<Size, { ph: number; pv: number; icon: number }> = {
  sm: { ph: spacing['4'],    pv: spacing['2'],     icon: 16 },
  md: { ph: spacing['5'],    pv: spacing['3'] + 2, icon: 18 },
  lg: { ph: spacing['5'],    pv: spacing['4'],     icon: 20 },
};

const sizeVariant: Record<Size, 'caption' | 'bodyMd' | 'h3'> = {
  sm: 'caption',
  md: 'bodyMd',
  lg: 'h3',
};

export function Button({
  label,
  variant  = 'primary',
  size     = 'md',
  iconLeft,
  iconRight,
  loading  = false,
  haptic   = true,
  fullWidth= false,
  disabled,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const pad   = sizePad[size];

  const onPressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  }, [scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
  }, [scale]);

  const handlePress: PressableProps['onPress'] = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
      if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onPress?.(e);
    },
    [haptic, onPress],
  );

  const isDisabled = disabled || loading;
  const isColored  = variant === 'primary' || variant === 'danger';
  const iconColor  = isColored ? '#FFFFFF' : colors.brand[500];

  const padBox: ViewStyle = {
    paddingHorizontal: pad.ph,
    paddingVertical:   pad.pv,
    borderRadius:      radii.xl,
    alignItems:        'center',
    justifyContent:    'center',
  };

  const content = (
    <View style={styles.row}>
      {loading ? (
        <ActivityIndicator color={isColored ? '#FFFFFF' : colors.brand[500]} />
      ) : (
        <>
          {iconLeft  && <Ionicons name={iconLeft}  size={pad.icon} color={iconColor} style={{ marginRight: 8 }} />}
          <AppText
            variant={sizeVariant[size]}
            weight="semibold"
            tone={isColored ? 'inverse' : 'brand'}
          >
            {label}
          </AppText>
          {iconRight && <Ionicons name={iconRight} size={pad.icon} color={iconColor} style={{ marginLeft: 8 }} />}
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <AnimatedPressable
        accessibilityRole="button"
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          { width: fullWidth ? '100%' : undefined, opacity: isDisabled ? 0.6 : 1, transform: [{ scale }] },
          shadows.brand,
          style,
        ]}
        {...rest}
      >
        <LinearGradient
          colors={[colors.brand[400], colors.brand[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={padBox}
        >
          {content}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  if (variant === 'danger') {
    return (
      <AnimatedPressable
        accessibilityRole="button"
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          { width: fullWidth ? '100%' : undefined, opacity: isDisabled ? 0.6 : 1, transform: [{ scale }] },
          shadows.sm,
          style,
        ]}
        {...rest}
      >
        <LinearGradient
          colors={colors.gradient.expense}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={padBox}
        >
          {content}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  const isGhost = variant === 'ghost';
  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        padBox,
        {
          width:           fullWidth ? '100%' : undefined,
          backgroundColor: isGhost ? 'transparent' : colors.surface.white,
          borderWidth:     isGhost ? 0 : 1,
          borderColor:     colors.border.default,
          opacity:         isDisabled ? 0.6 : 1,
          transform:       [{ scale }],
        },
        isGhost ? null : shadows.xs,
        style,
      ]}
      {...rest}
    >
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
