import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// A Supabase secret/service-role key must never be shipped in a client app.
// Fail closed instead of accidentally exposing a privileged credential.
const isPrivilegedKey =
  typeof supabaseKey === 'string' &&
  (supabaseKey.startsWith('sb_secret_') ||
    supabaseKey.toLowerCase().includes('service_role'));

export const supabaseConfigError = !supabaseUrl || !supabaseKey
  ? 'Configurazione Supabase mancante. Imposta URL e chiave publishable nelle variabili ambiente.'
  : isPrivilegedKey
    ? 'Chiave Supabase non sicura: usa una chiave publishable, mai una secret/service_role.'
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
