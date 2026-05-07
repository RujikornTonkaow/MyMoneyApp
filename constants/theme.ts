/**
 * Design System — Light Earth Tone Glassmorphism
 *
 * Base color: #F3EAD8 (warm linen/sand)
 * Palette: warm sand, caramel, sage, soft coral — all in pastel/light register.
 */

export const colors = {
  // Brand — warm caramel (medium, not dark)
  brand: {
    50:  '#FAF4EA',
    100: '#F5E8D2',
    200: '#EDCFA6',
    300: '#E0B478',
    400: '#CFA058',   // light caramel
    500: '#B8844A',   // main brand
    600: '#9B6C38',
    700: '#7D5428',
    800: '#604018',
    900: '#3D2A10',
  },
  // Surfaces — warm sand tones
  surface: {
    base:      '#F3EAD8',              // main background (user-specified)
    raised:    '#FAF6EF',              // elevated card background
    white:     '#FFFDF9',              // near-white warm
    glass:     'rgba(255,252,246,0.65)',  // very transparent warm glass
    glassDark: 'rgba(50,28,10,0.50)',
    overlay:   'rgba(40,22,8,0.40)',
  },
  // Text — warm brown scale (lighter than before)
  text: {
    primary:   '#3D2B1F',   // warm espresso
    secondary: '#7A5C44',   // medium warm brown
    tertiary:  '#A88A72',   // light warm tan
    inverse:   '#FFFDF9',
    onAccent:  '#FFFFFF',
  },
  // Borders — warm golden tones (very subtle)
  border: {
    subtle:  'rgba(180,140,85,0.08)',
    default: 'rgba(180,140,85,0.14)',
    strong:  'rgba(180,140,85,0.24)',
    glass:   'rgba(210,180,130,0.28)',
  },
  // Semantic — all pastel/soft tones
  semantic: {
    success:      '#6AAF7C',                  // soft sage green
    successSoft:  'rgba(106,175,124,0.14)',
    successLight: '#BCDEC7',
    danger:       '#D4836C',                  // soft coral (NOT dark red)
    dangerSoft:   'rgba(212,131,108,0.14)',
    dangerLight:  '#EEC4B8',
    warning:      '#C8A450',
    warningSoft:  'rgba(200,164,80,0.14)',
    info:         '#7898B8',
    infoSoft:     'rgba(120,152,184,0.14)',
  },
  // Gradient presets
  gradient: {
    brand:          ['#E0B87A', '#CFA058', '#9B6C38'] as const,
    brandSoft:      ['#F0D8A8', '#E0B070'] as const,
    sky:            ['#F3EAD8', '#FAF6EF', '#FFFDF9'] as const,
    header:         ['#ECD5A8', '#D4A868', '#B08040'] as const,  // light caramel
    expense:        ['#F4C8B8', '#E8A090', '#D4836C'] as const,  // pastel coral
    income:         ['#B8D8C4', '#8AC49A', '#6AAF7C'] as const,  // pastel sage
    glassHighlight: ['rgba(255,252,248,0.92)', 'rgba(255,248,236,0.48)'] as const,
  },
} as const;

export const typography = {
  family: {
    light:     'Kanit_300Light',
    regular:   'Kanit_400Regular',
    medium:    'Kanit_500Medium',
    semibold:  'Kanit_600SemiBold',
    bold:      'Kanit_700Bold',
    extrabold: 'Kanit_800ExtraBold',
  },
  size: {
    xs:    11,
    sm:    12,
    base:  14,
    md:    15,
    lg:    17,
    xl:    20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
    '5xl': 42,
  },
  letterSpacing: {
    tight:  -0.3,
    normal: 0,
    wide:   0.5,
    wider:  1.0,
  },
  lineHeight: {
    tight:   1.2,
    normal:  1.45,
    relaxed: 1.65,
  },
} as const;

export const spacing = {
  '0':  0,
  '1':  4,
  '2':  8,
  '3':  12,
  '4':  16,
  '5':  20,
  '6':  24,
  '7':  28,
  '8':  32,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80,
} as const;

export const radii = {
  xs:    6,
  sm:    10,
  md:    14,
  lg:    18,
  xl:    24,
  '2xl': 28,
  '3xl': 36,
  pill:  999,
} as const;

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  xs: {
    shadowColor: '#7A5030',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  sm: {
    shadowColor: '#7A5030',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#7A5030',
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  lg: {
    shadowColor: '#7A5030',
    shadowOpacity: 0.13,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  brand: {
    shadowColor: '#B07038',
    shadowOpacity: 0.24,   // reduced — prevents "card-behind-button" look
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
} as const;

export const blurIntensity = {
  subtle:  12,   // very light glass
  regular: 22,   // standard glass
  strong:  40,   // strong glass
  ultra:   65,
} as const;

export type Theme = {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: typeof shadows;
  blurIntensity: typeof blurIntensity;
};

export const theme: Theme = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  blurIntensity,
};
