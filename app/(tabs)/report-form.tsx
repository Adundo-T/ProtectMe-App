import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Switch, TextInput } from 'react-native-paper';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useAppContext } from '@/contexts/AppContext';
import { protectMePalette, radii, spacing } from '@/theme';
import { ProtectCard } from '@/components/ProtectCard';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportFormScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = params.id ? Number(params.id) : undefined;
  const {
    actions: { createReport, saveDraft, loadReportForEdit },
  } = useAppContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingId) {
      (async () => {
        setLoading(true);
        const report = await loadReportForEdit(editingId);
        if (report) {
          setTitle(report.title);
          setDescription(report.description);
          setIsAnonymous(report.isAnonymous);
        }
        setLoading(false);
      })();
    }
  }, [editingId, loadReportForEdit]);

  const handleSaveDraft = async () => {
    setLoading(true);
    await saveDraft({ id: editingId, title, description, isAnonymous });
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!title || !description) return;
    setLoading(true);
    await createReport({ title, description, isAnonymous });
    setTitle('');
    setDescription('');
    setIsAnonymous(true);
    setLoading(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: editingId ? 'Edit Report' : 'Report Form',
          headerTintColor: protectMePalette.text,
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              <TextInput
                label="Report title"
                value={title}
                onChangeText={setTitle}
                mode="outlined"
                style={styles.input}
                placeholder="e.g. Unwanted contact near my home"
              />
              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                style={[styles.input, { minHeight: 140 }]}
                multiline
                placeholder="Describe what happened. Include helpful details."
              />

              <ProtectCard>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Anonymous submission</Text>
                    <Text style={styles.cardBody}>Hide personal details until you are ready to share.</Text>
                  </View>
                  <Switch value={isAnonymous} onValueChange={setIsAnonymous} color={protectMePalette.primary} />
                </View>
              </ProtectCard>

              <ProtectCard background="#FFFDF5">
                <Text style={styles.cardTitle}>Attachments (offline-ready)</Text>
                <Text style={styles.cardBody}>
                  You can add photos or audio evidence later. ProtectMe will sync them when you connect.
                </Text>
              </ProtectCard>

              <View style={styles.actions}>
                <Button mode="outlined" onPress={handleSaveDraft} loading={loading} style={{ flex: 1 }}>
                  Save Draft
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  style={{ flex: 1, backgroundColor: protectMePalette.primary }}
                >
                  Submit
                </Button>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    backgroundColor: protectMePalette.background,
    gap: spacing.lg,
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: protectMePalette.text,
  },
  cardBody: {
    color: protectMePalette.muted,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});

