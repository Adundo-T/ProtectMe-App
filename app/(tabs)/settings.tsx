import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, SegmentedButtons, Switch } from 'react-native-paper';
import { Stack } from 'expo-router';
import { useAppContext } from '@/contexts/AppContext';
import { protectMePalette, spacing } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const {
    pinEnabled,
    biometricEnabled,
    syncState,
    actions: { togglePinLock, toggleBiometric, syncNow },
  } = useAppContext();

  const [language, setLanguage] = useState('en');

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Settings', headerTintColor: protectMePalette.text }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Security</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>PIN lock</Text>
                <Text style={styles.description}>Require a PIN before entering dashboard.</Text>
              </View>
              <Switch value={pinEnabled} onValueChange={togglePinLock} color={protectMePalette.primary} />
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Biometric unlock</Text>
                <Text style={styles.description}>Use fingerprint or face scan for quick entry.</Text>
              </View>
              <Switch value={biometricEnabled} onValueChange={toggleBiometric} color={protectMePalette.primary} />
            </View>

            <Text style={styles.sectionTitle}>Language</Text>
            <SegmentedButtons
              value={language}
              onValueChange={setLanguage}
              buttons={[
                { value: 'en', label: 'English' },
                { value: 'fr', label: 'Français' },
                { value: 'sw', label: 'Kiswahili' },
              ]}
            />

            <Text style={styles.sectionTitle}>Sync</Text>
            <Text style={styles.description}>Status: {syncState}</Text>
            <Button mode="contained" onPress={syncNow} disabled={syncState === 'syncing'}>
              {syncState === 'syncing' ? 'Syncing…' : 'Sync now'}
            </Button>

            <Text style={styles.sectionTitle}>Privacy</Text>
            <Text style={styles.description}>
              ProtectMe stores data locally first. You control when reports sync to the secure backend endpoints (coming
              soon). Use anonymous mode anytime.
            </Text>
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
    gap: spacing.md,
    backgroundColor: protectMePalette.background,
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: protectMePalette.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: protectMePalette.text,
  },
  description: {
    color: protectMePalette.muted,
    marginTop: 4,
  },
});

