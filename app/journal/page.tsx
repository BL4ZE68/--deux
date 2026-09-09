'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { AddMemoryModal } from '@/components/AddMemoryModal';
import { Heart, MessageCircle, Images, Plus, Smile } from 'lucide-react';
import Link from 'next/link';

interface Memory {
  id: string;
  author_id: string;
  type: string;
  content: string;
  createdAt: string;
  media_url?: string;
  mood?: string;
}

export default function JournalPage() {
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadMemories = async (token: string) => {
    const response = await fetch('/api/memories', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Impossible de charger les souvenirs');
    const data = await response.json();
    setMemories(data.memories);
  };

  useEffect(() => {
    const initializeJournal = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          router.push('/auth/login');
          return;
        }
        await loadMemories(token);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    void initializeJournal();
  }, [router]);

  const addMemory = async (type: string, content: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    const response = await fetch('/api/memories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type,
        content,
        mood: type === 'mood' ? content : undefined,
      }),
    });
    if (!response.ok) throw new Error('Impossible de partager ce souvenir');
    const data = await response.json();
    setMemories((current) => [data.memory, ...current]);
  };

  const addReaction = async (memoryId: string, emoji: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    const response = await fetch('/api/reactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ memoryId, emoji }),
    });
    if (!response.ok) throw new Error('Impossible d’ajouter la réaction');
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      word: <MessageCircle className="w-5 h-5" />,
      photo: <Images className="w-5 h-5" />,
      mood: <Smile className="w-5 h-5" />,
    };
    return icons[type] || <Heart className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/dashboard">
          <button className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6">
            ← Retour
          </button>
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">📖 Notre journal</h1>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ajouter
          </Button>
        </div>

        {memories.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Votre histoire commence ici. Ajoutez votre premier souvenir ! ❤️
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {memories.map((memory) => (
              <Card key={memory.id} className="p-6">
                <div className="flex gap-4">
                  <div className="text-pink-600">{getTypeIcon(memory.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                      {new Date(memory.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                      })}{' '}
                      ·{' '}
                      {new Date(memory.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-slate-900 dark:text-white mb-4">{memory.content}</p>
                    <div className="flex gap-2">
                      {['❤️', '🥹', '✨'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => void addReaction(memory.id, emoji)}
                          className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-lg"
                          aria-label={`Réagir avec ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <AddMemoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addMemory}
      />
    </div>
  );
}
