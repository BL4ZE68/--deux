'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import { AlertCircle, ArrowLeft, CheckCircle, Heart, KeyRound } from 'lucide-react';

export default function CodeLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submitCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('Connecte-toi ou crée un compte avant d’utiliser un code d’invitation.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/spaces/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: code.replace(/\s/g, '').toUpperCase() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Code invalide ou espace complet');
      setSuccess('Votre espace est prêt. Bienvenue dans votre petit monde !');
      window.setTimeout(() => router.push('/dashboard'), 900);
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Impossible d’utiliser ce code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-white dark:from-slate-950 dark:via-pink-950/20 dark:to-slate-950 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg p-8 md:p-10">
        <Link href="/auth/login" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-pink-600">
          <ArrowLeft className="h-4 w-4" /> Retour à la connexion
        </Link>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-pink-600 dark:bg-pink-950/40">
            <KeyRound className="h-7 w-7" />
          </div>
          <div className="mb-2 flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-pink-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Connexion par code</h1>
          </div>
          <p className="mb-8 text-slate-600 dark:text-slate-400">
            Entre le code partagé par ta personne pour rejoindre votre espace privé.
          </p>
        </div>

        <form onSubmit={submitCode} className="space-y-5">
          <label htmlFor="space-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Code d’invitation
          </label>
          <input
            id="space-code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase());
              setError('');
            }}
            placeholder="7F-K92-XP"
            maxLength={10}
            autoComplete="one-time-code"
            required
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-4 text-center font-mono text-2xl tracking-[0.2em] text-slate-900 focus:border-pink-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          {error && <div className="flex gap-2 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          {success && <div className="flex gap-2 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"><CheckCircle className="h-4 w-4 shrink-0" />{success}</div>}
          <Button type="submit" size="lg" className="w-full" disabled={loading || code.replace(/\s/g, '').length < 5}>
            {loading ? 'Vérification…' : 'Rejoindre notre espace ❤️'}
          </Button>
        </form>

        <div className="mt-8 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
          <strong>Pas encore de compte ?</strong> Le code est une invitation sécurisée : crée d’abord ton compte, puis reviens ici pour rejoindre l’espace.
          <Link href="/auth/signup" className="mt-3 block font-medium text-pink-600 hover:text-pink-700">Créer mon compte</Link>
        </div>
      </Card>
    </main>
  );
}
