import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSpaceByUserId, createMemory, createNotification, getMemories, getSupabaseClient, type Memory } from '@/lib/db';
import crypto from 'crypto';

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
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Token invalide' }, { status: 401 });
    }

    const space = await getSpaceByUserId(user.id);
    if (!space) {
      return NextResponse.json({ message: 'Espace non trouvé' }, { status: 404 });
    }

    const allowedTypes: Memory['type'][] = ['word', 'photo', 'video', 'audio', 'mood'];
    const contentType = request.headers.get('content-type') || '';
    const body = contentType.includes('multipart/form-data')
      ? await request.formData()
      : await request.json();
    const readValue = (key: string) => {
      const value = body instanceof FormData ? body.get(key) : body[key];
      return typeof value === 'string' ? value : '';
    };
    const type = readValue('type') as Memory['type'];
    const content = readValue('content').trim();
    const file = body instanceof FormData ? body.get('file') : null;

    if (!allowedTypes.includes(type) || (!content && !(file instanceof File))) {
      return NextResponse.json(
        { message: 'Type et contenu requis' },
        { status: 400 }
      );
    }

    let mediaUrl: string | undefined;
    if (file instanceof File) {
      const expectedPrefix = type === 'photo' ? 'image/' : type === 'video' ? 'video/' : 'audio/';
      if (!file.type.startsWith(expectedPrefix)) {
        return NextResponse.json({ message: 'Format de fichier incompatible' }, { status: 400 });
      }
      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json({ message: 'Le fichier ne doit pas dépasser 25 Mo' }, { status: 400 });
      }

      const storage = getSupabaseClient();
      if (!storage || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json(
          { message: 'Configure SUPABASE_SERVICE_ROLE_KEY pour activer les uploads' },
          { status: 503 }
        );
      }

      const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const path = `${space.id}/${user.id}/${crypto.randomUUID()}.${extension}`;
      const upload = await storage.storage.from('memories').upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upload.error) {
        console.error('Memory upload error:', upload.error);
        return NextResponse.json({ message: 'Impossible d’envoyer le fichier' }, { status: 500 });
      }
      const signed = await storage.storage.from('memories').createSignedUrl(path, 60 * 60 * 24 * 7);
      if (signed.error || !signed.data?.signedUrl) {
        return NextResponse.json({ message: 'Impossible de préparer le média' }, { status: 500 });
      }
      mediaUrl = signed.data.signedUrl;
    }

    const memory = await createMemory({
      space_id: space.id,
      author_id: user.id,
      type,
      content,
      media_url: mediaUrl,
      mood: readValue('mood') || undefined,
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
