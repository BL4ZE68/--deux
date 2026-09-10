import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  avatar?: string;
}

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
}

function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
}

function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization');
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token || null;
}

export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  const token = extractBearerToken(request);
  if (!token) return null;

  const url = getSupabaseUrl();
  const anonKey = getAnonKey();
  if (!url || !anonKey) return null;

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user?.email) return null;

  const profileClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: profile } = await profileClient
    .from('profiles')
    .select('id, email, first_name, avatar_url')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!profile) return null;
  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.first_name,
    avatar: profile.avatar_url ?? undefined,
  };
}

export function createSupabaseClientForToken(token: string) {
  const url = getSupabaseUrl();
  const anonKey = getAnonKey();
  if (!url || !anonKey || !token) return null;

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export function extractToken(request: NextRequest): string | null {
  return extractBearerToken(request);
}
