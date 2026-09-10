import crypto from 'crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  firstName: string;
  avatar?: string;
  createdAt: Date;
}

export interface SharedSpace {
  id: string;
  code: string;
  user1_id: string;
  user2_id?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Streak {
  id: string;
  space_id: string;
  current_streak: number;
  max_streak: number;
  last_memory_at: Date | null;
}

export interface SecretMessage {
  id: string;
  space_id: string;
  author_id: string;
  title: string;
  content: string;
  media_url?: string;
  opens_at: Date;
  created_at: Date;
}

export interface Memory {
  id: string;
  space_id: string;
  author_id: string;
  type: 'word' | 'photo' | 'video' | 'audio' | 'mood';
  content: string;
  media_url?: string;
  mood?: string;
  createdAt: Date;
}

export interface Reaction {
  id: string;
  memory_id: string;
  user_id: string;
  emoji: string;
  createdAt: Date;
}

export interface AppNotification {
  id: string;
  user_id: string;
  kind: string;
  message: string;
  reference_id?: string;
  is_read: boolean;
  createdAt: Date;
}

// NOTE: l'authentification (mots de passe, tokens de session) est
// entièrement déléguée à Supabase Auth — voir lib/auth.ts. Ce fichier ne
// gère plus que les données applicatives (espaces, souvenirs, réactions,
// notifications). Les Maps ci-dessous ne servent que de repli en local
// quand aucun client Supabase n'est configurable (pas de variables d'env).
const db = {
  spaces: new Map<string, SharedSpace>(),
  memories: new Map<string, Memory[]>(),
  invitationCodes: new Map<string, string>(),
};

function normalizeUser(row: Record<string, any>): User {
  return {
    id: String(row.id),
    email: String(row.email ?? '').toLowerCase(),
    firstName: String(row.first_name ?? row.firstName ?? 'Utilisateur'),
    avatar: row.avatar_url ?? row.avatar ?? undefined,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

function normalizeSpace(row: Record<string, any>): SharedSpace {
  return {
    id: String(row.id),
    code: String(row.code ?? ''),
    user1_id: String(row.user1_id),
    user2_id: row.user2_id ? String(row.user2_id) : undefined,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  };
}

function normalizeMemory(row: Record<string, any>): Memory {
  return {
    id: String(row.id),
    space_id: String(row.space_id),
    author_id: String(row.author_id),
    type: row.type,
    content: String(row.content ?? ''),
    media_url: row.media_url ?? undefined,
    mood: row.mood ?? undefined,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

function normalizeReaction(row: Record<string, any>): Reaction {
  return {
    id: String(row.id),
    memory_id: String(row.memory_id),
    user_id: String(row.user_id),
    emoji: String(row.emoji),
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

function normalizeStreak(row: Record<string, any>): Streak {
  return {
    id: String(row.id),
    space_id: String(row.space_id),
    current_streak: Number(row.current_streak || 0),
    max_streak: Number(row.max_streak || 0),
    last_memory_at: row.last_memory_at ? new Date(row.last_memory_at) : null,
  };
}

function normalizeSecret(row: Record<string, any>): SecretMessage {
  return {
    id: String(row.id),
    space_id: String(row.space_id),
    author_id: String(row.author_id),
    title: String(row.title),
    content: String(row.content),
    media_url: row.media_url ?? undefined,
    opens_at: new Date(row.opens_at),
    created_at: new Date(row.created_at),
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getUserById(id: string): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('profiles')
    .select('id, email, first_name, avatar_url, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return normalizeUser(data);
}

/**
 * Crée (ou met à jour) la ligne `profiles` associée à un utilisateur
 * Supabase Auth déjà existant (id = auth.users.id). Utilisé après
 * signUp/signInWithOAuth : Supabase Auth gère le mot de passe/OAuth,
 * cette fonction ne s'occupe que des données de profil applicatives.
 */
export async function upsertProfile(params: {
  id: string;
  email: string;
  firstName: string;
  avatarUrl?: string | null;
}): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('profiles')
    .upsert(
      {
        id: params.id,
        email: params.email.trim().toLowerCase(),
        first_name: params.firstName.trim(),
        avatar_url: params.avatarUrl ?? null,
      },
      { onConflict: 'id', ignoreDuplicates: false }
    )
    .select('id, email, first_name, avatar_url, created_at')
    .single();

  if (error || !data) {
    console.error('upsertProfile error:', error);
    return null;
  }
  return normalizeUser(data);
}

export async function updateUserProfile(userId: string, firstName: string): Promise<User | null> {
  const normalizedName = firstName.trim();
  if (!normalizedName) return null;

  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('profiles')
    .update({ first_name: normalizedName })
    .eq('id', userId)
    .select('id, email, first_name, avatar_url, created_at')
    .single();

  if (error || !data) {
    console.error('updateUserProfile error:', error);
    return null;
  }
  return normalizeUser(data);
}

export async function getSpaceByCode(code: string): Promise<SharedSpace | null> {
  const normalizedCode = code.trim().toUpperCase();
  const client = getSupabaseClient();

  if (client) {
    const { data, error } = await client.from('spaces').select('*').eq('code', normalizedCode).maybeSingle();
    if (!error && data) {
      const space = normalizeSpace(data);
      db.spaces.set(space.id, space);
      db.invitationCodes.set(space.code, space.id);
      return space;
    }
  }

  const spaceId = db.invitationCodes.get(normalizedCode);
  if (!spaceId) return null;
  return db.spaces.get(spaceId) || null;
}

export async function getSpaceByUserId(userId: string): Promise<SharedSpace | null> {
  const client = getSupabaseClient();

  if (client) {
    const { data, error } = await client
      .from('spaces')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const space = normalizeSpace(data);
      db.spaces.set(space.id, space);
      db.invitationCodes.set(space.code, space.id);
      return space;
    }
  }

  for (const space of db.spaces.values()) {
    if (space.user1_id === userId || space.user2_id === userId) {
      return space;
    }
  }
  return null;
}

export function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code.slice(0, 2) + '-' + code.slice(2, 4) + '-' + code.slice(4, 6);
}

export async function createSpace(userId: string): Promise<{ spaceId: string; code: string }> {
  const existingSpace = await getSpaceByUserId(userId);
  if (existingSpace) {
    return { spaceId: existingSpace.id, code: existingSpace.code };
  }

  const client = getSupabaseClient();
  const spaceId = crypto.randomUUID();
  const code = generateInvitationCode();

  if (client) {
    const { data, error } = await client
      .from('spaces')
      .insert({
        id: spaceId,
        code,
        user1_id: userId,
        user2_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      const space = normalizeSpace(data);
      db.spaces.set(space.id, space);
      db.invitationCodes.set(space.code, space.id);
      db.memories.set(space.id, []);
      return { spaceId: space.id, code: space.code };
    }
  }

  const space: SharedSpace = {
    id: spaceId,
    code,
    user1_id: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.spaces.set(space.id, space);
  db.invitationCodes.set(space.code, space.id);
  db.memories.set(space.id, []);

  return { spaceId: space.id, code: space.code };
}

export async function joinSpace(userId: string, code: string): Promise<SharedSpace | null> {
  const existingSpace = await getSpaceByCode(code);
  if (!existingSpace) return null;
  if (existingSpace.user2_id) return null;
  if (existingSpace.user1_id === userId) return null;

  const client = getSupabaseClient();

  if (client) {
    const { data, error } = await client
      .from('spaces')
      .update({
        user2_id: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSpace.id)
      .is('user2_id', null)
      .select()
      .single();

    if (!error && data) {
      const space = normalizeSpace(data);
      db.spaces.set(space.id, space);
      db.invitationCodes.set(space.code, space.id);
      return space;
    }

    return null;
  }

  existingSpace.user2_id = userId;
  existingSpace.updatedAt = new Date();
  db.spaces.set(existingSpace.id, existingSpace);
  return existingSpace;
}

export function addMemory(memory: Memory): void {
  const memories = db.memories.get(memory.space_id) || [];
  const existingIndex = memories.findIndex((item) => item.id === memory.id);
  if (existingIndex >= 0) {
    memories[existingIndex] = memory;
  } else {
    memories.push(memory);
  }
  db.memories.set(memory.space_id, memories);
}

export async function createMemory(
  memory: Omit<Memory, 'id' | 'createdAt'>
): Promise<Memory> {
  const client = getSupabaseClient();
  const id = crypto.randomUUID();
  const createdAt = new Date();

  if (client) {
    const { data, error } = await client
      .from('memories')
      .insert({
        id,
        space_id: memory.space_id,
        author_id: memory.author_id,
        type: memory.type,
        content: memory.content,
        media_url: memory.media_url ?? null,
        mood: memory.mood ?? null,
        created_at: createdAt.toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      const created = normalizeMemory(data);
      addMemory(created);
      return created;
    }
  }

  const created: Memory = { ...memory, id, createdAt };
  addMemory(created);
  return created;
}

export async function getMemories(
  spaceId: string,
  limit = 50,
  offset = 0
): Promise<Memory[]> {
  const client = getSupabaseClient();

  if (client) {
    const { data, error } = await client
      .from('memories')
      .select('*')
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (!error && data) {
      const memories = data.map(normalizeMemory);
      db.memories.set(spaceId, memories);
      return memories;
    }
  }

  const memories = db.memories.get(spaceId) || [];
  return memories
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(offset, offset + limit);
}

export async function getReactions(memoryIds: string[]): Promise<Reaction[]> {
  if (memoryIds.length === 0) return [];
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('reactions')
    .select('*')
    .in('memory_id', memoryIds)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data.map(normalizeReaction);
}

export async function addReaction(
  memoryId: string,
  userId: string,
  emoji: string
): Promise<Reaction | null> {
  const client = getSupabaseClient();
  const id = crypto.randomUUID();
  const createdAt = new Date();

  if (client) {
    const { data, error } = await client
      .from('reactions')
      .upsert(
        {
          id,
          memory_id: memoryId,
          user_id: userId,
          emoji,
          created_at: createdAt.toISOString(),
        },
        { onConflict: 'memory_id,user_id,emoji' }
      )
      .select()
      .single();

    if (!error && data) return normalizeReaction(data);
  }

  return { id, memory_id: memoryId, user_id: userId, emoji, createdAt };
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data.map((row) => ({
    id: String(row.id),
    user_id: String(row.user_id),
    kind: String(row.kind),
    message: String(row.message),
    reference_id: row.reference_id ?? undefined,
    is_read: Boolean(row.is_read),
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  }));
}

export async function createNotification(
  userId: string,
  kind: string,
  message: string,
  referenceId?: string
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  await client.from('notifications').insert({
    user_id: userId,
    kind,
    message,
    reference_id: referenceId ?? null,
  });
}

// STREAKS
export async function getStreak(spaceId: string): Promise<Streak | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('streaks')
    .select('*')
    .eq('space_id', spaceId)
    .maybeSingle();

  if (error || !data) {
    // Initialiser le streak si inexistant
    const newStreak = {
      id: crypto.randomUUID(),
      space_id: spaceId,
      current_streak: 0,
      max_streak: 0,
      last_memory_at: null,
    };
    await client.from('streaks').insert(newStreak);
    return newStreak;
  }
  return normalizeStreak(data);
}

export async function updateStreak(spaceId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const streak = await getStreak(spaceId);
  if (!streak) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDate = streak.last_memory_at
    ? new Date(streak.last_memory_at.getFullYear(), streak.last_memory_at.getMonth(), streak.last_memory_at.getDate())
    : null;

  let newCurrent = streak.current_streak;

  if (!lastDate) {
    newCurrent = 1;
  } else {
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newCurrent += 1;
    } else if (diffDays > 1) {
      newCurrent = 1;
    }
    // Si diffDays === 0, on a déjà posté aujourd'hui, on ne change rien
  }

  const newMax = Math.max(streak.max_streak, newCurrent);

  await client
    .from('streaks')
    .update({
      current_streak: newCurrent,
      max_streak: newMax,
      last_memory_at: now.toISOString(),
    })
    .eq('space_id', spaceId);
}

// SECRETS
export async function getSecrets(spaceId: string): Promise<SecretMessage[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('secret_messages')
    .select('*')
    .eq('space_id', spaceId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(normalizeSecret);
}

export async function createSecret(
  secret: Omit<SecretMessage, 'id' | 'created_at'>
): Promise<SecretMessage | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const id = crypto.randomUUID();
  const { data, error } = await client
    .from('secret_messages')
    .insert({
      id,
      space_id: secret.space_id,
      author_id: secret.author_id,
      title: secret.title,
      content: secret.content,
      media_url: secret.media_url ?? null,
      opens_at: secret.opens_at.toISOString(),
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) return null;
  return normalizeSecret(data);
}

export { db };
