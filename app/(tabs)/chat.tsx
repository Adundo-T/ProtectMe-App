import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { protectMePalette, radii, spacing } from '@/theme';
import { StatusPill } from '@/components/StatusPill';

const sampleChats = [
  { id: 1, title: 'Advocate team', lastMessage: 'Hello, how can I help you?', status: 'active' },
  { id: 2, title: 'Legal desk', lastMessage: 'Please provide more details about your case.', status: 'active' },
] as const;

export default function ChatScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Chat', headerTintColor: protectMePalette.text }} />
      <ScrollView contentContainerStyle={styles.container}>
        {sampleChats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.card}
            onPress={() => router.push(`/chat/${chat.id}`)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{chat.title}</Text>
              <Text style={styles.message}>{chat.lastMessage}</Text>
            </View>
            <StatusPill status={chat.status as any} />
          </TouchableOpacity>
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

