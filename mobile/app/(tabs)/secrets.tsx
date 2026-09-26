import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  AppButton,
  BrandMark,
  InlineMessage,
  LoadingView,
  PageHeading,
  Panel,
  Screen,
} from '@/components/ui';
import { palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { SecretMessage } from '@/lib/types';

function formatDate(value: string | Date) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date à confirmer'
    : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function SecretCard({
  secret,
  userId,
}: {
  secret: SecretMessage;
  userId: string;
}) {
  const isAuthor = secret.author_id === userId;
  const isLocked = secret.is_locked;

  return (
    <Panel style={styles.secretCard}>
      <View style={styles.secretHeading}>
        <View style={[styles.secretIcon, isLocked && styles.lockedIcon]}>
          <Text style={styles.secretIconText}>{isLocked ? '⌑' : '♡'}</Text>
        </View>
        <View style={styles.secretHeadingCopy}>
          <Text style={styles.secretTitle}>{secret.title}</Text>
          <Text style={styles.secretDate}>
            {isLocked ? 'À découvrir le ' : 'À lire depuis le '}
            {formatDate(secret.opens_at)}
          </Text>
        </View>
      </View>
      {isLocked ? (
        <View style={styles.lockedMessage}>
          <Text style={styles.lockedMessageText}>
            Cette lettre attend le bon moment pour être découverte. 💌
          </Text>
        </View>
      ) : (
        <Text style={styles.secretContent}>{secret.content}</Text>
      )}
      {isAuthor && isLocked ? (
        <Text style={styles.authorNote}>Visible uniquement par vous jusqu’à cette date.</Text>
      ) : null}
    </Panel>
  );
}

export default function SecretsScreen() {
  const { token, user } = useAuth();
  const [secrets, setSecrets] = useState<SecretMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [opensAt, setOpensAt] = useState(startOfToday);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadSecrets = useCallback(async (refresh = false) => {
    if (!token) return;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await api.secrets(token);
      setSecrets(result.secrets);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger vos lettres.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    void loadSecrets();
  }, [loadSecrets]));

  const openDatePicker = () => {
    setError(null);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: opensAt,
        mode: 'date',
        minimumDate: startOfToday(),
        onValueChange: (_event, selectedDate) => {
          if (selectedDate) setOpensAt(selectedDate);
        },
      });
    } else {
      setShowPicker(true);
    }
  };

  const createSecret = async () => {
    if (!token) return;
    if (!title.trim() || !content.trim()) {
      setError('Ajoutez un titre et votre message avant de continuer.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const result = await api.createSecret(token, {
        title: title.trim(),
        content: content.trim(),
        opensAt: opensAt.toISOString(),
      });
      setSecrets((current) => [result.secret, ...current]);
      setTitle('');
      setContent('');
      setShowForm(false);
      setNotice('Votre lettre est gardée au chaud jusqu’au jour choisi. 💌');
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Impossible de créer cette lettre.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={() => void loadSecrets(true)}
    >
      <BrandMark />
      <PageHeading
        eyebrow="Un mot pour plus tard"
        title="Ouvre quand…"
        subtitle="Écrivez une lettre aujourd’hui, à découvrir au moment choisi."
      />

      {error ? <InlineMessage message={error} /> : null}
      {notice ? <InlineMessage message={notice} tone="success" /> : null}

      <AppButton
        title={showForm ? 'Fermer le formulaire' : 'Écrire une lettre'}
        onPress={() => {
          setShowForm((current) => !current);
          setError(null);
          setNotice(null);
        }}
        icon={<Text style={styles.buttonIcon}>{showForm ? '×' : '＋'}</Text>}
      />

      {showForm ? (
        <Panel style={styles.formCard}>
          <Text style={styles.formTitle}>Un petit mot pour votre moitié</Text>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Quand l’ouvrir ?</Text>
            <Pressable
              accessibilityRole="button"
              onPress={openDatePicker}
              style={({ pressed }) => [styles.dateButton, pressed && styles.pressed]}
            >
              <Text style={styles.dateButtonText}>{formatDate(opensAt)}</Text>
              <Text style={styles.dateButtonIcon}>▦</Text>
            </Pressable>
          </View>
          {showPicker && Platform.OS === 'ios' ? (
            <View style={styles.pickerPanel}>
              <DateTimePicker
                value={opensAt}
                mode="date"
                display="spinner"
                locale="fr-FR"
                minimumDate={startOfToday()}
                onValueChange={(_event, selectedDate) => setOpensAt(selectedDate)}
              />
              <AppButton
                title="Confirmer la date"
                variant="secondary"
                onPress={() => setShowPicker(false)}
              />
            </View>
          ) : null}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Le titre de votre lettre</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ouvre quand tu as besoin de sourire…"
              placeholderTextColor={palette.muted}
              maxLength={100}
              returnKeyType="next"
              style={styles.input}
            />
          </View>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Votre message</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Écrivez ce que vous aimeriez lui dire…"
              placeholderTextColor={palette.muted}
              multiline
              maxLength={5000}
              textAlignVertical="top"
              style={[styles.input, styles.messageInput]}
            />
            <Text style={styles.characterCount}>{content.length}/5000</Text>
          </View>
          <AppButton
            title="Garder cette lettre"
            onPress={() => void createSecret()}
            loading={submitting}
          />
        </Panel>
      ) : null}

      <View style={styles.listHeading}>
        <Text style={styles.listTitle}>Vos lettres</Text>
        {!loading ? <Text style={styles.listCount}>{secrets.length}</Text> : null}
      </View>

      {loading ? (
        <LoadingView label="Retrouvons vos lettres…" />
      ) : secrets.length ? (
        <View style={styles.secretList}>
          {secrets.map((secret) => (
            <SecretCard key={secret.id} secret={secret} userId={user?.id ?? ''} />
          ))}
        </View>
      ) : (
        <Panel style={styles.emptyCard}>
          <View style={styles.emptyIcon}><Text style={styles.emptyIconText}>♡</Text></View>
          <Text style={styles.emptyTitle}>Une lettre pour un autre jour ?</Text>
          <Text style={styles.emptyCopy}>
            Laissez quelques mots à découvrir plus tard, pour un jour spécial ou un petit coup de cœur.
          </Text>
        </Panel>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttonIcon: { color: palette.surface, fontSize: 20, fontWeight: '500' },
  formCard: { gap: 17 },
  formTitle: { color: palette.ink, fontSize: 16, fontWeight: '800' },
  fieldWrap: { gap: 8 },
  fieldLabel: { color: palette.ink, fontSize: 13, fontWeight: '700' },
  input: {
    minHeight: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: palette.ink,
    backgroundColor: palette.surface,
    fontSize: 15,
  },
  messageInput: { minHeight: 140 },
  characterCount: { color: palette.muted, textAlign: 'right', fontSize: 11 },
  dateButton: {
    minHeight: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 16,
    backgroundColor: palette.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButtonText: { color: palette.ink, fontSize: 14, fontWeight: '600' },
  dateButtonIcon: { color: palette.rose, fontSize: 20 },
  pickerPanel: {
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: palette.surfaceMuted,
    padding: 10,
    gap: 6,
  },
  pressed: { opacity: 0.78 },
  secretList: { gap: 13 },
  listHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 3 },
  listTitle: { color: palette.ink, fontSize: 18, fontWeight: '800' },
  listCount: {
    color: palette.roseDark,
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: palette.roseSoft,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  secretCard: { gap: 14 },
  secretHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  secretIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.roseSoft,
  },
  lockedIcon: { backgroundColor: palette.surfaceMuted },
  secretIconText: { color: palette.rose, fontSize: 23 },
  secretHeadingCopy: { flex: 1, gap: 5 },
  secretTitle: { color: palette.ink, fontSize: 15, fontWeight: '800' },
  secretDate: { color: palette.muted, fontSize: 11, lineHeight: 16 },
  secretContent: { color: palette.plum, fontSize: 14, lineHeight: 22 },
  lockedMessage: {
    borderRadius: 15,
    backgroundColor: palette.surfaceMuted,
    padding: 15,
  },
  lockedMessageText: { color: palette.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  authorNote: { color: palette.roseDark, fontSize: 11, fontStyle: 'italic' },
  emptyCard: { alignItems: 'center', gap: 9, paddingVertical: 30 },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 19,
    backgroundColor: palette.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconText: { color: palette.rose, fontSize: 26 },
  emptyTitle: { color: palette.ink, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  emptyCopy: { color: palette.muted, fontSize: 12, lineHeight: 19, textAlign: 'center' },
});
