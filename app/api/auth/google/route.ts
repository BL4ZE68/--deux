import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateToken, getSpaceByUserId, getSupabaseClient } from '@/lib/db';

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
    const profileClient = getSupabaseClient();
    if (!profileClient) {
      return NextResponse.json({ message: 'La clé serveur Supabase est requise' }, { status: 503 });
    }

    let profileId = googleUser.id;
    const { data: existingProfile } = await profileClient
      .from('profiles')
      .select('id, email, first_name, avatar_url')
      .eq('email', email)
      .maybeSingle();

    if (existingProfile) {
      profileId = existingProfile.id;
    } else {
      const metadata = googleUser.user_metadata ?? {};
      const firstName =
        metadata.first_name ||
        metadata.given_name ||
        metadata.full_name?.split(' ')[0] ||
        email.split('@')[0];

      const { error: profileError } = await profileClient.from('profiles').insert({
        id: profileId,
        email,
        first_name: String(firstName).trim(),
        password_hash: `google:${googleUser.id}`,
        avatar_url: metadata.avatar_url ?? null,
      });

      if (profileError) {
        console.error('Google profile sync error:', profileError);
        return NextResponse.json({ message: 'Impossible de créer le profil Google' }, { status: 500 });
      }
    }

    const profile = existingProfile ?? {
      id: profileId,
      email,
      first_name: String(googleUser.user_metadata?.full_name ?? email.split('@')[0]),
      avatar_url: googleUser.user_metadata?.avatar_url,
    };
    const token = generateToken(profile.id, profile.email);
    const space = await getSpaceByUserId(profile.id);

    return NextResponse.json({
      token,
      hasSpace: Boolean(space),
      user: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        avatar: profile.avatar_url,
      },
      space,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json({ message: 'Erreur lors de la connexion avec Google' }, { status: 500 });
  }
}
