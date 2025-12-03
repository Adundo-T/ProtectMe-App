import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Chip, IconButton } from 'react-native-paper';
import { Stack } from 'expo-router';
import { useAppContext } from '@/contexts/AppContext';
import { protectMePalette, radii, spacing } from '@/theme';
import { SectionHeader } from '@/components/SectionHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

const blogArticles = [
  {
    id: 'what-is-gbv',
    title: 'Understanding gender-based violence',
    summary:
      'What GBV looks like in daily life, how it affects survivors, and why it is never your fault.',
  },
  {
    id: 'safety-planning',
    title: 'Creating a personal safety plan',
    summary:
      'Simple steps to stay safer at home, online, and on the way to work or school.',
  },
  {
    id: 'supporting-survivors',
    title: 'How to support a friend experiencing GBV',
    summary:
      'Practical ways to listen, believe, and connect someone you care about to help.',
  },
] as const;

type CategoryFilter = 'all' | 'safe-house' | 'hospital' | 'police' | 'counselor' | 'legal';

export default function ResourcesScreen() {
  const { resources } = useAppContext();
  const [category, setCategory] = useState<CategoryFilter>('all');

  const matchesFilter = (categoryFilter: CategoryFilter, resourceCategory: string, resourceName: string) => {
    const cat = resourceCategory.toLowerCase();
    const name = resourceName.toLowerCase();

    switch (categoryFilter) {
      case 'safe-house':
        return cat.includes('safe') || name.includes('safe house');
      case 'hospital':
        return cat.includes('medical') || cat.includes('hospital') || name.includes('hospital');
      case 'legal':
        return cat.includes('legal') || name.includes('legal');
      case 'police':
        return cat.includes('police') || name.includes('police');
      case 'counselor':
        return cat.includes('counsel') || name.includes('counsel') || name.includes('therapy');
      case 'all':
      default:
        return true;
    }
  };

  const openMap = (name: string, latitude?: number, longitude?: number) => {
    const query = latitude && longitude ? `${latitude},${longitude}` : encodeURIComponent(name);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const callResource = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/[^+\d]/g, '')}`);
  };

  const filteredResources =
    category === 'all'
      ? resources
      : resources.filter((r) => matchesFilter(category, r.category ?? '', r.name ?? ''));

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Resources', headerTintColor: protectMePalette.text }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.content}>
            <SectionHeader
              title="Find resources"
              subtitle="Locate safe houses, hospitals, police, counsellors and legal aid near you."
            />

            <View style={styles.chipRow}>
              <Chip selected={category === 'all'} onPress={() => setCategory('all')}>
                All
              </Chip>
              <Chip selected={category === 'safe-house'} onPress={() => setCategory('safe-house')}>
                Safe houses
              </Chip>
              <Chip selected={category === 'hospital'} onPress={() => setCategory('hospital')}>
                Hospitals
              </Chip>
              <Chip selected={category === 'police'} onPress={() => setCategory('police')}>
                Police stations
              </Chip>
              <Chip selected={category === 'counselor'} onPress={() => setCategory('counselor')}>
                Counselors
              </Chip>
              <Chip selected={category === 'legal'} onPress={() => setCategory('legal')}>
                Legal aid
              </Chip>
            </View>

            {filteredResources.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No resources found for this category.</Text>
                <Text style={styles.emptyText}>Try another filter or use the map to search nearby services.</Text>
              </View>
            ) : (
              filteredResources.map((resource) => (
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
              ))
            )}

            <Button mode="outlined" onPress={() => openMap('Safe houses near me')} style={{ marginTop: spacing.lg }}>
              Open full map
            </Button>

            <View style={styles.sectionSpacer} />

            <SectionHeader
              title="Educational resources"
              subtitle="Learn more about GBV, your rights, and ways to get support."
            />

            {blogArticles.map((article) => (
              <View key={article.id} style={styles.articleCard}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleSummary}>{article.summary}</Text>
                <Button
                  mode="text"
                  compact
                  onPress={() => {
                    // Placeholder for future deep links / webview
                  }}
                >
                  Read more
                </Button>
              </View>
            ))}
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
    gap: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  emptyTitle: {
    fontWeight: '600',
    color: protectMePalette.text,
  },
  emptyText: {
    marginTop: 4,
    color: protectMePalette.muted,
  },
  sectionSpacer: {
    height: spacing.lg,
  },
  articleCard: {
    backgroundColor: '#FFF8F5',
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: protectMePalette.text,
  },
  articleSummary: {
    color: protectMePalette.muted,
  },
});

