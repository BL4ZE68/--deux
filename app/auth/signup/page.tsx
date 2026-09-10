'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      router.push('/auth/create-space');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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
          <p className="text-slate-600 dark:text-slate-400">Créez votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Prénom"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            placeholder="Votre prénom"
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="votre@email.com"
          />
          <Input
            label="Mot de passe"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />
          <Input
            label="Confirmer le mot de passe"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Inscription en cours...' : 'Créer mon compte'}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs text-slate-500">OU</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>
        <Button type="button" variant="secondary" className="w-full" onClick={() => void handleGoogleSignup()} disabled={loading}>
          Créer un compte avec Google
        </Button>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          Vous avez déjà un compte ?{' '}
          <Link href="/auth/login" className="text-pink-600 hover:text-pink-700 font-medium">
            Se connecter
          </Link>
        </p>
      </Card>
    </div>
  );
}
