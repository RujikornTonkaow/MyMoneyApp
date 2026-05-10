import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// On web we want Supabase to read the OAuth tokens out of the URL hash
// fragment automatically after Google redirects back. On native we handle
// the deep-link callback ourselves via WebBrowser.openAuthSessionAsync.
const isWeb = Platform.OS === 'web';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb,
    flowType: isWeb ? 'implicit' : 'pkce',
  },
});
