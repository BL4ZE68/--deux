'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { Heart, Copy, Share2, ArrowRight } from 'lucide-react';

export default function CreateSpacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateSpace = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/spaces/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'espace');
      }

      const data = await response.json();
      setCode(data.code);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (code) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'À deux',
            text: `Rejoins mon espace privé pour construire notre histoire ensemble ! 🎉`,
            url: `${window.location.origin}/auth/join-space?code=${code}`,
          });
        } catch (error) {
          console.error('Erreur lors du partage:', error);
        }
      }
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-white dark:from-slate-950 dark:via-pink-950/20 dark:to-slate-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 md:p-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-10 h-10 text-pink-600" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">À deux</h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Créons notre petit monde à nous
          </p>
        </div>

        {!code ? (
          <div className="space-y-6">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-8 text-center">
              <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
                Vous êtes prêt à commencer votre histoire ?
              </p>
              <Button
                size="lg"
                onClick={handleCreateSpace}
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? 'Création en cours...' : 'Créer notre espace'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 rounded-xl p-8 text-center border-2 border-pink-300 dark:border-pink-700">
              <p className="text-sm font-medium text-pink-700 dark:text-pink-300 mb-3">
                Votre code d'invitation
              </p>
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 mb-6 font-mono text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-widest">
                {code}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
                Partage ce code avec la personne avec qui tu veux créer votre histoire. ❤️
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={handleCopyCode}
                className="flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" />
                {copied ? 'Copié !' : 'Copier'}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={handleShare}
                className="flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Partager
              </Button>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={handleSkip}
              >
                Passer pour l'instant
              </Button>
              <Button
                className="flex-1 flex items-center justify-center gap-2"
                onClick={handleSkip}
              >
                Continuer
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
