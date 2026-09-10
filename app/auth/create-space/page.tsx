'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { Heart, Copy, Share2, ArrowRight } from 'lucide-react';

export default function CreateSpacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleCreateSpace = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/spaces/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur lors de la création de l’espace');
      setCode(data.code);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!code || !navigator.share) return;
    await navigator.share({
      title: 'À deux',
      text: 'Rejoins mon espace privé pour construire notre histoire ensemble !',
      url: `${window.location.origin}/auth/join-space?code=${code}`,
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-white dark:from-slate-950 dark:via-pink-950/20 dark:to-slate-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-10 h-10 text-pink-600" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">À deux</h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400">Créons notre petit monde à nous</p>
        </div>

        {error && <p className="mb-5 rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</p>}

        {!code ? (
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-8 text-center">
            <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
              Vous êtes prêt à commencer votre histoire ?
            </p>
            <Button size="lg" onClick={() => void handleCreateSpace()} disabled={loading}>
              {loading ? 'Création en cours…' : 'Créer notre espace'}
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="rounded-xl border-2 border-pink-300 bg-pink-50 p-8 text-center dark:border-pink-700 dark:bg-pink-900/30">
              <p className="text-sm font-medium text-pink-700 dark:text-pink-300 mb-3">Votre code d’invitation</p>
              <div className="rounded-lg bg-white p-4 font-mono text-2xl font-bold tracking-widest text-slate-900 dark:bg-slate-900 dark:text-white">
                {code}
              </div>
              <p className="mt-5 text-slate-600 dark:text-slate-400">
                Partage ce code avec la personne avec qui tu veux créer votre histoire. ❤️
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Button size="lg" variant="secondary" onClick={() => void handleCopyCode()}>
                <Copy className="mr-2 h-5 w-5" /> {copied ? 'Copié !' : 'Copier'}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => void handleShare()}>
                <Share2 className="mr-2 h-5 w-5" /> Partager
              </Button>
            </div>
            <div className="flex gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
              <Button variant="ghost" className="flex-1" onClick={() => router.push('/dashboard')}>Plus tard</Button>
              <Button className="flex-1" onClick={() => router.push('/dashboard')}>
                Continuer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
