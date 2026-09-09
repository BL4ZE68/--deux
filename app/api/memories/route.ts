import { NextRequest, NextResponse } from 'next/server';
import {
  verifyToken,
  getUserById,
  getSpaceByUserId,
  createMemory,
  createNotification,
  getMemories,
  type Memory,
} from '@/lib/db';

export async function GET(request: NextRequest) {
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

    const space = await getSpaceByUserId(user.id);
    if (!space) {
      return NextResponse.json({ message: 'Espace non trouvé' }, { status: 404 });
    }

    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get('limit') || 50), 100);
    const offset = Math.max(Number(url.searchParams.get('offset') || 0), 0);

    return NextResponse.json({
      memories: await getMemories(space.id, limit, offset),
    });
  } catch (error) {
    console.error('Get memories error:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des souvenirs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Token requis' }, { status: 401 });
    }

    const tokenData = verifyToken(authHeader.substring(7));
    if (!tokenData) {
      return NextResponse.json({ message: 'Token invalide' }, { status: 401 });
    }

    const user = await getUserById(tokenData.userId);
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const space = await getSpaceByUserId(user.id);
    if (!space) {
      return NextResponse.json({ message: 'Espace non trouvé' }, { status: 404 });
    }

    const body = await request.json();
    const allowedTypes: Memory['type'][] = ['word', 'photo', 'video', 'audio', 'mood'];
    const type = body.type as Memory['type'];
    const content = typeof body.content === 'string' ? body.content.trim() : '';

    if (!allowedTypes.includes(type) || !content) {
      return NextResponse.json(
        { message: 'Type et contenu requis' },
        { status: 400 }
      );
    }

    const memory = await createMemory({
      space_id: space.id,
      author_id: user.id,
      type,
      content,
      media_url: typeof body.media_url === 'string' ? body.media_url : undefined,
      mood: typeof body.mood === 'string' ? body.mood : undefined,
    });

    const partnerId = space.user1_id === user.id ? space.user2_id : space.user1_id;
    if (partnerId) {
      await createNotification(
        partnerId,
        'new_memory',
        `${user.firstName} a ajouté un nouveau souvenir.`,
        memory.id
      );
    }

    return NextResponse.json({ memory }, { status: 201 });
  } catch (error) {
    console.error('Create memory error:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du souvenir' },
      { status: 500 }
    );
  }
}
