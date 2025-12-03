import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useAppContext } from '@/contexts/AppContext';
import { StatusPill } from '@/components/StatusPill';
import { protectMePalette, spacing } from '@/theme';
import type { Report } from '@/types';

export default function ReportDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    actions: { loadReportForEdit },
  } = useAppContext();
  const [report, setReport] = useState<Report | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const data = await loadReportForEdit(Number(params.id));
      setReport(data);
    })();
  }, [params.id, loadReportForEdit]);

  if (!report) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: report.title,
          headerTintColor: protectMePalette.text,
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <StatusPill status={report.status} />
        <Text style={styles.label}>Updated</Text>
        <Text style={styles.value}>{new Date(report.updatedAt).toLocaleString()}</Text>
        <Text style={styles.label}>Submission type</Text>
        <Text style={styles.value}>{report.isAnonymous ? 'Anonymous' : 'With identity'}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.body}>{report.description}</Text>

        <Text style={styles.label}>Attachments</Text>
        <Text style={styles.value}>{report.hasAttachment ? 'Stored locally' : 'None yet'}</Text>

        <Button mode="contained" onPress={() => router.push({ pathname: '/(tabs)/report-form', params: { id: report.id } })}>
          Edit report
        </Button>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: protectMePalette.background,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: protectMePalette.muted,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: protectMePalette.text,
  },
  body: {
    fontSize: 15,
    color: protectMePalette.text,
    lineHeight: 22,
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 16,
  },
});

