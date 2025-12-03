import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { Stack } from 'expo-router';
import { useAppContext } from '@/contexts/AppContext';
import { protectMePalette, radii, spacing } from '@/theme';
import { SectionHeader } from '@/components/SectionHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResourcesScreen() {
  const { resources } = useAppContext();

  const openMap = (name: string, latitude?: number, longitude?: number) => {
    const query = latitude && longitude ? `${latitude},${longitude}` : encodeURIComponent(name);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const callResource = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/[^+\d]/g, '')}`);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Resources', headerTintColor: protectMePalette.text }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.content}>
            <SectionHeader title="Offline cache" subtitle="These entries stay available without internet." />
            {resources.map((resource) => (
              <View key={resource.id} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{resource.name}</Text>
                  <Text style={styles.category}>{resource.category}</Text>
                  <Text style={styles.address}>{resource.address}</Text>
                  <Text style={styles.phone}>{resource.phone}</Text>
                  <Text style={styles.badge}>{resource.isOpen24h ? '24h support' : 'Hours vary'}</Text>
                </View>
                <View style={styles.actions}>
                  <IconButton
                    icon="map-marker"
                    onPress={() => openMap(resource.name, resource.latitude, resource.longitude)}
                  />
                  <IconButton icon="phone" onPress={() => callResource(resource.phone)} />
                </View>
              </View>
            ))}

            <Button mode="outlined" onPress={() => openMap('Safe houses near me')} style={{ marginTop: spacing.lg }}>
              Open map
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
  card: {
    backgroundColor: '#fff',
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: protectMePalette.text,
  },
  category: {
    color: protectMePalette.muted,
  },
  address: {
    marginTop: 4,
    color: protectMePalette.text,
  },
  phone: {
    marginTop: 2,
    color: protectMePalette.primary,
  },
  badge: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: protectMePalette.secondary,
  },
  actions: {
    justifyContent: 'space-between',
  },
});

