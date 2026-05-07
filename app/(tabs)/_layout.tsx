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
      <BlurView
        intensity={80}
        tint="light"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    );
  }
  if (Platform.OS === 'web') {
    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(250,246,239,0.88)',
            // @ts-ignore
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
          } as never,
        ]}
      />
    );
  }
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(250,246,239,0.96)' }]}
    />
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

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing['3']) }]}>
      {/* Single glass card containing all 3 items */}
      <View style={styles.card}>
        <GlassFill />
        <View style={styles.cardBorder} pointerEvents="none" />

        <View style={styles.row}>
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
    position:          'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    paddingHorizontal: spacing['5'],
  },

  // Single glass card
  card: {
    height:       TAB_H,
    borderRadius: radii['2xl'],
    overflow:     'hidden',
    ...shadows.lg,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii['2xl'],
    borderWidth:  StyleSheet.hairlineWidth,
    borderColor:  colors.border.glass,
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
