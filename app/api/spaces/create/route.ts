import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createSpace } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Token invalide' }, { status: 401 });
    }

    const { spaceId, code } = await createSpace(user.id);

    return NextResponse.json({ spaceId, code });
  } catch (error) {
    console.error('Create space error:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de l\'espace' },
      { status: 500 }
    );
  }
}
