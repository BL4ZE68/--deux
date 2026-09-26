import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { AppButton, BrandMark, Panel, Screen } from '@/components/ui';
import { palette } from '@/constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <Screen contentStyle={styles.content}>
      <BrandMark />
      <Panel style={styles.card}>
        <Text style={styles.heart}>♡</Text>
        <Text style={styles.title}>Cette page s’est perdue en chemin.</Text>
        <Text style={styles.subtitle}>Retournez à votre petit monde, il vous attend.</Text>
        <AppButton title="Revenir à l’accueil" onPress={() => router.replace('/')} />
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center' },
  card: { gap: 14, backgroundColor: palette.surface },
  heart: { color: palette.rose, fontSize: 32 },
  title: { color: palette.ink, fontSize: 21, fontWeight: '800', lineHeight: 29 },
  subtitle: { color: palette.muted, fontSize: 13, lineHeight: 20 },
});
