import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { upsertProfile, getSpaceByUserId } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      return NextResponse.json({ message: 'Supabase n’est pas configuré' }, { status: 503 });
    }

    const authClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await authClient.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password,
    });

    if (error || !data.session || !data.user) {
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // S'assure que le profil existe (cas d'un compte ancien créé avant
    // cette migration, ou profil jamais synchronisé pour une raison X).
    const metadata = data.user.user_metadata ?? {};
    const profile =
      (await upsertProfile({
        id: data.user.id,
        email: data.user.email ?? email,
        firstName: metadata.first_name || email.split('@')[0],
      })) ?? null;

    if (!profile) {
      return NextResponse.json(
        { message: 'Impossible de récupérer le profil.' },
        { status: 500 }
      );
    }

    const space = await getSpaceByUserId(profile.id);

    return NextResponse.json({
      token: data.session.access_token,
      hasSpace: Boolean(space),
      user: {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        avatar: profile.avatar,
      },
      space: space || null,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
