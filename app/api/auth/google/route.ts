import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { upsertProfile, getSpaceByUserId } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();
    if (typeof accessToken !== 'string' || !accessToken) {
      return NextResponse.json({ message: 'Jeton Google requis' }, { status: 400 });
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
    const { data: userData, error: userError } = await authClient.auth.getUser(accessToken);
    if (userError || !userData.user || !userData.user.email) {
      return NextResponse.json({ message: 'Session Google invalide' }, { status: 401 });
    }

    const googleUser = userData.user;
    const email = String(googleUser.email).toLowerCase();
    const metadata = googleUser.user_metadata ?? {};
    const firstName =
      metadata.first_name ||
      metadata.given_name ||
      metadata.full_name?.split(' ')[0] ||
      email.split('@')[0];

    // googleUser.id EST l'id Supabase Auth (auth.users.id) : c'est le même
    // id space/auth partout dans l'app, aucun champ password_hash à gérer.
    const profile = await upsertProfile({
      id: googleUser.id,
      email,
      firstName: String(firstName).trim(),
      avatarUrl: metadata.avatar_url ?? null,
    });

    if (!profile) {
      return NextResponse.json(
        {
          message: 'Impossible de créer le profil Google. Vérifie la configuration Supabase.',
        },
        { status: 500 }
      );
    }

    const space = await getSpaceByUserId(profile.id);

    return NextResponse.json({
      token: accessToken,
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
    console.error('Google auth error:', error);
    return NextResponse.json({ message: 'Erreur lors de la connexion avec Google' }, { status: 500 });
  }
}
