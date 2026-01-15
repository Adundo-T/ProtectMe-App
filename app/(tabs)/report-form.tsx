import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { Button, Switch, TextInput } from 'react-native-paper';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from '@/contexts/AppContext-fixed';
import { protectMePalette, spacing, radii } from '@/theme';
import { ProtectCard } from '@/components/ProtectCard';
import { SafeAreaView } from 'react-native-safe-area-context';

type MediaAttachment = {
  id: string;
  uri: string;
  type: 'image' | 'video';
  fileName?: string;
  fileSize?: number;
};

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
  const [mediaAttachments, setMediaAttachments] = useState<MediaAttachment[]>([]);

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
    await saveDraft({ id: editingId, title, description, isAnonymous, mediaAttachments });
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!title || !description) return;
    setLoading(true);
    await createReport({ title, description, isAnonymous, mediaAttachments });
    setTitle('');
    setDescription('');
    setIsAnonymous(true);
    setMediaAttachments([]);
    setLoading(false);
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Media library permission is required to select images and videos.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const newAttachment: MediaAttachment = {
        id: Date.now().toString(),
        uri: asset.uri,
        type: 'image',
        fileName: asset.fileName || undefined,
        fileSize: asset.fileSize,
      };
      setMediaAttachments(prev => [...prev, newAttachment]);
    }
  };

  const pickVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const newAttachment: MediaAttachment = {
        id: Date.now().toString(),
        uri: asset.uri,
        type: 'video',
        fileName: asset.fileName || undefined,
        fileSize: asset.fileSize,
      };
      setMediaAttachments(prev => [...prev, newAttachment]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const newAttachment: MediaAttachment = {
        id: Date.now().toString(),
        uri: asset.uri,
        type: 'image',
        fileName: asset.fileName || undefined,
        fileSize: asset.fileSize,
      };
      setMediaAttachments(prev => [...prev, newAttachment]);
    }
  };

  const removeAttachment = (id: string) => {
    setMediaAttachments(prev => prev.filter(att => att.id !== id));
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
                <Text style={styles.cardTitle}>Media Attachments</Text>
                <Text style={styles.cardBody}>
                  Add photos or videos as evidence. Files are stored locally and will sync when connected.
                </Text>

                <View style={styles.mediaButtons}>
                  <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                    <MaterialCommunityIcons name="image" size={24} color={protectMePalette.primary} />
                    <Text style={styles.mediaButtonText}>Gallery Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
                    <MaterialCommunityIcons name="camera" size={24} color={protectMePalette.primary} />
                    <Text style={styles.mediaButtonText}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
                    <MaterialCommunityIcons name="video" size={24} color={protectMePalette.primary} />
                    <Text style={styles.mediaButtonText}>Gallery Video</Text>
                  </TouchableOpacity>
                </View>

                {mediaAttachments.length > 0 && (
                  <View style={styles.attachmentsList}>
                    <Text style={[styles.cardBody, { fontWeight: '600', marginBottom: spacing.sm }]}>
                      Selected Media ({mediaAttachments.length})
                    </Text>
                    {mediaAttachments.map((attachment) => (
                      <View key={attachment.id} style={styles.attachmentItem}>
                        <View style={styles.attachmentPreview}>
                          {attachment.type === 'image' ? (
                            <Image source={{ uri: attachment.uri }} style={styles.previewImage} />
                          ) : (
                            <View style={styles.videoPlaceholder}>
                              <MaterialCommunityIcons name="video" size={20} color={protectMePalette.muted} />
                            </View>
                          )}
                        </View>
                        <View style={styles.attachmentInfo}>
                          <Text style={styles.attachmentName} numberOfLines={1}>
                            {attachment.fileName || `${attachment.type} file`}
                          </Text>
                          <Text style={styles.attachmentType}>
                            {attachment.type.toUpperCase()}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeAttachment(attachment.id)}
                        >
                          <MaterialCommunityIcons name="close" size={20} color={protectMePalette.danger} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
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
  mediaButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  mediaButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: protectMePalette.muted,
    borderRadius: radii.md,
    backgroundColor: '#fff',
  },
  mediaButtonText: {
    fontSize: 12,
    color: protectMePalette.text,
    marginTop: 4,
    textAlign: 'center',
  },
  attachmentsList: {
    marginTop: spacing.md,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: '#fff',
    borderRadius: radii.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: protectMePalette.muted,
  },
  attachmentPreview: {
    width: 50,
    height: 50,
    borderRadius: radii.sm,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: protectMePalette.background,
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: radii.sm,
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: protectMePalette.text,
  },
  attachmentType: {
    fontSize: 12,
    color: protectMePalette.muted,
    marginTop: 2,
  },
  removeButton: {
    padding: spacing.xs,
  },
});

