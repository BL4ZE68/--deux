import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { joinSpace } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ message: 'Code requis' }, { status: 400 });
    }

    const space = await joinSpace(user.id, code.toUpperCase());

    if (!space) {
      return NextResponse.json(
        { message: 'Ce code n’existe pas, l’espace est déjà complet ou vient d’être rejoint.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ space });
  } catch (error) {
    console.error('Join space error:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la rejoindre de l\'espace' },
      { status: 500 }
    );
  }
}
