'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { Images, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MemoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/dashboard">
          <button className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6">
            ← Retour
          </button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">🖼️ Galerie</h1>
          
          <div className="flex gap-2 flex-wrap">
            {['all', 'photos', 'videos'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? 'bg-pink-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {f === 'all' ? 'Tout' : f === 'photos' ? 'Photos' : 'Vidéos'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="aspect-square bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
              <Images className="w-12 h-12 text-pink-600 opacity-50" />
            </Card>
          ))}
        </div>

        {[1, 2, 3, 4, 5, 6].length === 0 && (
          <Card className="p-12 text-center">
            <Images className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Aucune photo ou vidéo pour l'instant
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
