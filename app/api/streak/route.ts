import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSpaceByUserId, getStreak } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Token invalide' }, { status: 401 });
    }

    const space = await getSpaceByUserId(user.id);
    if (!space) {
      return NextResponse.json({ message: 'Espace non trouvé' }, { status: 404 });
    }

    const streak = await getStreak(space.id);
    return NextResponse.json({ streak });
  } catch (error) {
    console.error('Streak error:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
