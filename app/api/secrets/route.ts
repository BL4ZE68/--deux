import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSpaceByUserId, getSecrets, createSecret } from '@/lib/db';

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

    const secrets = await getSecrets(space.id);
    return NextResponse.json({ secrets });
  } catch (error) {
    console.error('Secrets GET error:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Token invalide' }, { status: 401 });
    }

    const space = await getSpaceByUserId(user.id);
    if (!space) {
      return NextResponse.json({ message: 'Espace non trouvé' }, { status: 404 });
    }

    const body = await request.json();
    const { title, content, opensAt } = body;

    if (!title || !content || !opensAt) {
      return NextResponse.json({ message: 'Données manquantes' }, { status: 400 });
    }

    const secret = await createSecret({
      space_id: space.id,
      author_id: user.id,
      title,
      content,
      opens_at: new Date(opensAt),
    });

    if (!secret) {
      return NextResponse.json({ message: 'Erreur lors de la création' }, { status: 500 });
    }

    return NextResponse.json({ secret }, { status: 201 });
  } catch (error) {
    console.error('Secrets POST error:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
