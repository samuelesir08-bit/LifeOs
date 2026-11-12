import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { supabase, supabaseConfigError } from './supabase';

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleAuth() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setMessage('Inserisci un indirizzo email valido.');
      return;
    }
    if (!password) {
      setMessage('Inserisci la password.');
      return;
    }
    if (mode === 'signup' && password.length < 8) {
      setMessage('Per un nuovo account, usa almeno 8 caratteri.');
      return;
    }
    if (!supabase) {
      setMessage(supabaseConfigError || 'Servizio account non configurato.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
        setMessage(
          data.session
            ? 'Account creato. Puoi iniziare a usare LifeOS.'
            : 'Registrazione inviata. Controlla la tua email per confermare l’account.'
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setMessage(error.message || 'Si è verificato un errore. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setMessage('Inserisci prima un indirizzo email valido.');
      return;
    }
    if (!supabase) {
      setMessage(supabaseConfigError || 'Servizio account non configurato.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) throw error;
      setMessage('Se l’indirizzo è registrato, riceverai un’email per reimpostare la password.');
    } catch (error) {
      setMessage(error.message || 'Impossibile inviare il link di recupero.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>LifeOS</Text>
      <Text style={styles.subtitle}>
        La tua vita, organizzata in un unico posto.
      </Text>

      <View style={styles.card}>
        <Text style={styles.title}>
          {mode === 'login' ? 'Bentornato' : 'Crea il tuo account'}
        </Text>

        {!!supabaseConfigError && (
          <Text style={styles.warning}>{supabaseConfigError}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8A8FA3"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#8A8FA3"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          textContentType={mode === 'login' ? 'password' : 'newPassword'}
          onSubmitEditing={handleAuth}
        />

        {!!message && <Text style={styles.message}>{message}</Text>}

        <Pressable
          style={[styles.button, (loading || !supabase) && styles.disabled]}
          onPress={handleAuth}
          disabled={loading || !supabase}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {mode === 'login' ? 'Accedi' : 'Registrati'}
            </Text>
          )}
        </Pressable>

        {mode === 'login' && (
          <Pressable onPress={handlePasswordReset} style={styles.switch} disabled={loading || !supabase}>
            <Text style={styles.switchText}>Password dimenticata?</Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setMessage('');
            setPassword('');
          }}
          style={styles.switch}
        >
          <Text style={styles.switchText}>
            {mode === 'login'
              ? 'Non hai un account? Registrati'
              : 'Hai già un account? Accedi'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    color: '#A8B0C5',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    fontSize: 15,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#151C30',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#29334D',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 22,
  },
  input: {
    backgroundColor: '#0B1020',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#303A55',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6478FF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  message: {
    color: '#FBBF24',
    marginBottom: 12,
    lineHeight: 20,
  },
  warning: {
    color: '#FCA5A5',
    backgroundColor: '#3B1D2A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    lineHeight: 20,
  },
  switch: {
    alignItems: 'center',
    marginTop: 18,
  },
  switchText: {
    color: '#B9C4FF',
    textAlign: 'center',
  },
});
