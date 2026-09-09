import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById, joinSpace } from '@/lib/db';

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

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ message: 'Code requis' }, { status: 400 });
    }

    const space = await joinSpace(user.id, code.toUpperCase());

    if (!space) {
      return NextResponse.json(
        { message: 'Ce code n\'existe pas ou l\'espace est déjà complet.' },
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
