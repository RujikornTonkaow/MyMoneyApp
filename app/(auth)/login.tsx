import { useEffect, useState } from 'react';
import {
  View, TouchableOpacity, ActivityIndicator, Platform, StyleSheet,
} from 'react-native';
import { notifyAlert } from '../../utils/alert';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams    from 'expo-auth-session/build/QueryParams';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase }        from '../../services/supabase';
import { useAuthStore }     from '../../stores/authStore';
import { useTranslation }   from '../../hooks/useTranslation';
import { AppText, GlassCard } from '../../components/ui';
import { colors, radii, shadows, spacing } from '../../constants/theme';

WebBrowser.maybeCompleteAuthSession();

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const { access_token, refresh_token } = params;
  if (!access_token) return null;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return data.session;
};


export default function LoginScreen() {
  const router    = useRouter();
  const insets    = useSafeAreaInsets();
  const { t }     = useTranslation();
  const enterDemo = useAuthStore((s) => s.enterDemo);
  const [loading, setLoading] = useState(false);

  // On web, after Google redirects back with #access_token=... in the
  // URL hash, Supabase's detectSessionInUrl handles it automatically.
  // We only need to clean the hash so it doesn't linger in the address bar.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined') return;
    if (!window.location.hash.includes('access_token')) return;
    // Wait one tick for Supabase to consume the hash, then strip it.
    const t = setTimeout(() => {
      window.history.replaceState(null, '', window.location.pathname);
    }, 50);
    return () => clearTimeout(t);
  }, []);

  const FEATURES = [
    { icon: 'shield-checkmark' as const, label: t.login.secure,   color: colors.semantic.success },
    { icon: 'cloud-done'       as const, label: t.login.autoSync, color: colors.brand[500] },
    { icon: 'flash'            as const, label: t.login.fast,     color: colors.semantic.warning },
  ];

  const handleDemoLogin = () => { enterDemo(); router.replace('/(tabs)'); };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Web: redirect back to the site root so we don't depend on a
      // /auth/callback route existing in the SPA. Native: use the custom
      // scheme deep link that the in-app browser will catch.
      if (Platform.OS === 'web') {
        const webRedirect =
          typeof window !== 'undefined' ? window.location.origin + '/' : undefined;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: webRedirect },
        });
        if (error) throw error;
        return;
      }

      const redirectTo = makeRedirectUri({
        scheme: 'mymoneyapp',
        path:   'auth/callback',
      });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === 'success' && result.url) {
        await createSessionFromUrl(result.url);
      }
    } catch (err) {
      notifyAlert('เกิดข้อผิดพลาด', err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#F3EAD8', '#FAF6EF', '#FFFDF9']}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.blob, { top: -100, right: -80,   width: 300, height: 300, backgroundColor: colors.brand[200], opacity: 0.50 }]} />
        <View style={[styles.blob, { bottom: 60, left: -80,   width: 260, height: 260, backgroundColor: colors.brand[100], opacity: 0.55 }]} />
        <View style={[styles.blob, { top: '40%', left: '50%', width: 160, height: 160, backgroundColor: '#EDD5A8',          opacity: 0.38 }]} />
      </View>

      {/* Content area */}
      <View style={[styles.content, { paddingTop: insets.top + spacing['10'] }]}>
        {/* App icon */}
        <View style={styles.logoSection}>
          <View style={styles.logoOuterRing}>
            <LinearGradient
              colors={colors.gradient.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBox}
            >
              <Ionicons name="wallet" size={46} color="#FFF0D0" />
            </LinearGradient>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <AppText variant="title" weight="bold" align="center" style={{ color: colors.text.primary }}>
            My
          </AppText>
          <AppText variant="title" weight="extrabold" align="center" style={{ color: colors.brand[500] }}>
            Money
          </AppText>
            <AppText
            variant="bodyMd"
            tone="tertiary"
            align="center"
            style={{ marginTop: spacing['3'], lineHeight: 26 }}
          >
            {t.login.tagline}
          </AppText>
        </View>

        {/* Feature badges */}
        <View style={styles.badges}>
          {FEATURES.map((f) => (
            <GlassCard key={f.label} tone="tint" radius="pill" shadow="xs" style={styles.badge}>
              <Ionicons name={f.icon} size={13} color={f.color} />
              <AppText variant="caption" weight="semibold" style={{ marginLeft: 5, color: f.color }}>
                {f.label}
              </AppText>
            </GlassCard>
          ))}
        </View>
      </View>

      {/* Login card */}
      <View style={[styles.cardWrap, { paddingBottom: insets.bottom + spacing['8'] }]}>
        <GlassCard tone="light" radius="2xl" shadow="md" style={styles.card}>
          <View style={styles.cardInner}>
            <AppText variant="h2" weight="bold" align="center">{t.login.start}</AppText>
            <AppText variant="caption" tone="tertiary" align="center" style={{ marginTop: 4, marginBottom: spacing['5'] }}>
              {t.login.demoNote}
            </AppText>

            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={loading}
              activeOpacity={0.82}
              style={styles.googleBtn}
            >
              {loading ? (
                <ActivityIndicator color={colors.brand[500]} />
              ) : (
                <>
                  <View style={styles.googleIconBox}>
                    <AppText variant="h3" weight="extrabold" style={{ color: '#4285F4' }}>G</AppText>
                  </View>
                  <AppText variant="bodyMd" weight="semibold">{t.login.googleBtn}</AppText>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDemoLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={[styles.demoBtn, { opacity: loading ? 0.6 : 1 }]}
            >
              <LinearGradient
                colors={colors.gradient.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.demoBtnGrad}
              >
                <Ionicons name="eye" size={18} color="white" />
                <AppText variant="h3" weight="semibold" tone="inverse" style={{ marginLeft: spacing['2'] }}>
                  {t.login.demoBtn}
                </AppText>
              </LinearGradient>
            </TouchableOpacity>

            <AppText variant="micro" tone="tertiary" align="center" style={{ marginTop: spacing['3'] }}>
              {t.login.demoNote}
            </AppText>
          </View>
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface.base },
  blob: { position: 'absolute', borderRadius: 999 },
  content: {
    flex: 1,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: spacing['6'],
  },
  logoSection:  { alignItems: 'center', marginBottom: spacing['8'] },
  logoOuterRing:{
    width: 130, height: 130,
    borderRadius:    radii['2xl'] + 10,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1.5,
    borderColor:     'rgba(196,150,80,0.20)',
  },
  logoBox: {
    width: 108, height: 108,
    borderRadius:    radii['2xl'],
    alignItems:      'center',
    justifyContent:  'center',
    ...shadows.brand,
  },
  titleSection: { alignItems: 'center', marginBottom: spacing['7'] },
  badges: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            spacing['2'],
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingHorizontal: spacing['3'],
    paddingVertical:   6,
  },
  cardWrap: { paddingHorizontal: spacing['5'] },
  card:     { width: '100%' },
  cardInner:{ padding: spacing['6'] },
  googleBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius:    radii.xl,
    paddingVertical: spacing['4'],
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.70)',
    marginBottom:    spacing['3'],
  },
  googleIconBox: {
    width: 26, height: 26,
    alignItems:     'center',
    justifyContent: 'center',
    marginRight:    spacing['2'],
  },
  demoBtn:     { borderRadius: radii.xl, overflow: 'hidden' },
  demoBtnGrad: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: spacing['4'],
  },
});
