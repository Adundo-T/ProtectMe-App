import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { protectMePalette, radii, spacing } from '@/theme';
import { StatusPill } from '@/components/StatusPill';

const sampleChats = [
  { id: 1, title: 'Advocate team', lastMessage: 'Secure channel coming soon', status: 'pending' },
  { id: 2, title: 'Legal desk', lastMessage: 'Attach documents when ready', status: 'draft' },
] as const;

export default function ChatScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Chat', headerTintColor: protectMePalette.text }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.intro}>
          Encrypted chat is coming soon. For now, jot notes and prepare drafts to sync once the secure socket is live.
        </Text>
        {sampleChats.map((chat) => (
          <View key={chat.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{chat.title}</Text>
              <Text style={styles.message}>{chat.lastMessage}</Text>
            </View>
            <StatusPill status={chat.status as any} />
          </View>
        ))}
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
  intro: {
    color: protectMePalette.muted,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: protectMePalette.text,
  },
  message: {
    marginTop: 4,
    color: protectMePalette.muted,
  },
});

