import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { protectMePalette, radii, spacing } from '@/theme';
import { useAppContext } from '@/contexts/AppContext';

export default function AuthScreen() {
  const router = useRouter();
  const {
    actions: { signIn },
  } = useAppContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // For now we accept any non-empty credentials and mark the user as authenticated.
      await signIn();
      router.replace('/(tabs)/home');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.backdrop} />
        <View style={styles.centerContainer}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconGlyph}>🛡️</Text>
              </View>
            </View>
            <Text style={styles.title}>ProtectMe</Text>
            <Text style={styles.subtitle}>Welcome back! Sign in to continue</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Pressable
              onPress={handleSignIn}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  opacity: submitting || pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={styles.primaryButtonText}>{submitting ? 'Signing in…' : 'Sign In'}</Text>
            </Pressable>

            <Text style={styles.footerText}>
              Don't have an account? <Text style={styles.footerLink}>Sign up</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#040015',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#040015',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radii.lg,
    backgroundColor: '#120826',
    padding: spacing.xl,
    alignItems: 'stretch',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: protectMePalette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E5E7EB',
    marginBottom: spacing.xs,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#4B5563',
    backgroundColor: '#050223',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: '#F9FAFB',
  },
  primaryButton: {
    marginTop: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: '#C084FC',
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  footerText: {
    marginTop: spacing.lg,
    fontSize: 13,
    textAlign: 'center',
    color: '#9CA3AF',
  },
  footerLink: {
    color: '#E5B3FF',
    fontWeight: '600',
  },
});


