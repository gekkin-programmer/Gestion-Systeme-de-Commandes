import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../constants/tokens';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.line,
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: {
          fontFamily: typography.fontLabel,
          fontSize: typography.size.xs,
          letterSpacing: 0.8,
        },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'OVERVIEW', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="requests" options={{ title: 'REQUESTS', tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="services" options={{ title: 'SERVICES', tabBarIcon: ({ color, size }) => <Ionicons name="restaurant-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="rooms" options={{ title: 'ROOMS', tabBarIcon: ({ color, size }) => <Ionicons name="bed-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="staff" options={{ title: 'STAFF', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
