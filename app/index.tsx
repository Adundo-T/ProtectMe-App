import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import { protectMePalette } from '@/theme';

export default function IndexRedirect() {
  const { loading, hasCompletedOnboarding, isAuthenticated } = useAppContext();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: protectMePalette.background }}>
        <ActivityIndicator size="large" color={protectMePalette.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

