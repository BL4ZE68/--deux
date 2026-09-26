import 'react-native-reanimated';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { palette } from '@/constants/theme';

export {
  // Expo Router keeps uncaught screen errors inside the navigation tree.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="space" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="memory/new"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            headerShown: true,
            headerTitle: 'Un nouveau souvenir',
            headerTitleStyle: { color: palette.ink, fontWeight: '700' },
            headerStyle: { backgroundColor: palette.background },
            headerTintColor: palette.rose,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
