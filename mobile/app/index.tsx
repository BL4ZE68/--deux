import { Redirect } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { AppButton, InlineMessage, LoadingView, Panel, Screen } from '@/components/ui';
import { palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function IndexScreen() {
  const { user, space, ready, bootError, refreshSession } = useAuth();

  if (!ready) return <LoadingView label="Préparons votre petit monde…" />;
  if (bootError) {
    return (
      <Screen contentStyle={styles.content}>
        <Panel style={styles.errorCard}>
          <Text style={styles.errorEmoji}>♥</Text>
          <Text style={styles.errorTitle}>Votre espace est temporairement indisponible</Text>
          <InlineMessage message={bootError} />
          <AppButton title="Réessayer" onPress={() => void refreshSession()} />
        </Panel>
      </Screen>
    );
  }
  if (!user) return <Redirect href="/auth" />;
  if (!space) return <Redirect href="/space" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center' },
  errorCard: { gap: 15, backgroundColor: palette.surface },
  errorEmoji: { color: palette.rose, fontSize: 27 },
  errorTitle: { color: palette.ink, fontSize: 18, lineHeight: 25, fontWeight: '800' },
});
