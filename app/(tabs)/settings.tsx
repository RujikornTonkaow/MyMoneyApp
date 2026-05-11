import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuthStore }      from '../../stores/authStore';
import { useTranslation }    from '../../hooks/useTranslation';
import { AppText, GlassCard } from '../../components/ui';
import { supabase }           from '../../services/supabase';
import { confirmAction }      from '../../utils/alert';
import { colors, radii, shadows, spacing } from '../../constants/theme';
import Constants from 'expo-constants';
import { type Language } from '../../constants/i18n';

const LANGUAGES: { code: Language; flag: string }[] = [
  { code: 'en', flag: '🇺🇸' },
  { code: 'th', flag: '🇹🇭' },
];

function SectionHeader({ label }: { label: string }) {
  return (
    <AppText
      variant="micro"
      weight="semibold"
      style={styles.sectionHeader}
    >
      {label.toUpperCase()}
    </AppText>
  );
}

export default function SettingsScreen() {
  const insets      = useSafeAreaInsets();
  const { t, language, setLanguage } = useTranslation();
  const isDemo      = useAuthStore((s) => s.isDemo);
  const signOut     = useAuthStore((s) => s.signOut);
  const displayName = isDemo ? 'Demo' : 'User';

  const handleSignOut = () => {
    confirmAction({
      title:       t.settings.signOutConfirm,
      message:     t.settings.signOutMsg,
      confirmText: t.settings.signOut,
      cancelText:  t.settings.cancel,
      destructive: true,
      onConfirm:   async () => {
        if (!isDemo) await supabase.auth.signOut();
        signOut();
      },
    });
  };

  const handleLanguage = (code: Language) => {
    Haptics.selectionAsync().catch(() => {});
    setLanguage(code);
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing['4'] }]}>
        <View style={[styles.blob, { top: -80, right: -60, width: 220, height: 220, backgroundColor: colors.brand[200], opacity: 0.40 }]} />
        <View style={[styles.blob, { bottom: -40, left: -40, width: 160, height: 160, backgroundColor: colors.brand[100], opacity: 0.45 }]} />
        <View style={styles.headerIcon}>
          <LinearGradient colors={colors.gradient.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerIconGrad}>
            <Ionicons name="settings" size={26} color={colors.brand[700]} />
          </LinearGradient>
        </View>
        <AppText variant="h1" weight="bold" style={{ marginTop: spacing['3'] }}>
          {t.settings.title}
        </AppText>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 130 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Language ── */}
        <SectionHeader label={t.settings.language} />
        <GlassCard tone="light" radius="xl" shadow="xs" style={styles.card}>
          <AppText variant="caption" tone="tertiary" style={{ marginBottom: spacing['3'] }}>
            {t.settings.languageDesc}
          </AppText>
          <View style={styles.langRow}>
            {LANGUAGES.map(({ code, flag }) => {
              const active = language === code;
              const label  = code === 'en' ? t.settings.english : t.settings.thai;
              return (
                <TouchableOpacity
                  key={code}
                  onPress={() => handleLanguage(code)}
                  activeOpacity={0.80}
                  style={[styles.langBtn, active && styles.langBtnActive]}
                >
                  {active && (
                    <LinearGradient
                      colors={colors.gradient.brand}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <AppText style={styles.flagEmoji}>{flag}</AppText>
                  <AppText
                    variant="bodyMd"
                    weight={active ? 'bold' : 'medium'}
                    tone={active ? 'inverse' : 'primary'}
                    style={{ marginTop: 4 }}
                  >
                    {label}
                  </AppText>
                  {active && (
                    <View style={styles.checkDot}>
                      <Ionicons name="checkmark" size={11} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* ── Account ── */}
        <SectionHeader label={t.settings.account} />
        <GlassCard tone="light" radius="xl" shadow="xs" style={styles.card}>
          <View style={styles.rowItem}>
            <View style={[styles.rowIcon, { backgroundColor: colors.brand[100] }]}>
              <Ionicons name="person" size={16} color={colors.brand[500]} />
            </View>
            <AppText variant="bodyMd" weight="medium" style={{ flex: 1 }}>
              {isDemo ? 'Demo Mode' : displayName}
            </AppText>
            <View style={styles.demoBadge}>
              <AppText variant="micro" weight="semibold" style={{ color: colors.brand[600] }}>
                {isDemo ? 'DEMO' : 'USER'}
              </AppText>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity onPress={handleSignOut} activeOpacity={0.75} style={styles.rowItem}>
            <View style={[styles.rowIcon, { backgroundColor: colors.semantic.dangerSoft }]}>
              <Ionicons name="log-out-outline" size={16} color={colors.semantic.danger} />
            </View>
            <AppText variant="bodyMd" weight="medium" style={{ color: colors.semantic.danger, flex: 1 }}>
              {t.settings.signOut}
            </AppText>
            <Ionicons name="chevron-forward" size={15} color={colors.text.tertiary} />
          </TouchableOpacity>
        </GlassCard>

        {/* ── About ── */}
        <SectionHeader label={t.settings.about} />
        <GlassCard tone="light" radius="xl" shadow="xs" style={styles.card}>
          <View style={styles.rowItem}>
            <View style={[styles.rowIcon, { backgroundColor: colors.brand[100] }]}>
              <Ionicons name="information-circle" size={16} color={colors.brand[500]} />
            </View>
            <AppText variant="bodyMd" weight="medium" style={{ flex: 1 }}>
              {t.settings.version}
            </AppText>
            <AppText variant="caption" tone="tertiary">{version}</AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <View style={[styles.rowIcon, { backgroundColor: '#E8F4F8' }]}>
              <Ionicons name="construct-outline" size={16} color={colors.brand[400]} />
            </View>
            <AppText variant="bodyMd" tone="tertiary" style={{ flex: 1 }}>
              {t.settings.comingSoon}
            </AppText>
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.surface.base },
  header: {
    paddingHorizontal: spacing['5'],
    // paddingBottom:     spacing['5'],
    backgroundColor:   colors.surface.base,
    overflow:          'hidden',
  },
  blob: { position: 'absolute', borderRadius: 999 },
  headerIcon: { alignSelf: 'flex-start' },
  headerIconGrad: {
    width: 56, height: 56,
    borderRadius: radii.xl,
    alignItems:   'center',
    justifyContent: 'center',
    ...shadows.sm,
  },

  body: { paddingHorizontal: spacing['5'], paddingTop: spacing['2'] },
  sectionHeader: {
    color:        colors.text.tertiary,
    letterSpacing: 1.2,
    marginTop:    spacing['5'],
    marginBottom: spacing['2'],
    marginLeft:   spacing['1'],
  },
  card: { padding: spacing['4'] },

  /* Language */
  langRow:  { flexDirection: 'row', gap: spacing['3'] },
  langBtn: {
    flex:           1,
    alignItems:     'center',
    paddingVertical: spacing['4'],
    borderRadius:    radii.xl,
    overflow:        'hidden',
    borderWidth:     1.5,
    borderColor:     colors.border.default,
    backgroundColor: colors.surface.white,
    position:        'relative',
  },
  langBtnActive: { borderColor: 'transparent' },
  flagEmoji:    { fontSize: 28 },
  checkDot: {
    position:       'absolute',
    top:            8, right: 8,
    width:          18, height: 18,
    borderRadius:   9,
    backgroundColor: 'rgba(255,255,255,0.30)',
    alignItems:     'center',
    justifyContent: 'center',
  },

  /* Rows */
  rowItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing['2'], gap: spacing['3'] },
  rowIcon: {
    width: 34, height: 34,
    borderRadius: radii.md,
    alignItems:   'center',
    justifyContent: 'center',
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border.subtle, marginVertical: spacing['2'] },
  demoBadge: {
    paddingHorizontal: spacing['2'],
    paddingVertical:   3,
    borderRadius:      radii.pill,
    backgroundColor:   colors.brand[100],
  },
});
