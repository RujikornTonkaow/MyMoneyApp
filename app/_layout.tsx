import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Kanit_300Light,
  Kanit_400Regular,
  Kanit_500Medium,
  Kanit_600SemiBold,
  Kanit_700Bold,
  Kanit_800ExtraBold,
} from '@expo-google-fonts/kanit';
import { supabase }              from '../services/supabase';
import { useAuthStore }          from '../stores/authStore';
import { useLanguageStore }      from '../stores/languageStore';
import { syncPendingTransactions } from '../services/sync';
import { useNetworkStatus }      from '../hooks/useNetworkStatus';
import ErrorBoundary             from '../components/ErrorBoundary';
import { AppText }               from '../components/ui';
import { colors, radii, spacing } from '../constants/theme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 } },
});

function SplashLoading() {
  return (
    <LinearGradient
      colors={colors.gradient.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.base }}
    >
      <View
        style={{
          width:           88,
          height:          88,
          borderRadius:    radii['2xl'],
          backgroundColor: 'rgba(255,240,210,0.30)',
          borderWidth:     1,
          borderColor:     'rgba(255,220,160,0.35)',
          alignItems:      'center',
          justifyContent:  'center',
          marginBottom:    20,
        }}
      >
        <Ionicons name="wallet" size={40} color="#FFF0D0" />
      </View>
      <AppText variant="h2" weight="bold" tone="inverse">Pocket Money</AppText>
      <AppText variant="caption" tone="inverse" style={{ opacity: 0.65, marginTop: 4, marginBottom: spacing['8'] }}>
        Tracker
      </AppText>
      <ActivityIndicator color="rgba(255,230,170,0.80)" size="small" />
    </LinearGradient>
  );
}

function AuthGuard() {
  const { session, isDemo, isLoading, setSession, setLoading } = useAuthStore();
  const initialize = useLanguageStore((s) => s.initialize);
  const isAuthed   = !!session || isDemo;
  const { isOnline } = useNetworkStatus();
  const segments   = useSegments();
  const router     = useRouter();

  useEffect(() => { initialize(); }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { clearTimeout(timeout); subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === '(auth)';
    if (!isAuthed && !inAuth)    router.replace('/(auth)/login');
    else if (isAuthed && inAuth) router.replace('/(tabs)');
  }, [isAuthed, isLoading, segments]);

  useEffect(() => {
    if (isDemo) return;
    if (isOnline && session?.user) syncPendingTransactions(session.user.id).catch(console.error);
  }, [isOnline, session, isDemo]);

  if (isLoading) return <SplashLoading />;
  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Kanit_300Light,
    Kanit_400Regular,
    Kanit_500Medium,
    Kanit_600SemiBold,
    Kanit_700Bold,
    Kanit_800ExtraBold,
  });

  if (!fontsLoaded) return <SplashLoading />;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <AuthGuard />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
