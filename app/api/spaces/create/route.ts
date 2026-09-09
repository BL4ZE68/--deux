import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById, createSpace } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Token requis' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const tokenData = verifyToken(token);

    if (!tokenData) {
      return NextResponse.json({ message: 'Token invalide' }, { status: 401 });
    }

    const user = await getUserById(tokenData.userId);
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
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
