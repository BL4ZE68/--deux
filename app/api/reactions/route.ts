import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { addReaction, getSpaceByUserId, getMemories, getReactions, createNotification } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Token invalide' }, { status: 401 });

  const space = await getSpaceByUserId(user.id);
  if (!space) return NextResponse.json({ message: 'Espace non trouvé' }, { status: 404 });

  const memoryId = new URL(request.url).searchParams.get('memoryId');
  if (memoryId) {
    const memories = await getMemories(space.id, 1000, 0);
    if (!memories.some((memory) => memory.id === memoryId)) {
      return NextResponse.json({ message: 'Souvenir non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ reactions: await getReactions([memoryId]) });
  }

  const memories = await getMemories(space.id, 1000, 0);
  return NextResponse.json({
    reactions: await getReactions(memories.map((memory) => memory.id)),
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ message: 'Token invalide' }, { status: 401 });

  const space = await getSpaceByUserId(user.id);
  if (!space) return NextResponse.json({ message: 'Espace non trouvé' }, { status: 404 });

  const body = await request.json();
  const memoryId = typeof body.memoryId === 'string' ? body.memoryId : '';
  const emoji = typeof body.emoji === 'string' ? body.emoji.trim() : '';
  if (!memoryId || !emoji || emoji.length > 16) {
    return NextResponse.json({ message: 'Souvenir et réaction requis' }, { status: 400 });
  }

  const memories = await getMemories(space.id, 1000, 0);
  if (!memories.some((memory) => memory.id === memoryId)) {
    return NextResponse.json({ message: 'Souvenir non trouvé' }, { status: 404 });
  }

  const reaction = await addReaction(memoryId, user.id, emoji);
  if (!reaction) {
    return NextResponse.json({ message: 'Impossible d\u2019ajouter la réaction' }, { status: 500 });
  }
  const memory = memories.find((item) => item.id === memoryId);
  if (memory && memory.author_id !== user.id) {
    await createNotification(
      memory.author_id,
      'new_reaction',
      `${user.firstName} a réagi à ton souvenir ${emoji}.`,
      memoryId
    );
  }
  return NextResponse.json({ reaction }, { status: 201 });
}
