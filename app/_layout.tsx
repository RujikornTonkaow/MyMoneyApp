import { useEffect } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native'; // เพิ่ม Platform และ View
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
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
import { colors }                from '../constants/theme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 } },
});

function SplashLoading() {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      // แก้ตรงนี้: เช็คให้แน่ใจว่าโครงสร้างใน theme.ts ของคุณเป็น colors.surface.base จริงๆ
      backgroundColor: colors?.surface?.base || '#F5F0E1', 
      ...(Platform.OS === 'web' && { height: '100vh' })
    }}>
      <ActivityIndicator size="large" color={colors?.primary?.base || '#D4A373'} />
    </View>
  );
}

function AuthGuard() {
  const { session, setSession, isLoading, setLoading, isDemo } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const isAuthed = !!session?.user || isDemo;
  const { isOnline } = useNetworkStatus();

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

  // ใช้ View หุ้ม Slot เพื่อคุมพื้นหลังให้เต็มพื้นที่เสมอ
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.surface.base,
      ...(Platform.OS === 'web' && { minHeight: '100vh' })
    }}>
      <Slot />
    </View>
  );
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

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          {/* หุ้มชั้นนอกสุดด้วย View ที่บังคับพื้นหลังเต็มจอสำหรับ Web */}
          <View style={{ 
            flex: 1, 
            backgroundColor: colors.surface.base,
            ...(Platform.OS === 'web' && { 
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column'
            })
          }}>
            <AuthGuard />
          </View>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}