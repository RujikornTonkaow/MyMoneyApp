import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../../hooks/useTranslation';
import { AppText }        from '../../components/ui';
import { colors, radii, shadows, spacing } from '../../constants/theme';

// ── Geometry ────────────────────────────────────────────────────────────────
const TAB_H    = 64;   // height of the glass card
const FAB_SIZE = 46;   // diameter of the circular FAB button (inside card)

// ── Glass fill helper — pointerEvents="none" so touches pass through ─────────
function GlassFill() {
  if (Platform.OS === 'ios') {
    return (
      <>
        <BlurView
          intensity={80}
          tint="light"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.glassBase} pointerEvents="none" />
        <LinearGradient
          colors={['rgba(255,255,255,0.46)', 'rgba(255,255,255,0.10)', 'rgba(255,255,255,0.00)']}
          locations={[0, 0.45, 1]}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </>
    );
  }
  if (Platform.OS === 'web') {
    return (
      <>
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor:      'rgba(255,250,240,0.22)',
              backdropFilter:       'blur(28px) saturate(1.35)',
              WebkitBackdropFilter: 'blur(28px) saturate(1.35)',
            } as never,
          ]}
        />
        <LinearGradient
          colors={['rgba(255,255,255,0.48)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.00)']}
          locations={[0, 0.45, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </>
    );
  }
  return (
    <>
      <View pointerEvents="none" style={styles.glassBase} />
      <LinearGradient
        colors={['rgba(255,255,255,0.42)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.00)']}
        locations={[0, 0.45, 1]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </>
  );
}

// ── Tab bar ──────────────────────────────────────────────────────────────────
function TabBar({ state, descriptors, navigation }: {
  state: { routes: { key: string; name: string }[]; index: number };
  descriptors: Record<string, { options: { tabBarLabel?: string } }>;
  navigation: {
    emit: (o: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
    navigate: (n: string) => void;
  };
}) {
  const insets = useSafeAreaInsets();
  const { t }  = useTranslation();

  const sideRoutes  = state.routes.filter((r) => r.name !== 'add' && r.name !== 'settings');
  const addRoute    = state.routes.find((r) => r.name === 'add');
  const isAddActive = state.routes[state.index]?.name === 'add';

  const half      = Math.ceil(sideRoutes.length / 2);
  const leftTabs  = sideRoutes.slice(0, half);
  const rightTabs = sideRoutes.slice(half);

  const handleAdd = () => {
    if (!addRoute) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const e = navigation.emit({ type: 'tabPress', target: addRoute.key, canPreventDefault: true });
    if (!e.defaultPrevented) navigation.navigate('add');
  };

  const renderTab = (route: { key: string; name: string }) => {
    const { options } = descriptors[route.key];
    const label   = options.tabBarLabel ?? route.name;
    const focused = state.routes[state.index].key === route.key;
    const color   = focused ? colors.brand[500] : colors.text.tertiary;
    const icon    = getIconName(route.name, focused);

    const onPress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
    };

    return (
      <TouchableOpacity
        key={route.key}
        onPress={onPress}
        style={styles.tabItem}
        activeOpacity={0.75}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {focused && <View style={styles.activeDot} />}
        <Ionicons name={icon} size={22} color={color} />
        <AppText
          variant="micro"
          weight={focused ? 'semibold' : 'regular'}
          style={{ color, marginTop: 3 }}
        >
          {label as string}
        </AppText>
      </TouchableOpacity>
    );
  };

  // The tab card stretches all the way to the bottom edge of the screen.
  // Icons stay inside the top TAB_H slice; the rest is a safe-area buffer
  // for the iOS home indicator. This avoids the empty cream strip below
  // a "floating" tab bar in PWA standalone mode.
  const cardHeight = TAB_H + insets.bottom;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={[styles.card, { height: cardHeight, paddingBottom: insets.bottom }]}>
        <GlassFill />
        <View style={styles.cardBorder} pointerEvents="none" />

        <View style={[styles.row, { height: TAB_H }]}>
          {/* Left side tabs */}
          {leftTabs.map(renderTab)}

          {/* Center FAB — inside the card, same vertical level */}
          <TouchableOpacity
            onPress={handleAdd}
            activeOpacity={0.85}
            style={styles.fabSlot}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <LinearGradient
              colors={isAddActive
                ? colors.gradient.brand
                : [colors.brand[400], colors.brand[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.fab, isAddActive && styles.fabActive]}
            >
              <Ionicons name="add" size={26} color="white" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Right side tabs */}
          {rightTabs.map(renderTab)}
        </View>
      </View>
    </View>
  );
}

function getIconName(routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap {
  const map: Record<string, [string, string]> = {
    index:   ['wallet', 'wallet-outline'],
    history: ['time',   'time-outline'],
  };
  const pair = map[routeName] ?? ['ellipse', 'ellipse-outline'];
  return (focused ? pair[0] : pair[1]) as keyof typeof Ionicons.glyphMap;
}

// ── Layout ───────────────────────────────────────────────────────────────────
export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...(props as Parameters<typeof TabBar>[0])} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"    options={{ tabBarLabel: t.nav.overview, title: t.nav.overview }} />
      <Tabs.Screen name="history"  options={{ tabBarLabel: t.nav.history,  title: t.nav.history  }} />
      <Tabs.Screen name="add"      options={{ tabBarLabel: t.nav.add,      title: t.nav.add      }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    right:    0,
  },

  // Glass tab card — flush to bottom and side edges, rounded only on top
  card: {
    overflow:               'hidden',
    backgroundColor:        'rgba(255,250,240,0.16)',
    borderTopLeftRadius:    radii['2xl'],
    borderTopRightRadius:   radii['2xl'],
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    ...shadows.lg,
  },
  glassBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,250,240,0.22)',
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius:  radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    borderTopWidth:       1.2,
    borderLeftWidth:      1.2,
    borderRightWidth:     1.2,
    borderBottomWidth:    0,
    borderTopColor:       'rgba(255,255,255,0.80)',
    borderLeftColor:      'rgba(255,255,255,0.70)',
    borderRightColor:     'rgba(200,160,100,0.22)',
  },

  // Row inside the card
  row: {
    flex:          1,
    flexDirection: 'row',
    alignItems:    'center',
  },

  // Side tab items
  tabItem: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    height:         TAB_H,
  },
  activeDot: {
    position:        'absolute',
    top:             0,
    width:           28,
    height:          3,
    borderRadius:    2,
    backgroundColor: colors.brand[500],
  },

  // Center FAB slot
  fabSlot: {
    width:          72,
    height:         TAB_H,
    alignItems:     'center',
    justifyContent: 'center',
  },
  fab: {
    width:          FAB_SIZE,
    height:         FAB_SIZE,
    borderRadius:   FAB_SIZE / 2,
    alignItems:     'center',
    justifyContent: 'center',
    ...shadows.brand,
  },
  fabActive: {
    transform: [{ scale: 1.08 }],
  },
});
