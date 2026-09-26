import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton, Avatar, BrandMark, InlineMessage, LoadingView, PageHeading, Panel, Screen, SectionTitle } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { Memory, Streak } from '@/lib/types';
import { palette } from '@/constants/theme';

function dayCount(value?: string | Date) {
  if (!value) return 0;
  const start = new Date(value);
  if (Number.isNaN(start.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 86_400_000));
}

function formatDate(value?: string | Date) {
  if (!value) return 'À l’instant';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'À l’instant';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, space, token } = useAuth();
  const [streak, setStreak] = useState<Streak | null>(null);
  const [latestMemory, setLatestMemory] = useState<Memory | null>(null);
  const [memoryCount, setMemoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [streakResult, memoryResult] = await Promise.all([
        api.streak(token),
        api.memories(token),
      ]);
      setStreak(streakResult.streak ?? null);
      setLatestMemory(memoryResult.memories[0] ?? null);
      setMemoryCount(memoryResult.memories.length);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger votre espace.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    void loadDashboard();
  }, [loadDashboard]));

  const spaceDate = space?.createdAt ?? space?.created_at;

  return (
    <Screen refreshing={loading} onRefresh={() => void loadDashboard()}>
      <View style={styles.topRow}>
        <BrandMark />
        <Avatar name={user?.firstName ?? '♥'} size={42} />
      </View>

      <PageHeading
        eyebrow="Votre petit monde"
        title={`Bonjour, ${user?.firstName ?? 'vous'} ✨`}
        subtitle="Les beaux souvenirs commencent par un petit moment."
      />

      <Panel style={styles.coupleCard}>
        <View style={styles.coupleTop}>
          <View style={styles.avatars}>
            <Avatar name={user?.firstName ?? 'Vous'} size={49} />
            <View style={styles.partnerAvatar}>
              <Text style={styles.partnerHeart}>{space?.user2_id ? '♥' : '+'}</Text>
            </View>
          </View>
          <View style={styles.coupleCopy}>
            <Text style={styles.coupleLabel}>ENSEMBLE DEPUIS</Text>
            <Text style={styles.coupleDays}>
              {dayCount(spaceDate)} <Text style={styles.coupleDaysCaption}>jours</Text>
            </Text>
          </View>
          <Text style={styles.sparkle}>✦</Text>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.coupleBottom}>
          <Text style={styles.coupleFooter}>
            {space?.user2_id ? 'Votre histoire continue ici, juste entre vous.' : 'Votre espace est prêt pour deux.'}
          </Text>
          <View style={styles.privateBadge}>
            <Text style={styles.privateBadgeText}>♡  PRIVÉ</Text>
          </View>
        </View>
      </Panel>

      {error ? <InlineMessage message={error} /> : null}

      {space?.user2_id ? (
        <View style={styles.statsRow}>
          <Panel style={[styles.statCard, styles.streakCard]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statNumber}>{streak?.current_streak ?? 0}</Text>
            <Text style={styles.statLabel}>
              {streak?.max_streak ? `record · ${streak.max_streak} jours` : 'jours d’affilée'}
            </Text>
          </Panel>
          <Panel style={[styles.statCard, styles.memoriesCard]}>
            <Text style={styles.statEmoji}>✦</Text>
            <Text style={styles.statNumber}>{loading ? '…' : memoryCount >= 50 ? '50+' : memoryCount}</Text>
            <Text style={styles.statLabel}>souvenirs gardés</Text>
          </Panel>
        </View>
      ) : (
        <Panel style={styles.inviteCard}>
          <View style={styles.inviteIcon}>
            <Text style={styles.inviteIconText}>♡</Text>
          </View>
          <Text style={styles.inviteTitle}>Il manque votre moitié</Text>
          <Text style={styles.inviteDescription}>
            Invitez la personne qui rend vos journées plus jolies pour commencer à écrire votre histoire.
          </Text>
          <AppButton title="Inviter ma personne" onPress={() => router.push('/space')} icon={<Text>✉</Text>} />
        </Panel>
      )}

      <AppButton
        title="Ajouter un souvenir"
        onPress={() => router.push('/memory/new')}
        icon={<Text style={styles.addIcon}>＋</Text>}
      />

      <View style={styles.latestHeading}>
        <SectionTitle
          title="Vos derniers instants"
          action="Tout voir  →"
          onAction={() => router.push('/(tabs)/journal')}
        />
      </View>

      {loading ? (
        <LoadingView label="Retrouvons votre histoire…" />
      ) : latestMemory ? (
        <Pressable onPress={() => router.push('/(tabs)/journal')} style={styles.memoryPreview}>
          <View style={styles.memoryIcon}>
            <Text style={styles.memoryIconText}>{latestMemory.type === 'mood' ? '☼' : '♡'}</Text>
          </View>
          <View style={styles.memoryCopy}>
            <Text style={styles.memoryContent} numberOfLines={2}>{latestMemory.content}</Text>
            <Text style={styles.memoryDate}>{formatDate(latestMemory.createdAt ?? latestMemory.created_at)}</Text>
          </View>
          <Text style={styles.memoryArrow}>›</Text>
        </Pressable>
      ) : (
        <Panel style={styles.emptyPreview}>
          <Text style={styles.emptyTitle}>Un petit premier mot ?</Text>
          <Text style={styles.emptyBody}>Gardez ici les petits riens qui comptent beaucoup.</Text>
        </Panel>
      )}

      <Pressable onPress={() => router.push('/(tabs)/journal')} style={styles.journalLink}>
        <Text style={styles.journalLinkText}>Votre journal vous attend</Text>
        <Text style={styles.journalLinkArrow}>→</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/(tabs)/secrets')} style={styles.journalLink}>
        <Text style={styles.journalLinkText}>Vos messages « Ouvre quand… »</Text>
        <Text style={styles.journalLinkArrow}>→</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  coupleCard: { backgroundColor: '#FFF1F1', borderColor: '#F9DEDF', padding: 20 },
  coupleTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatars: { flexDirection: 'row', alignItems: 'center' },
  partnerAvatar: {
    height: 45,
    width: 45,
    marginLeft: -13,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: palette.peach,
    borderWidth: 2,
    borderColor: '#FFF1F1',
  },
  partnerHeart: { color: palette.roseDark, fontSize: 19, fontWeight: '700' },
  coupleCopy: { flex: 1, gap: 4 },
  coupleLabel: { color: palette.roseDark, fontSize: 9, fontWeight: '800', letterSpacing: 1.7 },
  coupleDays: { color: palette.ink, fontSize: 27, fontWeight: '800', letterSpacing: -1 },
  coupleDaysCaption: { color: palette.muted, fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  sparkle: { color: palette.gold, fontSize: 25 },
  cardDivider: { height: 1, backgroundColor: '#F4DEDF', marginVertical: 17 },
  coupleBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  coupleFooter: { flex: 1, color: palette.plum, fontSize: 12, lineHeight: 18 },
  privateBadge: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, backgroundColor: '#FCE0E4' },
  privateBadgeText: { color: palette.roseDark, fontSize: 9, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, minHeight: 127, justifyContent: 'center', gap: 4 },
  streakCard: { backgroundColor: '#FFF9EC', borderColor: '#F3E8CF' },
  memoriesCard: { backgroundColor: '#F2F0FA', borderColor: '#E8E4F3' },
  statEmoji: { fontSize: 17 },
  statNumber: { color: palette.ink, fontSize: 25, fontWeight: '800' },
  statLabel: { color: palette.muted, fontSize: 11, fontWeight: '600' },
  inviteCard: { gap: 10, backgroundColor: '#FFF1F1', borderColor: '#F9DEDF' },
  inviteIcon: { width: 45, height: 45, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCE0E4' },
  inviteIconText: { color: palette.rose, fontSize: 24 },
  inviteTitle: { color: palette.ink, fontSize: 18, fontWeight: '800' },
  inviteDescription: { color: palette.muted, fontSize: 13, lineHeight: 20, marginBottom: 4 },
  addIcon: { color: palette.surface, fontSize: 22, fontWeight: '400' },
  latestHeading: { marginTop: 2 },
  memoryPreview: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  memoryIcon: { width: 48, height: 48, borderRadius: 17, backgroundColor: palette.roseSoft, alignItems: 'center', justifyContent: 'center' },
  memoryIconText: { color: palette.rose, fontSize: 23 },
  memoryCopy: { flex: 1, gap: 5 },
  memoryContent: { color: palette.ink, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  memoryDate: { color: palette.muted, fontSize: 11 },
  memoryArrow: { color: palette.muted, fontSize: 25 },
  emptyPreview: { gap: 6, backgroundColor: palette.surfaceMuted, borderColor: 'transparent' },
  emptyTitle: { color: palette.ink, fontSize: 14, fontWeight: '700' },
  emptyBody: { color: palette.muted, fontSize: 12, lineHeight: 18 },
  journalLink: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  journalLinkText: { color: palette.plum, fontSize: 13, fontWeight: '700' },
  journalLinkArrow: { color: palette.rose, fontSize: 18 },
});
