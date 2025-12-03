import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { useAppContext } from '@/contexts/AppContext';
import { protectMePalette, spacing } from '@/theme';
import { ProtectCard } from '@/components/ProtectCard';
import { StatusPill } from '@/components/StatusPill';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportsScreen() {
  const router = useRouter();
  const {
    reports,
    syncState,
    actions: { deleteReport, markSynced },
  } = useAppContext();

  const handleDelete = (id: number) => {
    Alert.alert('Delete draft', 'Remove this report from your device?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteReport(id) },
    ]);
  };

  const handleEdit = (id: number) => {
    router.push({ pathname: '/(tabs)/report-form', params: { id } });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Reports',
          headerTintColor: protectMePalette.text,
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.content}>
            <Text style={styles.caption}>
              {reports.length} reports • Sync status:{' '}
              <Text style={{ fontWeight: '700', color: protectMePalette.text }}>{syncState.toUpperCase()}</Text>
            </Text>

            {reports.length === 0 ? (
              <ProtectCard>
                <Text style={{ color: protectMePalette.muted }}>No reports saved. Start with the Report tab.</Text>
              </ProtectCard>
            ) : (
              reports.map((report) => (
                <ProtectCard key={report.id} onPress={() => router.push(`/report/${report.id}`)}>
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.title}>{report.title}</Text>
                      <Text style={styles.meta}>
                        {report.isAnonymous ? 'Anonymous' : 'Identified'} •{' '}
                        {new Date(report.updatedAt).toLocaleString()}
                      </Text>
                    </View>
                    <StatusPill status={report.status} />
                  </View>
                  <View style={styles.actions}>
                    <IconButton icon="pencil" size={20} onPress={() => handleEdit(report.id)} />
                    {report.status !== 'synced' ? (
                      <IconButton icon="check" size={20} onPress={() => markSynced(report.id)} />
                    ) : null}
                    <IconButton icon="delete" size={20} onPress={() => handleDelete(report.id)} />
                  </View>
                </ProtectCard>
              ))
            )}

            <Button mode="contained" onPress={() => router.push('/(tabs)/report-form')} style={styles.primary}>
              Create report
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
  caption: {
    color: protectMePalette.muted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: protectMePalette.text,
  },
  meta: {
    color: protectMePalette.muted,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  primary: {
    marginTop: spacing.lg,
    backgroundColor: protectMePalette.primary,
  },
});

