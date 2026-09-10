import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserProfile, verifyToken } from '@/lib/db';

export async function PUT(request: NextRequest) {
  const header = request.headers.get('authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Token requis' }, { status: 401 });
  }

  const token = verifyToken(header.substring(7));
  if (!token) return NextResponse.json({ message: 'Token invalide' }, { status: 401 });

  const user = await getUserById(token.userId);
  if (!user) return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });

  const body = await request.json();
  const firstName = typeof body.firstName === 'string' ? body.firstName : '';
  if (firstName.trim().length < 2) {
    return NextResponse.json({ message: 'Le prénom doit contenir au moins 2 caractères' }, { status: 400 });
  }

  const updatedUser = await updateUserProfile(user.id, firstName);
  if (!updatedUser) {
    return NextResponse.json({ message: 'Impossible de mettre à jour le profil' }, { status: 500 });
  }

  return NextResponse.json({
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      avatar: updatedUser.avatar,
    },
  });
}
