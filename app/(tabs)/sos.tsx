import { useAppContext } from '@/contexts/AppContext';
import { protectMePalette, radii, spacing } from '@/theme';
import { StatusPill } from '@/components/StatusPill';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SectionHeader } from '@/components/SectionHeader';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SosScreen() {
  const {
    pendingAlerts,
    actions: { triggerSOS },
  } = useAppContext();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Emergency SOS', headerTintColor: protectMePalette.text }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.content}>
            <Pressable
              onPress={triggerSOS}
              style={({ pressed }) => [
                styles.sosButton,
                {
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <MaterialCommunityIcons name="alert-decagram" color="#fff" size={48} />
              <Text style={styles.sosText}>Hold to trigger SOS</Text>
              <Text style={styles.sosSub}>Automatically stores a pending alert entry offline.</Text>
            </Pressable>

            <SectionHeader title="Alert history" subtitle="Only stored locally on your device" />
            {pendingAlerts.length === 0 ? (
              <Text style={styles.emptyText}>No pending alerts yet.</Text>
            ) : (
              pendingAlerts.map((alert) => (
                <View key={alert.id} style={styles.alertRow}>
                  <View>
                    <Text style={styles.alertTitle}>Alert #{alert.id}</Text>
                    <Text style={styles.alertTime}>{new Date(alert.createdAt).toLocaleString()}</Text>
                  </View>
                  <StatusPill status="pending-alert" />
                </View>
              ))
            )}
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
  sosButton: {
    backgroundColor: protectMePalette.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  sosText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  sosSub: {
    color: '#EAD9FF',
    textAlign: 'center',
  },
  emptyText: {
    color: protectMePalette.muted,
  },
  alertRow: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: radii.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: protectMePalette.text,
  },
  alertTime: {
    color: protectMePalette.muted,
    marginTop: 4,
  },
});

