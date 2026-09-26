import { Redirect, Tabs } from 'expo-router';
import { Text } from 'react-native';
import { palette } from '@/constants/theme';
import { LoadingView } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

const icons: Record<string, string> = {
  index: '⌂',
  journal: '♡',
  secrets: '⌑',
  profile: '○',
};

const titles: Record<string, string> = {
  index: 'Notre espace',
  journal: 'Journal',
  secrets: 'Ouvre quand…',
  profile: 'Nous',
};

export default function TabLayout() {
  const { user, space, ready } = useAuth();

  if (!ready) return <LoadingView />;
  if (!user) return <Redirect href="/auth" />;
  if (!space) return <Redirect href="/space" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.rose,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          height: 83,
          paddingTop: 10,
          paddingBottom: 20,
          borderTopColor: palette.line,
          backgroundColor: palette.surface,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      {Object.entries(titles).map(([name, title]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 23, fontWeight: '600', lineHeight: 25 }}>
                {icons[name]}
              </Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
