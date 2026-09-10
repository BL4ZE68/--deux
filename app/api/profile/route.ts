import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { updateUserProfile } from '@/lib/db';

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
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
