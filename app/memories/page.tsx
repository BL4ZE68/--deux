'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui';
import { Images, Video, Film } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Memory {
  id: string;
  type: string;
  content: string;
  media_url?: string;
  createdAt: string;
}

type Filter = 'all' | 'photo' | 'video';

export default function MemoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMemories = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch('/api/memories', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Impossible de charger la galerie');
        setMemories(data.memories.filter((memory: Memory) => ['photo', 'video'].includes(memory.type)));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    void loadMemories();
  }, [router]);

  const visibleMemories = useMemo(
    () => filter === 'all' ? memories : memories.filter((memory) => memory.type === filter),
    [filter, memories]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/dashboard">
          <button className="text-slate-600 dark:text-slate-400 mb-6">← Retour</button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">🖼️ Galerie</h1>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'photo', 'video'] as Filter[]).map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === value
                    ? 'bg-pink-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                }`}
              >
                {value === 'all' ? 'Tout' : value === 'photo' ? 'Photos' : 'Vidéos'}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <Card className="p-10 text-center text-red-600">{error}</Card>
        ) : visibleMemories.length === 0 ? (
          <Card className="p-12 text-center">
            <Images className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Aucun média pour ce filtre. Les photos et vidéos partagées apparaîtront ici.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleMemories.map((memory) => (
              <Card key={memory.id} className="overflow-hidden">
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {memory.media_url ? (
                    memory.type === 'video' ? (
                      <video src={memory.media_url} controls className="w-full h-full object-cover" />
                    ) : (
                      <img src={memory.media_url} alt={memory.content || 'Souvenir'} className="w-full h-full object-cover" />
                    )
                  ) : memory.type === 'video' ? (
                    <Video className="w-10 h-10 text-pink-600" />
                  ) : (
                    <Film className="w-10 h-10 text-pink-600" />
                  )}
                </div>
                <p className="p-3 text-sm text-slate-600 dark:text-slate-300 truncate">{memory.content}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
