import * as Clipboard from 'expo-clipboard';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { AppButton, BrandMark, Field, InlineMessage, PageHeading, Panel, Screen } from '@/components/ui';
import { palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function SpaceScreen() {
  const { user, space, ready, createSpace, joinSpace } = useAuth();
  const [code, setCode] = useState(space?.code ?? '');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (ready && !user) return <Redirect href="/auth" />;
  if (space?.user2_id) return <Redirect href="/(tabs)" />;

  const handleCreate = async () => {
    setError(null);
    setLoading('create');
    try {
      setCode(await createSpace());
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Impossible de créer cet espace.');
    } finally {
      setLoading(null);
    }
  };

  const handleJoin = async () => {
    if (joinCode.trim().length < 5) {
      setError('Saisissez le code d’invitation reçu.');
      return;
    }
    setError(null);
    setLoading('join');
    try {
      await joinSpace(joinCode);
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Ce code ne permet pas de rejoindre cet espace.');
    } finally {
      setLoading(null);
    }
  };

  const copyCode = async () => {
    try {
      await Clipboard.setStringAsync(code);
      setCopied(true);
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : 'Impossible de copier le code.');
    }
  };

  const shareCode = async () => {
    try {
      await Share.share({
        title: 'Notre espace à deux',
        message: `Rejoins mon petit monde sur À deux 💌\n\nEntre ce code d’invitation dans l’application : ${code}`,
      });
    } catch (shareError) {
      setError(shareError instanceof Error ? shareError.message : 'Impossible de partager le code.');
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <BrandMark />
      <View style={styles.hero}>
        <View style={styles.heartBadge}><Text style={styles.heroHeart}>♡</Text></View>
        <PageHeading
          eyebrow="Un endroit rien qu’à vous"
          title="À deux, c’est mieux."
          subtitle={`Bienvenue${user?.firstName ? ` ${user.firstName}` : ''} ! Invitez votre personne ou rejoignez son espace.`}
        />
      </View>

      {error ? <InlineMessage message={error} /> : null}

      {code ? (
        <Panel style={styles.invitationCard}>
          <Text style={styles.invitationEyebrow}>VOTRE CODE D’INVITATION</Text>
          <Text selectable style={styles.invitationCode}>{code}</Text>
          <Text style={styles.invitationCopy}>Envoyez ce code à votre personne pour qu’elle vous rejoigne.</Text>
          <View style={styles.buttonRow}>
            <View style={styles.halfButton}>
              <AppButton title={copied ? 'Copié !' : 'Copier'} onPress={() => void copyCode()} variant="secondary" icon={<Text>▣</Text>} />
            </View>
            <View style={styles.halfButton}>
              <AppButton title="Partager" onPress={() => void shareCode()} variant="secondary" icon={<Text>↗</Text>} />
            </View>
          </View>
        </Panel>
      ) : (
        <Panel style={styles.actionCard}>
          <Text style={styles.cardEmoji}>✉</Text>
          <Text style={styles.cardTitle}>Créer notre espace</Text>
          <Text style={styles.cardDescription}>Recevez un code privé à partager. Votre personne pourra vous rejoindre quand elle le souhaite.</Text>
          <AppButton title="Créer un code d’invitation" onPress={() => void handleCreate()} loading={loading === 'create'} />
        </Panel>
      )}

      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>OU, SI VOUS AVEZ UN CODE</Text>
        <View style={styles.orLine} />
      </View>

      <Panel style={styles.joinCard}>
        <Text style={styles.cardTitle}>Rejoindre un espace</Text>
        <Text style={styles.cardDescription}>Votre moitié vous a déjà envoyé un code ? C’est par ici.</Text>
        <Field
          label="Code d’invitation"
          value={joinCode}
          onChangeText={(value) => setJoinCode(value.toUpperCase())}
          placeholder="AB-CD-EF"
          autoCapitalize="characters"
          maxLength={8}
          textAlign="center"
          autoCorrect={false}
        />
        <AppButton title="Rejoindre notre espace" onPress={() => void handleJoin()} loading={loading === 'join'} variant="secondary" />
      </Panel>

      <View style={styles.footer}><Text style={styles.footerHeart}>♥</Text><Text style={styles.footerText}>Un espace privé, pour deux personnes.</Text></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 28, gap: 23 },
  hero: { gap: 16 },
  heartBadge: { width: 50, height: 50, borderRadius: 18, backgroundColor: palette.roseSoft, alignItems: 'center', justifyContent: 'center' },
  heroHeart: { color: palette.rose, fontSize: 25 },
  invitationCard: { alignItems: 'center', gap: 12, backgroundColor: '#FFF1F1', borderColor: '#F9DEDF', paddingVertical: 24 },
  invitationEyebrow: { color: palette.roseDark, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  invitationCode: { color: palette.ink, fontSize: 31, fontWeight: '800', letterSpacing: 3 },
  invitationCopy: { color: palette.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },
  halfButton: { flex: 1 },
  actionCard: { gap: 11 },
  cardEmoji: { color: palette.rose, fontSize: 25 },
  cardTitle: { color: palette.ink, fontSize: 17, fontWeight: '800' },
  cardDescription: { color: palette.muted, fontSize: 13, lineHeight: 20 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orLine: { height: 1, backgroundColor: palette.line, flex: 1 },
  orText: { color: palette.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  joinCard: { gap: 13 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 1 },
  footerHeart: { color: palette.rose, fontSize: 12 },
  footerText: { color: palette.muted, fontSize: 12 },
});
