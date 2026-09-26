import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, spacing } from '@/constants/theme';

export function Screen({
  children,
  scroll = true,
  contentStyle,
  refreshing = false,
  onRefresh,
}: PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: object;
  refreshing?: boolean;
  onRefresh?: () => void;
}>) {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.rose} />
            ) : undefined
          }
          contentContainerStyle={[styles.content, contentStyle]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <View style={styles.brand}>
      <View style={[styles.brandIcon, small && styles.brandIconSmall]}>
        <Text style={[styles.brandHeart, small && styles.brandHeartSmall]}>♥</Text>
      </View>
      <Text style={[styles.brandName, small && styles.brandNameSmall]}>à deux</Text>
    </View>
  );
}

export function PageHeading({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.heading}>
      <View style={styles.headingCopy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
        <Text style={styles.headingTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headingSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Panel({
  children,
  style,
}: PropsWithChildren<{ style?: object }>) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'quiet';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}) {
  const isPrimary = variant === 'primary';
  const isQuiet = variant === 'quiet';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.buttonPrimary : isQuiet ? styles.buttonQuiet : styles.buttonSecondary,
        pressed && !disabled && styles.buttonPressed,
        (disabled || loading) && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? palette.surface : palette.rose} />
      ) : (
        <>
          {icon}
          <Text style={[styles.buttonText, isPrimary ? styles.buttonTextPrimary : styles.buttonTextSecondary]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function RoundButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.roundButton, pressed && styles.buttonPressed]}
    >
      <Text style={styles.roundButtonIcon}>{icon}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  error,
  ...inputProps
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={palette.muted}
        selectionColor={palette.rose}
        style={[styles.field, error && styles.fieldError]}
        {...inputProps}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function InlineMessage({
  message,
  tone = 'error',
}: {
  message: string;
  tone?: 'error' | 'success' | 'info';
}) {
  return (
    <View
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      style={[
        styles.message,
        tone === 'error'
          ? styles.messageError
          : tone === 'success'
            ? styles.messageSuccess
            : styles.messageInfo,
      ]}
    >
      <Text style={styles.messageIcon}>
        {tone === 'error' ? '!' : tone === 'success' ? '✓' : 'i'}
      </Text>
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
}

export function Tag({
  title,
  selected = false,
  onPress,
}: {
  title: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.tag, selected && styles.tagSelected]}
    >
      <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{title}</Text>
    </Pressable>
  );
}

export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{title}</Text>
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function LoadingView({ label = 'Un instant…' }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={palette.rose} size="large" />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

export function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '♥';
  return (
    <View
      style={[
        styles.avatar,
        { height: size, width: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  content: { paddingHorizontal: spacing.screen, paddingTop: 14, paddingBottom: 32, gap: 20 },
  fill: { flex: 1 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: palette.roseSoft,
  },
  brandIconSmall: { width: 30, height: 30, borderRadius: 10 },
  brandHeart: { color: palette.rose, fontSize: 19 },
  brandHeartSmall: { fontSize: 15 },
  brandName: { color: palette.ink, fontSize: 19, fontWeight: '800', letterSpacing: -0.4 },
  brandNameSmall: { fontSize: 16 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  headingCopy: { flex: 1, gap: 5 },
  eyebrow: { color: palette.rose, fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  headingTitle: { color: palette.ink, fontSize: 27, fontWeight: '800', letterSpacing: -0.8 },
  headingSubtitle: { color: palette.muted, fontSize: 14, lineHeight: 21 },
  panel: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderWidth: 1,
    borderRadius: spacing.radius,
    padding: spacing.card,
  },
  button: {
    minHeight: 54,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  buttonPrimary: { backgroundColor: palette.rose },
  buttonSecondary: { backgroundColor: palette.roseSoft },
  buttonQuiet: { backgroundColor: 'transparent' },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.62 },
  buttonText: { fontSize: 15, fontWeight: '700' },
  buttonTextPrimary: { color: palette.surface },
  buttonTextSecondary: { color: palette.roseDark },
  roundButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderWidth: 1,
  },
  roundButtonIcon: { color: palette.ink, fontSize: 19, fontWeight: '700' },
  fieldWrap: { gap: 8 },
  fieldLabel: { color: palette.ink, fontSize: 13, fontWeight: '700' },
  field: {
    minHeight: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 16,
    color: palette.ink,
    backgroundColor: palette.surface,
    fontSize: 15,
  },
  fieldError: { borderColor: palette.danger },
  errorText: { color: palette.danger, fontSize: 12 },
  message: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: 14 },
  messageError: { backgroundColor: palette.dangerSoft },
  messageSuccess: { backgroundColor: palette.greenSoft },
  messageInfo: { backgroundColor: palette.roseSoft },
  messageIcon: { color: palette.roseDark, fontSize: 15, fontWeight: '800' },
  messageText: { flex: 1, color: palette.ink, fontSize: 13, lineHeight: 19 },
  tag: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
  },
  tagSelected: { borderColor: palette.rose, backgroundColor: palette.roseSoft },
  tagText: { color: palette.muted, fontSize: 12, fontWeight: '700' },
  tagTextSelected: { color: palette.roseDark },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleText: { color: palette.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  sectionAction: { color: palette.rose, fontSize: 13, fontWeight: '700' },
  loading: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText: { color: palette.muted, fontSize: 14 },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.roseSoft,
    borderWidth: 2,
    borderColor: palette.surface,
  },
  avatarText: { color: palette.roseDark, fontWeight: '800' },
});
