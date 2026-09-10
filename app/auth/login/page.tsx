'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import Link from 'next/link';
import { Heart, KeyRound, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setInfo('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      if (mode === 'forgot') {
        const supabase = createSupabaseBrowserClient();
        if (!supabase) throw new Error('La récupération du mot de passe n’est pas configurée.');
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/auth/login`,
        });
        if (resetError) throw resetError;
        setInfo('Un lien de réinitialisation a été envoyé si cette adresse existe.');
        return;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la connexion');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      router.push(data.hasSpace ? '/dashboard' : '/auth/create-space');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError('La connexion sans mot de passe n’est pas configurée.');
      setLoading(false);
      return;
    }
    const { error: magicError } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (magicError) setError(magicError.message);
    else setInfo('Un lien de connexion vient d’être envoyé à ton adresse email.');
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError('La connexion Google n’est pas configurée.');
      setLoading(false);
      return;
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-white dark:from-slate-950 dark:via-pink-950/20 dark:to-slate-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-pink-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">À deux</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {mode === 'forgot' ? 'Réinitialiser votre mot de passe' : 'Retrouvez votre petit monde'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="votre@email.com"
          />
          {mode === 'login' && (
            <Input
              label="Mot de passe"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          )}

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
          {info && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm">
              {info}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Patientez...' : mode === 'forgot' ? 'Envoyer le lien' : 'Se connecter'}
          </Button>
        </form>

        {mode === 'login' && (
          <>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => { setMode('forgot'); setError(''); setInfo(''); }}
                className="text-sm text-pink-600 hover:text-pink-700"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs text-slate-500">OU</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="grid gap-3">
              <Button type="button" variant="secondary" className="w-full" onClick={() => void handleGoogleLogin()} disabled={loading}>
                Continuer avec Google
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => void handleMagicLink()}
                disabled={loading || !formData.email}
              >
                <Mail className="mr-2 h-4 w-4" /> Recevoir un lien magique
              </Button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link href="/auth/code" className="flex items-center justify-center gap-2 rounded-lg border border-pink-200 px-4 py-3 text-sm font-medium text-pink-700 hover:bg-pink-50 dark:border-pink-900 dark:text-pink-300 dark:hover:bg-pink-950/30">
                <KeyRound className="h-4 w-4" /> J’ai un code
              </Link>
              <Link href="/auth/signup" className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                <Sparkles className="h-4 w-4" /> Créer un compte
              </Link>
            </div>
          </>
        )}

        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          {mode === 'forgot' ? (
            <button type="button" onClick={() => setMode('login')} className="text-pink-600 hover:text-pink-700 font-medium">
              Retour à la connexion
            </button>
          ) : (
            <>Accès privé et sécurisé <ShieldCheck className="inline h-4 w-4 text-emerald-600" /></>
          )}
        </p>
      </Card>
    </div>
  );
}
