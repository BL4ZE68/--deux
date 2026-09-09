import { NextRequest, NextResponse } from 'next/server';
import { getNotifications, getUserById, verifyToken } from '@/lib/db';

export async function GET(request: NextRequest) {
  const header = request.headers.get('authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Token requis' }, { status: 401 });
  }

  const token = verifyToken(header.substring(7));
  if (!token) return NextResponse.json({ message: 'Token invalide' }, { status: 401 });

  const user = await getUserById(token.userId);
  if (!user) return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });

  return NextResponse.json({ notifications: await getNotifications(user.id) });
}
