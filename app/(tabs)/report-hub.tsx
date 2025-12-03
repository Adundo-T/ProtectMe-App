import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { useAppContext } from '@/contexts/AppContext';
import { ProtectCard } from '@/components/ProtectCard';
import { StatusPill } from '@/components/StatusPill';
import { protectMePalette, radii, spacing } from '@/theme';

export default function ReportHubScreen() {
  const router = useRouter();
  const { reports, syncState } = useAppContext();
  const recentReports = reports.slice(0, 3);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Report',
          headerTintColor: protectMePalette.text,
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <ProtectCard background="#EAF2FF" onPress={() => router.push('/(tabs)/report-form')}>
            <Text style={styles.primaryTitle}>File a new report</Text>
            <Text style={styles.primaryBody}>Start a fresh report in a few taps. Works even when you are offline.</Text>
            <Button mode="contained" style={styles.primaryButton}>
              Start report
            </Button>
          </ProtectCard>

          <View style={styles.divider} />

          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Your reports</Text>
            <Text style={styles.sectionMeta}>
              {reports.length} total • {syncState === 'syncing' ? 'Syncing…' : 'Offline-ready'}
            </Text>
          </View>

          {reports.length === 0 ? (
            <ProtectCard>
              <Text style={styles.emptyText}>
                You have no saved reports yet. When you create one, it will appear here for quick access.
              </Text>
            </ProtectCard>
          ) : (
            <>
              {recentReports.map((report) => (
                <ProtectCard key={report.id} onPress={() => router.push(`/report/${report.id}`)}>
                  <View style={styles.reportRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reportTitle}>{report.title}</Text>
                      <Text style={styles.reportMeta}>
                        {report.isAnonymous ? 'Anonymous' : 'Identified'} •{' '}
                        {new Date(report.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <StatusPill status={report.status} />
                  </View>
                </ProtectCard>
              ))}

              <Button
                mode="text"
                style={styles.viewAllButton}
                onPress={() => router.push('/(tabs)/reports')}
                compact
              >
                View all reports
              </Button>
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: protectMePalette.background,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    gap: spacing.lg,
  },
  primaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: protectMePalette.text,
  },
  primaryBody: {
    marginTop: 4,
    color: protectMePalette.muted,
  },
  primaryButton: {
    marginTop: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: protectMePalette.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#ECE2FF',
    marginVertical: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: protectMePalette.text,
  },
  sectionMeta: {
    fontSize: 12,
    color: protectMePalette.muted,
  },
  emptyText: {
    color: protectMePalette.muted,
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
  reportMeta: {
    marginTop: 4,
    color: protectMePalette.muted,
  },
  viewAllButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
});


