import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { upsertProfile, getSpaceByUserId } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName } = body;

    if (!email || !password || !firstName) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      return NextResponse.json({ message: 'Supabase n’est pas configuré' }, { status: 503 });
    }

    // L'inscription passe par Supabase Auth : c'est lui qui gère le
    // hachage du mot de passe (bcrypt côté serveur Supabase) et l'identité
    // de l'utilisateur (auth.users). On ne stocke plus jamais de mot de
    // passe nous-mêmes.
    const authClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await authClient.auth.signUp({
      email: String(email).trim().toLowerCase(),
      password,
      options: {
        data: { first_name: String(firstName).trim() },
      },
    });

    if (error || !data.user) {
      const message =
        error?.message === 'User already registered'
          ? 'Cet email est déjà utilisé'
          : error?.message || 'Erreur lors de l\'inscription';
      return NextResponse.json({ message }, { status: 400 });
    }

    const profile = await upsertProfile({
      id: data.user.id,
      email: data.user.email ?? email,
      firstName: String(firstName).trim(),
    });

    if (!profile) {
      return NextResponse.json(
        { message: 'Impossible de créer le profil. Vérifie la configuration Supabase.' },
        { status: 500 }
      );
    }

    // Si la confirmation d'email est activée dans les paramètres Supabase
    // Auth, `data.session` sera null ici : l'utilisateur doit d'abord
    // cliquer sur le lien reçu par email avant de pouvoir se connecter.
    if (!data.session) {
      return NextResponse.json({
        needsEmailConfirmation: true,
        message: 'Compte créé. Vérifie ta boîte mail pour confirmer ton adresse avant de te connecter.',
      });
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
