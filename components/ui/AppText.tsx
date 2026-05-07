import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { colors, typography } from '../../constants/theme';

type FontWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
type TextVariant =
  | 'display'
  | 'title'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyMd'
  | 'caption'
  | 'micro';
type TextTone = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'brand' | 'success' | 'danger';

const variantStyle: Record<
  TextVariant,
  { size: number; lineHeight: number; letterSpacing?: number }
> = {
  display:  { size: typography.size['5xl'], lineHeight: typography.size['5xl'] * 1.1,  letterSpacing: -0.6 },
  title:    { size: typography.size['3xl'], lineHeight: typography.size['3xl'] * 1.2,  letterSpacing: -0.3 },
  h1:       { size: typography.size['2xl'], lineHeight: typography.size['2xl'] * 1.25, letterSpacing: -0.2 },
  h2:       { size: typography.size.xl,    lineHeight: typography.size.xl    * 1.3  },
  h3:       { size: typography.size.lg,    lineHeight: typography.size.lg    * 1.35 },
  bodyMd:   { size: typography.size.md,    lineHeight: typography.size.md    * 1.5  },
  body:     { size: typography.size.base,  lineHeight: typography.size.base  * 1.55 },
  caption:  { size: typography.size.sm,    lineHeight: typography.size.sm    * 1.45 },
  micro:    { size: typography.size.xs,    lineHeight: typography.size.xs    * 1.4,  letterSpacing: 0.5 },
};

const toneColor: Record<TextTone, string> = {
  primary:   colors.text.primary,
  secondary: colors.text.secondary,
  tertiary:  colors.text.tertiary,
  inverse:   colors.text.inverse,
  brand:     colors.brand[500],
  success:   colors.semantic.success,
  danger:    colors.semantic.danger,
};

export type AppTextProps = RNTextProps & {
  variant?: TextVariant;
  weight?: FontWeight;
  tone?: TextTone;
  align?: TextStyle['textAlign'];
};

export function AppText({
  variant = 'body',
  weight = 'regular',
  tone = 'primary',
  align,
  style,
  ...rest
}: AppTextProps) {
  const v = variantStyle[variant];
  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily:    typography.family[weight],
          fontSize:      v.size,
          lineHeight:    v.lineHeight,
          letterSpacing: v.letterSpacing,
          color:         toneColor[tone],
          textAlign:     align,
        },
        style,
      ]}
    />
  );
}
