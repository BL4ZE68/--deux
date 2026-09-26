import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton, InlineMessage, Panel, Screen, Tag } from '@/components/ui';
import { palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

type MemoryMode = 'word' | 'mood' | 'photo';
type MoodOption = {
  value: 'in-love' | 'happy' | 'peaceful' | 'nostalgic' | 'sad' | 'tired' | 'excited';
  emoji: string;
  label: string;
};

const moods: MoodOption[] = [
  { value: 'in-love', emoji: '🥰', label: 'Amoureux·se' },
  { value: 'happy', emoji: '☀️', label: 'Heureux·se' },
  { value: 'peaceful', emoji: '🌿', label: 'Serein·e' },
  { value: 'nostalgic', emoji: '🍂', label: 'Nostalgique' },
  { value: 'sad', emoji: '🌧️', label: 'Un peu triste' },
  { value: 'tired', emoji: '🌙', label: 'Fatigué·e' },
  { value: 'excited', emoji: '✨', label: 'Enjoué·e' },
];

export default function NewMemoryScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [mode, setMode] = useState<MemoryMode>('word');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodOption | null>(null);
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickPhoto = async () => {
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.78,
      });
      if (!result.canceled) {
        const selectedPhoto = result.assets[0] ?? null;
        if (selectedPhoto?.fileSize && selectedPhoto.fileSize > 25 * 1024 * 1024) {
          setError('Cette photo dépasse la limite de 25 Mo.');
          return;
        }
        setPhoto(selectedPhoto);
      }
    } catch (pickerError) {
      setError(pickerError instanceof Error ? pickerError.message : 'Impossible d’ouvrir votre galerie.');
    }
  };

  const submit = async () => {
    if (!token) {
      setError('Reconnectez-vous pour enregistrer votre souvenir.');
      return;
    }
    if (mode === 'word' && !content.trim()) {
      setError('Écrivez un petit mot avant de l’ajouter à votre journal.');
      return;
    }
    if (mode === 'mood' && !mood) {
      setError('Choisissez l’humeur que vous souhaitez partager.');
      return;
    }
    if (mode === 'photo' && !photo) {
      setError('Choisissez une photo à partager.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      if (mode === 'photo' && photo) {
        const fileName = photo.fileName || `souvenir-${Date.now()}.jpg`;
        const file = new File(photo.uri);
        const formData = new FormData();
        formData.append('type', 'photo');
        formData.append('content', content.trim());
        formData.append('file', file, fileName);
        await api.createMemoryForm(token, formData);
      } else if (mode === 'mood' && mood) {
        const caption = content.trim() || `${mood.emoji} Aujourd’hui, je me sens ${mood.label.toLowerCase()}.`;
        await api.createMemory(token, { type: 'mood', content: caption, mood: mood.value });
      } else {
        await api.createMemory(token, { type: 'word', content: content.trim() });
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’ajouter ce souvenir.');
    } finally {
      setSaving(false);
    }
  };

  const changeMode = (nextMode: MemoryMode) => {
    setMode(nextMode);
    setError(null);
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.modeRow}>
        <Tag title="Un petit mot" selected={mode === 'word'} onPress={() => changeMode('word')} />
        <Tag title="Mon humeur" selected={mode === 'mood'} onPress={() => changeMode('mood')} />
        <Tag title="Une photo" selected={mode === 'photo'} onPress={() => changeMode('photo')} />
      </View>

      {error ? <InlineMessage message={error} /> : null}

      {mode === 'word' ? (
        <Panel style={styles.composerCard}>
          <View style={styles.promptRow}><Text style={styles.promptHeart}>♡</Text><Text style={styles.prompt}>Un mot doux, une pensée, un petit rien…</Text></View>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Je voulais juste te dire que..."
            placeholderTextColor={palette.muted}
            multiline
            maxLength={1000}
            textAlignVertical="top"
            style={styles.composer}
            autoFocus
            accessibilityLabel="Votre petit mot"
          />
          <View style={styles.composerFooter}>
            <Text style={styles.composerHint}>Écrit juste pour vous deux. ♡</Text>
            <Text style={styles.characterCount}>{content.length}/1000</Text>
          </View>
        </Panel>
      ) : null}

      {mode === 'mood' ? (
        <Panel style={styles.moodCard}>
          <Text style={styles.prompt}>Comment vous sentez-vous aujourd’hui ?</Text>
          <View style={styles.moodOptions}>
            {moods.map((option) => {
              const selected = mood?.value === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Humeur : ${option.label}`}
                  accessibilityState={{ selected }}
                  onPress={() => setMood(option)}
                  style={[styles.moodOption, selected && styles.moodOptionSelected]}
                >
                  <Text style={styles.moodEmoji}>{option.emoji}</Text>
                  <Text style={[styles.moodLabel, selected && styles.moodLabelSelected]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Une petite pensée en plus ?"
            placeholderTextColor={palette.muted}
            maxLength={250}
            style={styles.captionField}
          />
        </Panel>
      ) : null}

      {mode === 'photo' ? (
        <Panel style={styles.photoCard}>
          {photo ? (
            <>
              <Image source={{ uri: photo.uri }} style={styles.photoPreview} resizeMode="cover" />
              <Pressable accessibilityRole="button" onPress={() => setPhoto(null)} style={styles.removePhoto}>
                <Text style={styles.removePhotoText}>Retirer cette photo</Text>
              </Pressable>
            </>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => void pickPhoto()} style={styles.photoPicker}>
              <View style={styles.photoIcon}><Text style={styles.photoEmoji}>▧</Text></View>
              <Text style={styles.photoTitle}>Un instant à garder</Text>
              <Text style={styles.photoDescription}>Choisissez une photo dans votre galerie (max. 25 Mo).</Text>
              <Text style={styles.photoAction}>Choisir une photo  →</Text>
            </Pressable>
          )}
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Racontez ce petit moment… (facultatif)"
            placeholderTextColor={palette.muted}
            maxLength={250}
            style={styles.captionField}
          />
          <AppButton title={photo ? 'Changer de photo' : 'Ouvrir ma galerie'} onPress={() => void pickPhoto()} variant="secondary" />
        </Panel>
      ) : null}

      <View style={styles.bottom}>
        <View style={styles.privateNote}><Text style={styles.privateIcon}>♢</Text><Text style={styles.privateText}>Visible seulement dans votre espace privé.</Text></View>
        <AppButton
          title="Garder ce souvenir"
          onPress={() => void submit()}
          loading={saving}
          disabled={saving}
          icon={<Text style={styles.saveHeart}>♡</Text>}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingTop: 22 },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  composerCard: { minHeight: 280, padding: 19, backgroundColor: '#FFFEFD', gap: 14 },
  promptRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  promptHeart: { color: palette.rose, fontSize: 19 },
  prompt: { color: palette.ink, fontSize: 15, fontWeight: '700', lineHeight: 22 },
  composer: { flex: 1, minHeight: 180, color: palette.ink, fontSize: 16, lineHeight: 26, paddingTop: 5 },
  composerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  composerHint: { color: palette.muted, fontSize: 10 },
  characterCount: { color: palette.muted, fontSize: 10 },
  moodCard: { gap: 15 },
  moodOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  moodOption: { width: '31%', minHeight: 86, borderRadius: 17, borderWidth: 1, borderColor: palette.line, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8, backgroundColor: palette.surface },
  moodOptionSelected: { backgroundColor: palette.roseSoft, borderColor: '#F0CCD4' },
  moodEmoji: { fontSize: 24 },
  moodLabel: { color: palette.muted, fontSize: 9, fontWeight: '700', textAlign: 'center' },
  moodLabelSelected: { color: palette.roseDark },
  captionField: { minHeight: 49, borderRadius: 14, borderWidth: 1, borderColor: palette.line, paddingHorizontal: 13, color: palette.ink, fontSize: 13, backgroundColor: palette.surface },
  photoCard: { gap: 14 },
  photoPicker: { minHeight: 235, alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 17, borderWidth: 1, borderColor: palette.line, borderStyle: 'dashed', gap: 10, backgroundColor: palette.surfaceMuted },
  photoIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.roseSoft },
  photoEmoji: { color: palette.rose, fontSize: 26 },
  photoTitle: { color: palette.ink, fontSize: 16, fontWeight: '800' },
  photoDescription: { color: palette.muted, fontSize: 11, lineHeight: 18, textAlign: 'center' },
  photoAction: { color: palette.roseDark, fontSize: 12, fontWeight: '800', paddingTop: 2 },
  photoPreview: { width: '100%', height: 245, borderRadius: 15, backgroundColor: palette.surfaceMuted },
  removePhoto: { alignSelf: 'flex-end', paddingVertical: 4 },
  removePhotoText: { color: palette.danger, fontSize: 11, fontWeight: '700' },
  bottom: { marginTop: 'auto', gap: 14, paddingBottom: 8, paddingTop: 16 },
  privateNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  privateIcon: { color: palette.green, fontSize: 16 },
  privateText: { color: palette.muted, fontSize: 10 },
  saveHeart: { color: palette.surface, fontSize: 17 },
});
