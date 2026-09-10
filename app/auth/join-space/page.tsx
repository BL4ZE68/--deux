'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { Heart, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

function JoinSpaceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [code, setCode] = useState(searchParams.get('code') || '');

  const handleJoinSpace = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/spaces/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify({ code: code.toUpperCase().replace(/\s/g, '') }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Code invalide ou espace complet');
      setSuccess(true);
      window.setTimeout(() => router.push('/dashboard'), 1000);
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-white dark:from-slate-950 dark:via-pink-950/20 dark:to-slate-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Heart className="mx-auto mb-4 h-8 w-8 text-pink-600" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">À deux</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Rejoindre un espace</p>
        </div>
        <form onSubmit={handleJoinSpace} className="space-y-4">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="7F-K92-XP"
            maxLength={8}
            required
            className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-center font-mono text-lg tracking-widest text-slate-900 focus:border-pink-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          {error && <div className="flex gap-2 rounded-lg bg-red-100 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          {success && <div className="flex gap-2 rounded-lg bg-green-100 p-3 text-sm text-green-700"><CheckCircle className="h-4 w-4 shrink-0" />Vous avez rejoint l’espace avec succès !</div>}
          <Button type="submit" size="lg" className="w-full" disabled={loading || code.length < 5}>
            {loading ? 'Connexion en cours…' : 'Rejoindre notre espace ❤️'}
          </Button>
        </form>
        <button onClick={() => router.push('/auth/create-space')} className="mt-6 w-full text-center text-sm text-pink-600">
          Créer un espace
        </button>
        <Link href="/auth/login" className="mt-3 block w-full text-center text-sm text-slate-500 hover:text-pink-600">
          Se connecter avec un autre compte
        </Link>
      </Card>
    </main>
  );
}

export default function JoinSpacePage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement…</div>}><JoinSpaceForm /></Suspense>;
}
