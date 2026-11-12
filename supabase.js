import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Expo public variables are bundled into the client. Accept only the modern
// Supabase publishable key format; never ship secret/service-role credentials.
const hasPublishableKey =
  typeof supabaseKey === 'string' && supabaseKey.startsWith('sb_publishable_');
const hasValidUrl =
  typeof supabaseUrl === 'string' && /^https:\/\//.test(supabaseUrl);

export const supabaseConfigError = !hasValidUrl
  ? 'URL Supabase mancante o non valida. Inserisci l’URL https:// del progetto.'
  : !hasPublishableKey
    ? 'Chiave Supabase non valida: inserisci una chiave publishable sb_publishable_. Le chiavi secret/service_role non sono ammesse nell’app.'
    : null;

export const isSupabaseConfigured = !supabaseConfigError;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        storage: Platform.OS === 'web' ? undefined : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;
