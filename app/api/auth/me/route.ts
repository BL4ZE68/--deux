import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById, getSpaceByUserId } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Token requis' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const tokenData = verifyToken(token);

    if (!tokenData) {
      return NextResponse.json({ message: 'Token invalide ou expiré' }, { status: 401 });
    }

    const user = await getUserById(tokenData.userId);
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const space = await getSpaceByUserId(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        avatar: user.avatar,
      },
      space: space || null,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}
