import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ProtectCard } from '@/components/ProtectCard';
import { SectionHeader } from '@/components/SectionHeader';
import { StatusPill } from '@/components/StatusPill';
import { LoadingPlaceholder } from '@/components/LoadingPlaceholder';
import { useAppContext } from '@/contexts/AppContext';
import { protectMePalette, radii, spacing } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const {
    reports,
    pendingAlerts,
    syncState,
    loading,
    actions: { triggerSOS },
  } = useAppContext();

  const recentReports = reports.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>ProtectMe Dashboard</Text>
          <Text style={styles.subtitle}>Stay safe, even offline.</Text>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <ProtectCard onPress={() => router.push('/(tabs)/sos')} background="#FDE7FF">
                <Text style={styles.cardLabel}>Emergency SOS</Text>
                <Text style={styles.cardTitle}>Hold to alert</Text>
                <Button mode="contained" onPress={triggerSOS} compact style={styles.cardButton}>
                  Trigger SOS
                </Button>
                {pendingAlerts.length > 0 ? <StatusPill status="pending-alert" /> : null}
              </ProtectCard>
            </View>

            <View style={styles.gridItem}>
              <ProtectCard onPress={() => router.push('/(tabs)/report-form')} background="#EAF2FF">
                <Text style={styles.cardLabel}>File a report</Text>
                <Text style={styles.cardTitle}>1 tap to start</Text>
                <Button mode="text" textColor={protectMePalette.primary}>
                  New report
                </Button>
              </ProtectCard>
            </View>
          </View>

          <SectionHeader
            title="Recent reports"
            subtitle={`${reports.length} total • ${syncState === 'syncing' ? 'Syncing…' : 'Offline-ready'}`}
            action={
              <Button compact mode="text" onPress={() => router.push('/(tabs)/reports')}>
                View all
              </Button>
            }
          />
          {loading ? (
            <LoadingPlaceholder />
          ) : recentReports.length === 0 ? (
            <ProtectCard>
              <Text style={styles.cardBody}>No reports yet. Draft or sync them anytime.</Text>
            </ProtectCard>
          ) : (
            recentReports.map((report) => (
              <ProtectCard key={report.id} onPress={() => router.push(`/report/${report.id}`)}>
                <View style={styles.reportRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportTime}>
                      {new Date(report.updatedAt).toLocaleDateString()} •{' '}
                      {report.isAnonymous ? 'Anonymous' : 'Identified'}
                    </Text>
                  </View>
                  <StatusPill status={report.status} />
                </View>
              </ProtectCard>
            ))
          )}

          <SectionHeader title="Resources nearby" subtitle="Safe houses & services stored offline" />
          <ProtectCard onPress={() => router.push('/(tabs)/resources')} background="#FFFDF5">
            <Text style={styles.cardTitle}>Browse verified safe spots</Text>
            <Text style={styles.cardBody}>Tap to open map locations, call hotlines, or cache directions.</Text>
          </ProtectCard>

          <SectionHeader title="Chat (coming soon)" subtitle="Secure messaging placeholder" />
          <ProtectCard onPress={() => router.push('/(tabs)/chat')}>
            <Text style={styles.cardBody}>Connect with live advocates once the secure channel is enabled.</Text>
          </ProtectCard>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    maxWidth: 720,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: protectMePalette.text,
  },
  subtitle: {
    fontSize: 16,
    color: protectMePalette.muted,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  gridItem: {
    flex: 1,
    minWidth: '48%',
  },
  cardLabel: {
    color: protectMePalette.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: protectMePalette.text,
  },
  cardBody: {
    fontSize: 14,
    color: protectMePalette.muted,
  },
  cardButton: {
    alignSelf: 'flex-start',
    borderRadius: radii.lg,
    backgroundColor: protectMePalette.primary,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: protectMePalette.text,
  },
  reportTime: {
    fontSize: 13,
    color: protectMePalette.muted,
    marginTop: 4,
  },
});

