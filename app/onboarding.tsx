import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Checkbox } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { useAppContext } from '@/contexts/AppContext';
import { ProtectCard } from '@/components/ProtectCard';
import { protectMePalette, radii, spacing } from '@/theme';

const permissions = [
  { key: 'location', label: 'Location access for faster response' },
  { key: 'notifications', label: 'Notification alerts for updates' },
  { key: 'storage', label: 'Secure storage for offline evidence' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const {
    actions: { completeOnboarding },
  } = useAppContext();
  const [consent, setConsent] = useState<Record<string, boolean>>(
    Object.fromEntries(permissions.map((item) => [item.key, false])),
  );

  const handleContinue = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/home');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Welcome to ProtectMe</Text>
            <Text style={styles.subtitle}>Rapid support, privacy-first reporting, and safe offline access.</Text>

            <ProtectCard>
              <Image source={require('@/assets/images/icon.png')} style={styles.hero} />
              <Text style={styles.cardTitle}>Emergency-ready design</Text>
              <Text style={styles.cardBody}>
                Keep vital actions within one tap. Customize PIN or biometric lock for stealth access.
              </Text>
            </ProtectCard>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended permissions</Text>
              {permissions.map((permission) => (
                <ProtectCard key={permission.key} background="#fff6ff">
                  <View style={styles.permissionRow}>
                    <Checkbox
                      status={consent[permission.key] ? 'checked' : 'unchecked'}
                      onPress={() => setConsent((prev) => ({ ...prev, [permission.key]: !prev[permission.key] }))}
                      color={protectMePalette.primary}
                    />
                    <Text style={styles.permissionText}>{permission.label}</Text>
                  </View>
                </ProtectCard>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Anonymous mode</Text>
              <ProtectCard background="#F7F0FF">
                <Text style={styles.cardBody}>
                  You can create anonymous reports at any time. Personal fields stay hidden until you choose to share
                  them.
                </Text>
              </ProtectCard>
            </View>

            <Button
              mode="contained"
              onPress={handleContinue}
              style={styles.button}
              contentStyle={{ paddingVertical: 10 }}
            >
              Enter ProtectMe
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: protectMePalette.background,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: protectMePalette.background,
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    color: protectMePalette.text,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    color: protectMePalette.muted,
    marginTop: spacing.xs,
  },
  hero: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: protectMePalette.text,
  },
  cardBody: {
    fontSize: 14,
    color: protectMePalette.muted,
    lineHeight: 20,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: protectMePalette.text,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  permissionText: {
    flex: 1,
    fontSize: 15,
    color: protectMePalette.text,
  },
  button: {
    borderRadius: radii.lg,
    marginTop: spacing.md,
    backgroundColor: protectMePalette.primary,
  },
});

