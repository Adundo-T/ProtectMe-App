import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { protectMePalette } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabConfig = [
  { name: 'home', title: 'Home', icon: 'shield-home' },
  { name: 'sos', title: 'SOS', icon: 'alert-decagram' },
  { name: 'report-form', title: 'Report', icon: 'file-document-edit' },
  { name: 'reports', title: 'Reports', icon: 'folder-eye' },
  { name: 'resources', title: 'Resources', icon: 'map-marker-radius' },
  { name: 'chat', title: 'Chat', icon: 'message-text-lock' },
  { name: 'settings', title: 'Settings', icon: 'cog' },
];

export default function TabsLayout() {
  const scheme = useColorScheme();
  const activeColor = protectMePalette.primary;
  const inactiveColor = '#8869A3';
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: protectMePalette.background,
          borderTopColor: 'transparent',
          height: 56 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: {
          fontSize: 11,
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
    </Tabs>
  );
}

