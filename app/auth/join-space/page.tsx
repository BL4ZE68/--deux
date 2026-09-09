'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { Heart, AlertCircle, CheckCircle } from 'lucide-react';

function JoinSpaceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [code, setCode] = useState(searchParams.get('code') || '');

  const handleJoinSpace = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/spaces/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ code: code.toUpperCase().replace(/\s/g, '') }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error((data as any)?.message || 'Code invalide ou espace plein');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err && err.message ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-white dark:from-slate-950 dark:via-pink-950/20 dark:to-slate-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-pink-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">? deux</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">Rejoindre un espace</p>
        </div>

        <form onSubmit={handleJoinSpace} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Code d'invitation
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="7F-K92-XP"
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors text-center font-mono text-lg tracking-widest"
              maxLength={11}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm flex gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Vous avez rejoint l'espace avec succ?s !</span>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading || !code}>
            {loading ? 'Connexion en cours...' : 'Rejoindre notre espace ??'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          Vous n'avez pas de code ?{' '}
          <button
            onClick={() => router.push('/auth/create-space')}
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            Cr?er un espace
          </button>
        </p>
      </Card>
    </div>
  );
}

export default function JoinSpacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <JoinSpaceForm />
    </Suspense>
  );
}
