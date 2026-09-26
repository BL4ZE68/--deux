import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';

import { AppButton, Avatar, BrandMark, InlineMessage, PageHeading, Panel, Screen } from '@/components/ui';
import { palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, space, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareInvite = async () => {
    if (!space?.code) {
      router.push('/space');
      return;
    }
    try {
      await Share.share({
        title: 'Notre espace à deux',
        message: `Rejoins notre espace privé sur À deux 💌\n\nCode d’invitation : ${space.code}`,
      });
    } catch (shareError) {
      setError(shareError instanceof Error ? shareError.message : 'Impossible de partager le code.');
    }
  };

  const copyCode = async () => {
    if (!space?.code) return;
    try {
      await Clipboard.setStringAsync(space.code);
      setCopied(true);
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : 'Impossible de copier le code.');
    }
  };

  const confirmLogout = () => {
    Alert.alert('Se déconnecter ?', 'Vous pourrez retrouver votre espace en vous reconnectant.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: () => {
          void logout().then(() => router.replace('/auth')).catch((logoutError: unknown) => {
            setError(logoutError instanceof Error ? logoutError.message : 'Impossible de fermer la session.');
          });
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.topRow}><BrandMark /></View>
      <PageHeading
        eyebrow="Votre petit monde"
        title="Vous deux"
        subtitle="Un espace tout à vous, pour garder près du cœur les choses qui comptent."
      />

      {error ? <InlineMessage message={error} /> : null}

      <Panel style={styles.personCard}>
        <Avatar name={user?.firstName ?? '♥'} size={58} />
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{user?.firstName ?? 'Votre profil'}</Text>
          <Text style={styles.personEmail}>{user?.email}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>♡  Votre espace privé</Text>
          </View>
        </View>
      </Panel>

      <Panel style={styles.inviteCard}>
        <View style={styles.inviteTop}>
          <View style={styles.inviteIcon}><Text style={styles.inviteIconText}>✉</Text></View>
          <View style={styles.inviteCopy}>
            <Text style={styles.inviteTitle}>{space?.user2_id ? 'Votre espace est à deux' : 'Une place vous attend'}</Text>
            <Text style={styles.inviteDescription}>
              {space?.user2_id
                ? 'Partagez le code de votre espace privé quand vous en avez besoin.'
                : 'Invitez votre personne pour commencer à remplir votre journal.'}
            </Text>
          </View>
        </View>
        {space?.code ? (
          <View style={styles.codeBox}>
            <View>
              <Text style={styles.codeLabel}>CODE PRIVÉ</Text>
              <Text selectable style={styles.codeValue}>{space.code}</Text>
            </View>
            <AppButton
              title={copied ? 'Copié' : 'Copier'}
              onPress={() => void copyCode()}
              variant="secondary"
            />
          </View>
        ) : null}
        <AppButton
          title={space?.code ? 'Partager une invitation' : 'Créer notre espace'}
          onPress={() => void shareInvite()}
          icon={<Text style={styles.shareIcon}>↗</Text>}
        />
      </Panel>

      <Panel style={styles.aboutCard}>
        <View style={styles.aboutRow}>
          <View style={styles.aboutIcon}><Text style={styles.aboutIconText}>♢</Text></View>
          <View style={styles.aboutCopy}>
            <Text style={styles.aboutTitle}>Vos souvenirs restent privés</Text>
            <Text style={styles.aboutDescription}>Seuls les membres de votre espace peuvent lire votre journal.</Text>
          </View>
        </View>
      </Panel>

      <AppButton
        title="Se déconnecter"
        onPress={confirmLogout}
        variant="quiet"
        icon={<Text style={styles.logoutIcon}>↪</Text>}
      />
      <Text style={styles.version}>À deux · Fait avec soin, pour vous deux. ♥</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  personCard: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  personInfo: { flex: 1, gap: 4 },
  personName: { color: palette.ink, fontSize: 18, fontWeight: '800' },
  personEmail: { color: palette.muted, fontSize: 12 },
  verifiedBadge: { alignSelf: 'flex-start', borderRadius: 12, backgroundColor: palette.greenSoft, paddingHorizontal: 9, paddingVertical: 5, marginTop: 3 },
  verifiedText: { color: palette.green, fontSize: 10, fontWeight: '700' },
  inviteCard: { gap: 17, backgroundColor: '#FFF1F1', borderColor: '#F9DEDF' },
  inviteTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  inviteIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#FCE0E4', alignItems: 'center', justifyContent: 'center' },
  inviteIconText: { color: palette.rose, fontSize: 22 },
  inviteCopy: { flex: 1, gap: 4 },
  inviteTitle: { color: palette.ink, fontSize: 15, fontWeight: '800' },
  inviteDescription: { color: palette.muted, fontSize: 11, lineHeight: 17 },
  codeBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderRadius: 16, borderWidth: 1, borderColor: '#F3D7DA', backgroundColor: '#FFFFFF', padding: 12 },
  codeLabel: { color: palette.muted, fontSize: 8, fontWeight: '800', letterSpacing: 1.2 },
  codeValue: { color: palette.ink, fontSize: 17, fontWeight: '800', letterSpacing: 1.2, marginTop: 3 },
  shareIcon: { color: palette.surface, fontSize: 18 },
  aboutCard: { paddingVertical: 16 },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aboutIcon: { width: 37, height: 37, borderRadius: 14, backgroundColor: palette.greenSoft, alignItems: 'center', justifyContent: 'center' },
  aboutIconText: { color: palette.green, fontSize: 19 },
  aboutCopy: { flex: 1, gap: 3 },
  aboutTitle: { color: palette.ink, fontSize: 12, fontWeight: '800' },
  aboutDescription: { color: palette.muted, fontSize: 10, lineHeight: 15 },
  logoutIcon: { color: palette.danger, fontSize: 18 },
  version: { color: palette.muted, fontSize: 10, textAlign: 'center', paddingBottom: 4 },
});
