import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  AppButton,
  Avatar,
  BrandMark,
  InlineMessage,
  LoadingView,
  PageHeading,
  Panel,
  Screen,
  Tag,
} from '@/components/ui';
import { palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { Memory, Reaction } from '@/lib/types';

type FilterKey = 'all' | 'word' | 'mood' | 'photo';

const filters: { key: FilterKey; title: string }[] = [
  { key: 'all', title: 'Tout' },
  { key: 'word', title: 'Petits mots' },
  { key: 'mood', title: 'Humeurs' },
  { key: 'photo', title: 'Photos' },
];

const reactions = ['❤️', '🥹', '✨', '🫶'];

function dateLabel(value?: string | Date) {
  if (!value) return 'À l’instant';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'À l’instant';
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return `Aujourd’hui, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

function EntryCard({
  memory,
  userId,
  entryReactions,
  onReact,
  onOpenMedia,
}: {
  memory: Memory;
  userId: string;
  entryReactions: Reaction[];
  onReact: (memoryId: string, emoji: string) => void;
  onOpenMedia: (url: string) => void;
}) {
  const ownReactions = new Set(
    entryReactions.filter((reaction) => reaction.user_id === userId).map((reaction) => reaction.emoji),
  );

  const entryIcon =
    memory.type === 'mood'
      ? '☼'
      : memory.type === 'photo'
        ? '▧'
        : memory.type === 'video'
          ? '▶'
          : memory.type === 'audio'
            ? '♫'
            : '♡';
  const entryLabel =
    memory.type === 'mood'
      ? 'Humeur partagée'
      : memory.type === 'photo'
        ? 'Un instant capturé'
        : memory.type === 'video'
          ? 'Vidéo partagée'
          : memory.type === 'audio'
            ? 'Message vocal'
            : 'Un petit mot';

  return (
    <Panel style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.entryIdentity}>
          <Avatar name={memory.author_id === userId ? 'Vous' : 'Votre moitié'} size={37} />
          <View style={styles.entryAuthorCopy}>
            <Text style={styles.entryAuthor}>{memory.author_id === userId ? 'Vous' : 'Votre moitié'}</Text>
            <Text style={styles.entryDate}>{dateLabel(memory.createdAt ?? memory.created_at)}</Text>
          </View>
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeIcon}>{entryIcon}</Text>
          <Text style={styles.typeText}>{entryLabel}</Text>
        </View>
      </View>

      {memory.media_url && memory.type === 'photo' ? (
        <Image
          source={{ uri: memory.media_url }}
          resizeMode="cover"
          style={styles.memoryImage}
          accessibilityLabel="Souvenir partagé"
        />
      ) : null}

      {memory.media_url && (memory.type === 'video' || memory.type === 'audio') ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={memory.type === 'video' ? 'Ouvrir la vidéo' : 'Écouter le message vocal'}
          onPress={() => {
            if (memory.media_url) onOpenMedia(memory.media_url);
          }}
          style={({ pressed }) => [styles.mediaLink, pressed && styles.addPressed]}
        >
          <Text style={styles.mediaLinkIcon}>{memory.type === 'video' ? '▶' : '♫'}</Text>
          <View style={styles.mediaLinkCopy}>
            <Text style={styles.mediaLinkTitle}>
              {memory.type === 'video' ? 'Regarder ce souvenir' : 'Écouter ce message'}
            </Text>
            <Text style={styles.mediaLinkSubtitle}>Ouvrir avec votre lecteur</Text>
          </View>
          <Text style={styles.addArrow}>↗</Text>
        </Pressable>
      ) : null}

      {memory.content ? <Text style={styles.entryContent}>{memory.content}</Text> : null}

      {memory.mood ? (
        <View style={styles.moodBadge}>
          <Text style={styles.moodText}>{memory.mood.replaceAll('-', ' ')}</Text>
        </View>
      ) : null}

      <View style={styles.reactionDivider} />
      <View style={styles.reactionRow}>
        {reactions.map((emoji) => {
          const count = entryReactions.filter((reaction) => reaction.emoji === emoji).length;
          const selected = ownReactions.has(emoji);
          return (
            <Pressable
              key={emoji}
              accessibilityRole="button"
              accessibilityLabel={`${count} réaction${count === 1 ? '' : 's'} ${emoji}`}
              accessibilityState={{ selected }}
              onPress={() => onReact(memory.id, emoji)}
              style={[styles.reactionChip, selected && styles.reactionSelected]}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
              {count ? <Text style={[styles.reactionCount, selected && styles.reactionCountSelected]}>{count}</Text> : null}
            </Pressable>
          );
        })}
        <Text style={styles.reactionHint}>Envoyez un peu d’amour</Text>
      </View>
    </Panel>
  );
}

export default function JournalScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [allReactions, setAllReactions] = useState<Reaction[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reactionError, setReactionError] = useState<string | null>(null);

  const loadJournal = useCallback(async (refresh = false) => {
    if (!token) return;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [memoriesResult, reactionsResult] = await Promise.all([
        api.memories(token),
        api.reactions(token),
      ]);
      setMemories(memoriesResult.memories);
      setAllReactions(reactionsResult.reactions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger le journal.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    void loadJournal();
  }, [loadJournal]));

  const filteredMemories = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('fr');
    return memories.filter((memory) => {
      const matchesType = filter === 'all' || memory.type === filter;
      const matchesSearch = !normalizedSearch || memory.content.toLocaleLowerCase('fr').includes(normalizedSearch);
      return matchesType && matchesSearch;
    });
  }, [memories, filter, search]);

  const handleReaction = async (memoryId: string, emoji: string) => {
    if (!token || !user) return;
    setReactionError(null);
    const alreadyReacted = allReactions.some(
      (reaction) => reaction.memory_id === memoryId && reaction.user_id === user.id && reaction.emoji === emoji,
    );
    if (alreadyReacted) return;

    try {
      const result = await api.addReaction(token, memoryId, emoji);
      setAllReactions((current) => [
        ...current.filter((reaction) => reaction.id !== result.reaction.id),
        result.reaction,
      ]);
    } catch (reactionLoadError) {
      setReactionError(
        reactionLoadError instanceof Error ? reactionLoadError.message : 'Impossible d’envoyer cette réaction.',
      );
    }
  };

  const openMedia = async (url: string) => {
    setError(null);
    try {
      await Linking.openURL(url);
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : 'Impossible d’ouvrir ce souvenir.');
    }
  };

  return (
    <Screen refreshing={refreshing} onRefresh={() => void loadJournal(true)}>
      <View style={styles.topRow}>
        <BrandMark />
        <Pressable onPress={() => router.push('/(tabs)/profile')} accessibilityRole="button" accessibilityLabel="Votre profil">
          <Avatar name={user?.firstName ?? '♥'} size={42} />
        </Pressable>
      </View>

      <PageHeading
        eyebrow="Vos petits riens, votre grande histoire"
        title="Notre journal"
        subtitle="Chaque mot, chaque humeur — autant de souvenirs à garder."
      />

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/memory/new')}
        style={({ pressed }) => [styles.addCard, pressed && styles.addPressed]}
      >
        <View style={styles.addIconWrap}><Text style={styles.addIcon}>＋</Text></View>
        <View style={styles.addCopy}>
          <Text style={styles.addTitle}>Un moment à partager ?</Text>
          <Text style={styles.addSubtitle}>Ajoutez un mot, une humeur ou une photo.</Text>
        </View>
        <Text style={styles.addArrow}>›</Text>
      </Pressable>

      <View style={styles.searchField}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher dans votre histoire"
          placeholderTextColor={palette.muted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          accessibilityLabel="Rechercher dans le journal"
        />
        {search ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Effacer la recherche" onPress={() => setSearch('')}>
            <Text style={styles.clearSearch}>×</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        {filters.map((item) => (
          <Tag
            key={item.key}
            title={item.title}
            selected={filter === item.key}
            onPress={() => setFilter(item.key)}
          />
        ))}
      </View>

      <View style={styles.entriesHeading}>
        <Text style={styles.entriesTitle}>{filter === 'all' ? 'Vos souvenirs' : filters.find((item) => item.key === filter)?.title}</Text>
        {!loading ? <Text style={styles.entriesCount}>{filteredMemories.length}</Text> : null}
      </View>

      {reactionError ? <InlineMessage message={reactionError} /> : null}
      {error ? <InlineMessage message={error} /> : null}

      {loading ? (
        <LoadingView label="Retrouvons vos petits instants…" />
      ) : filteredMemories.length ? (
        <View style={styles.entries}>
          {filteredMemories.map((memory) => (
            <EntryCard
              key={memory.id}
              memory={memory}
              userId={user?.id ?? ''}
              entryReactions={allReactions.filter((reaction) => reaction.memory_id === memory.id)}
              onReact={(memoryId, emoji) => void handleReaction(memoryId, emoji)}
              onOpenMedia={(url) => void openMedia(url)}
            />
          ))}
        </View>
      ) : (
        <Panel style={styles.emptyCard}>
          <View style={styles.emptyHeart}><Text style={styles.emptyHeartText}>♡</Text></View>
          <Text style={styles.emptyTitle}>{search ? 'Aucun souvenir trouvé' : 'La première page est à vous'}</Text>
          <Text style={styles.emptyDescription}>
            {search
              ? 'Essayez un autre mot ou changez le filtre.'
              : 'Déposez ici vos petits mots, vos humeurs et les moments que vous voulez garder.'}
          </Text>
          {!search ? <AppButton title="Écrire notre premier mot" onPress={() => router.push('/memory/new')} /> : null}
        </Panel>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addCard: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
    borderRadius: 20,
    backgroundColor: '#FFF1F1',
    borderWidth: 1,
    borderColor: '#F9DEDF',
  },
  addPressed: { opacity: 0.8 },
  addIconWrap: { width: 47, height: 47, borderRadius: 16, backgroundColor: '#FCE0E4', alignItems: 'center', justifyContent: 'center' },
  addIcon: { color: palette.rose, fontSize: 25 },
  addCopy: { flex: 1, gap: 4 },
  addTitle: { color: palette.ink, fontSize: 14, fontWeight: '800' },
  addSubtitle: { color: palette.muted, fontSize: 11, lineHeight: 16 },
  addArrow: { color: palette.rose, fontSize: 25 },
  searchField: { minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 9 },
  searchIcon: { color: palette.rose, fontSize: 24, lineHeight: 26 },
  searchInput: { flex: 1, color: palette.ink, fontSize: 13, paddingVertical: 11 },
  clearSearch: { color: palette.muted, fontSize: 22, paddingHorizontal: 4 },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  entriesHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingTop: 2 },
  entriesTitle: { color: palette.ink, fontSize: 17, fontWeight: '800' },
  entriesCount: { color: palette.roseDark, backgroundColor: palette.roseSoft, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 12, overflow: 'hidden', fontSize: 11, fontWeight: '800' },
  entries: { gap: 13 },
  entryCard: { gap: 15 },
  entryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  entryIdentity: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 },
  entryAuthorCopy: { gap: 3 },
  entryAuthor: { color: palette.ink, fontSize: 12, fontWeight: '800' },
  entryDate: { color: palette.muted, fontSize: 10 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: palette.surfaceMuted, borderRadius: 13, paddingHorizontal: 9, paddingVertical: 7 },
  typeIcon: { color: palette.rose, fontSize: 12 },
  typeText: { color: palette.plum, fontSize: 9, fontWeight: '700' },
  memoryImage: { width: '100%', height: 215, borderRadius: 15, backgroundColor: palette.surfaceMuted },
  mediaLink: { minHeight: 65, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: palette.surfaceMuted },
  mediaLinkIcon: { color: palette.rose, fontSize: 21, width: 40, height: 40, textAlign: 'center', textAlignVertical: 'center', borderRadius: 14, backgroundColor: palette.roseSoft, overflow: 'hidden' },
  mediaLinkCopy: { flex: 1, gap: 4 },
  mediaLinkTitle: { color: palette.ink, fontSize: 12, fontWeight: '800' },
  mediaLinkSubtitle: { color: palette.muted, fontSize: 10 },
  entryContent: { color: palette.ink, fontSize: 15, lineHeight: 23 },
  moodBadge: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#F2F0FA' },
  moodText: { color: palette.plum, fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  reactionDivider: { height: 1, backgroundColor: palette.line },
  reactionRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7 },
  reactionChip: { minHeight: 31, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, borderRadius: 14, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface },
  reactionSelected: { borderColor: '#F0CCD4', backgroundColor: palette.roseSoft },
  reactionEmoji: { fontSize: 13 },
  reactionCount: { color: palette.muted, fontSize: 10, fontWeight: '700' },
  reactionCountSelected: { color: palette.roseDark },
  reactionHint: { color: palette.muted, fontSize: 9, marginLeft: 2 },
  emptyCard: { alignItems: 'center', gap: 11, paddingVertical: 30 },
  emptyHeart: { width: 60, height: 60, borderRadius: 22, backgroundColor: palette.roseSoft, alignItems: 'center', justifyContent: 'center' },
  emptyHeartText: { color: palette.rose, fontSize: 30 },
  emptyTitle: { color: palette.ink, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  emptyDescription: { color: palette.muted, fontSize: 12, lineHeight: 19, textAlign: 'center', marginBottom: 4 },
});
