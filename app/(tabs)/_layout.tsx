import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { protectMePalette } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabConfig = [
  { name: 'home', title: 'Home', icon: 'shield-home' },
  // Combined "Report" hub (form + list)
  { name: 'report-hub', title: 'Report', icon: 'file-document-edit' },
  { name: 'resources', title: 'Resources', icon: 'map-marker-radius' },
  { name: 'chat', title: 'Chat', icon: 'message-text-lock' },
  { name: 'profile', title: 'Profile', icon: 'account-circle-outline' },
];

const hiddenTabRoutes = ['sos', 'reports', 'settings', 'report-form'];

export default function TabsLayout() {
  const scheme = useColorScheme();
  const activeColor = protectMePalette.primary;
  const inactiveColor = '#8869A3';
  const insets = useSafeAreaInsets();
  const tabBarBottom = Math.max(insets.bottom, 4);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: tabBarBottom,
          height: 60,
          borderRadius: 999,
          backgroundColor: protectMePalette.surface ?? protectMePalette.background,
          borderTopColor: 'transparent',
          paddingBottom: 6,
          paddingTop: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 0,
        },
      }}
    >
      {tabConfig.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name as any}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name={tab.icon as any} color={color} size={size} />,
          }}
        />
      ))}
      {hiddenTabRoutes.map((route) => (
        <Tabs.Screen key={route} name={route as any} options={{ href: null }} />
      ))}
    </Tabs>
  );
}

