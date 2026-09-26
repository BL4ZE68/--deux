import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton, BrandMark, Field, InlineMessage, Panel, Screen } from '@/components/ui';
import { palette } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function AuthScreen() {
  const router = useRouter();
  const { login, signup, ready, user, space } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (ready && user) {
    return <Redirect href={space ? '/(tabs)' : '/space'} />;
  }

  const changeMode = (nextMode: 'login' | 'signup') => {
    setMode(nextMode);
    setError(null);
    setInfo(null);
  };

  const submit = async () => {
    setError(null);
    setInfo(null);
    if (mode === 'signup' && !firstName.trim()) {
      setError('Ajoutez votre prénom pour continuer.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Votre adresse e-mail et votre mot de passe sont requis.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        router.replace('/');
      } else {
        const needsConfirmation = await signup(firstName, email, password);
        if (needsConfirmation) {
          setInfo('Votre compte est créé. Confirmez votre adresse e-mail, puis connectez-vous.');
          setMode('login');
        } else {
          router.replace('/');
        }
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Impossible de vous connecter.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen contentStyle={styles.screenContent}>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/')}>
          <BrandMark />
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.heartBadge}><Text style={styles.heroHeart}>♥</Text></View>
          <Text style={styles.heroTitle}>Notre petit{'\n'}monde, à nous.</Text>
          <Text style={styles.heroDescription}>Les plus belles histoires se construisent dans les petits moments.</Text>
        </View>

        <Panel style={styles.formCard}>
          <View style={styles.formHeading}>
            <Text style={styles.formTitle}>{mode === 'login' ? 'Quel plaisir de vous retrouver' : 'Commençons notre histoire'}</Text>
            <Text style={styles.formSubtitle}>{mode === 'login' ? 'Votre espace vous attend.' : 'Créez votre espace à deux.'}</Text>
          </View>

          {info ? <InlineMessage message={info} tone="success" /> : null}
          {error ? <InlineMessage message={error} /> : null}

          {mode === 'signup' ? (
            <Field
              label="Votre prénom"
              placeholder="Camille"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoComplete="given-name"
              returnKeyType="next"
            />
          ) : null}
          <Field
            label="Adresse e-mail"
            placeholder="vous@exemple.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />
          <Field
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            textContentType={mode === 'login' ? 'password' : 'newPassword'}
            returnKeyType="go"
            onSubmitEditing={() => void submit()}
          />

          <AppButton
            title={mode === 'login' ? 'Retrouver mon espace' : 'Créer mon compte'}
            onPress={() => void submit()}
            loading={submitting}
          />

          <View style={styles.modeRow}>
            <Text style={styles.modeCaption}>
              {mode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => changeMode(mode === 'login' ? 'signup' : 'login')}
            >
              <Text style={styles.modeAction}>{mode === 'login' ? 'S’inscrire' : 'Se connecter'}</Text>
            </Pressable>
          </View>
        </Panel>

        <View style={styles.privacyRow}>
          <Text style={styles.privacyIcon}>♢</Text>
          <Text style={styles.privacyText}>Votre histoire reste entre vous deux.</Text>
        </View>
        {mode === 'login' ? (
          <Pressable onPress={() => changeMode('signup')} style={styles.joinLink}>
            <Text style={styles.joinText}>
              Vous avez déjà un code ? <Text style={styles.joinHighlight}>Créez un compte pour le saisir</Text>
            </Text>
          </Pressable>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1, backgroundColor: palette.background },
  screenContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 26, gap: 24 },
  hero: { gap: 12 },
  heartBadge: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.roseSoft },
  heroHeart: { color: palette.rose, fontSize: 23 },
  heroTitle: { color: palette.ink, fontSize: 37, lineHeight: 43, fontWeight: '800', letterSpacing: -1.4 },
  heroDescription: { color: palette.muted, fontSize: 14, lineHeight: 22, maxWidth: 310 },
  formCard: { gap: 17, padding: 20 },
  formHeading: { gap: 5, marginBottom: 1 },
  formTitle: { color: palette.ink, fontSize: 17, fontWeight: '800' },
  formSubtitle: { color: palette.muted, fontSize: 13 },
  modeRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 },
  modeCaption: { color: palette.muted, fontSize: 12 },
  modeAction: { color: palette.roseDark, fontSize: 12, fontWeight: '800' },
  privacyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  privacyIcon: { color: palette.green, fontSize: 18, fontWeight: '800' },
  privacyText: { color: palette.muted, fontSize: 12 },
  joinLink: { alignItems: 'center', paddingBottom: 6 },
  joinText: { color: palette.muted, fontSize: 12 },
  joinHighlight: { color: palette.roseDark, fontWeight: '800' },
});
