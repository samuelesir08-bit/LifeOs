
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from './supabase';

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleAuth() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setMessage('Inserisci email e password.');
      return;
    }

    if (password.length < 6) {
      setMessage('La password deve contenere almeno 6 caratteri.');
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
            ? 'Account creato. Puoi accedere a LifeOS.'
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
      setMessage(error.message || 'Si è verificato un errore.');
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

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8A8FA3"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#8A8FA3"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={
            mode === 'login' ? 'current-password' : 'new-password'
          }
        />

        {!!message && <Text style={styles.message}>{message}</Text>}

        <Pressable
          style={[styles.button, loading && styles.disabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {mode === 'login' ? 'Accedi' : 'Registrati'}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setMessage('');
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
  switch: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    color: '#B9C4FF',
    textAlign: 'center',
  },
});
