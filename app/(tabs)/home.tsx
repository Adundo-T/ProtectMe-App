import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { ProtectCard } from '@/components/ProtectCard';
import { SectionHeader } from '@/components/SectionHeader';
import { StatusPill } from '@/components/StatusPill';
import { LoadingPlaceholder } from '@/components/LoadingPlaceholder';
import { useAppContext } from '@/contexts/AppContext';
import { protectMePalette, radii, spacing } from '@/theme';

type AnimatedCardProps = {
  delay?: number;
  children: React.ReactNode;
  style?: any;
};

const AnimatedCard: React.FC<AnimatedCardProps> = ({ delay = 0, children, style }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 450,
      delay,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  const animatedStyle = {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
      },
    ],
  };

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
};

export default function HomeScreen() {
  const router = useRouter();
  const {
    reports,
    resources,
    pendingAlerts,
    syncState,
    loading,
  } = useAppContext();

  const recentReports = reports.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <View style={styles.iconPill}>
                <Image
                  source={require('@/assets/images/stop-hand.png')}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>ProtectMe</Text>
            </View>
            <Text style={styles.subtitle}>Your safety is our priority. We're here to help.</Text>
          </View>

          <AnimatedCard delay={40}>
            <LinearGradient colors={['#FFFFFF', '#FFFFFF']} style={styles.heroCard}>
              <Button
                mode="contained"
                buttonColor="#FF0000"
                textColor="#FFFFFF"
                onPress={() => router.push('/(tabs)/sos')}
                style={styles.heroButton}
              >
                Emergency SOS
              </Button>
            </LinearGradient>
          </AnimatedCard>

          <View style={styles.statRow}>
            {[
              { label: 'Pending alerts', value: pendingAlerts.length, accent: '#F97373' },
              { label: 'Reports saved', value: reports.length, accent: '#A855F7' },
              { label: 'Resources nearby', value: resources.length, accent: '#22C55E' },
            ].map((stat, index) => (
              <AnimatedCard key={stat.label} delay={80 + index * 50} style={styles.statCardWrapper}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8F2FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCard}
                >
                  <View style={[styles.statAccent, { backgroundColor: stat.accent }]} />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </LinearGradient>
              </AnimatedCard>
            ))}
          </View>

          <View style={styles.grid}>
            <AnimatedCard style={styles.gridItem} delay={140}>
              <ProtectCard onPress={() => router.push('/(tabs)/report-form')} background="#EAF2FF">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <MaterialIcons name="description" size={24} color={protectMePalette.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardLabel}>File a report</Text>
                    <Text style={styles.cardTitle}>1 tap to start</Text>
                  </View>
                </View>
                <Button mode="text" textColor={protectMePalette.primary}>
                  New report
                </Button>
              </ProtectCard>
            </AnimatedCard>
          </View>

          <SectionHeader
            title="Recent reports"
            subtitle={`${reports.length} total • ${syncState === 'syncing' ? 'Syncing…' : 'Offline-ready'}`}
            icon={<MaterialIcons name="history" size={20} color="#A855F7" />}
            action={
              <Button compact mode="text" onPress={() => router.push('/(tabs)/reports')}>
                View all
              </Button>
            }
          />
          {loading ? (
            <LoadingPlaceholder />
          ) : recentReports.length === 0 ? (
            <AnimatedCard delay={200}>
              <ProtectCard>
                <Text style={styles.cardBody}>No reports yet. Draft or sync them anytime.</Text>
              </ProtectCard>
            </AnimatedCard>
          ) : (
            recentReports.map((report, index) => (
              <AnimatedCard key={report.id} delay={200 + index * 80}>
                <ProtectCard onPress={() => router.push(`/report/${report.id}`)}>
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
            </AnimatedCard>
            ))
          )}

          <SectionHeader title="Resources nearby" subtitle="Safe houses & services stored offline" icon={<MaterialIcons name="location-on" size={20} color="#22C55E" />} />
          <AnimatedCard delay={260}>
            <ProtectCard onPress={() => router.push('/(tabs)/resources')} background="#FFFDF5">
              <Text style={styles.cardTitle}>Browse verified safe spots</Text>
              <Text style={styles.cardBody}>Tap to open map locations, call hotlines, or cache directions.</Text>
            </ProtectCard>
          </AnimatedCard>

          <SectionHeader title="Chat (coming soon)" subtitle="Secure messaging placeholder" icon={<MaterialIcons name="chat" size={20} color="#F97373" />} />
          <AnimatedCard delay={320}>
            <ProtectCard onPress={() => router.push('/(tabs)/chat')}>
              <Text style={styles.cardBody}>Connect with live advocates once the secure channel is enabled.</Text>
            </ProtectCard>
          </AnimatedCard>
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
    gap: spacing.lg,
  },
  headerRow: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: protectMePalette.text,
  },
  subtitle: {
    fontSize: 16,
    color: protectMePalette.muted,
  },
  heroCard: {
    borderRadius: 28,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  heroEyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#D9466F',
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: protectMePalette.text,
  },
  heroBody: {
    color: protectMePalette.muted,
  },
  heroButton: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  statCardWrapper: {
    flex: 1,
    minWidth: 110,
  },
  statCard: {
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: '#E6D7FF',
  },
  statAccent: {
    width: 32,
    height: 4,
    borderRadius: 999,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: protectMePalette.text,
  },
  statLabel: {
    color: protectMePalette.muted,
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 18,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 22,
    height: 22,
    tintColor: '#FFFFFF',
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
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: spacing.xs,
  },
});

