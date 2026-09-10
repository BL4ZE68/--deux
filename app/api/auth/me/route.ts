import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSpaceByUserId } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Token invalide ou expiré' }, { status: 401 });
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
