'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const completeGoogleLogin = async () => {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError('Supabase n’est pas configuré.');
        return;
      }

      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        setError(sessionError?.message || 'Session Google introuvable.');
        return;
      }

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: data.session.access_token }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || 'Impossible de synchroniser le compte Google.');
        return;
      }

      localStorage.setItem('auth_token', result.token);
      router.replace(result.hasSpace ? '/dashboard' : '/auth/create-space');
    };

    void completeGoogleLogin();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-white dark:from-slate-950 dark:via-pink-950/20 dark:to-slate-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        {error ? (
          <>
            <h1 className="text-xl font-semibold text-red-600 mb-3">Connexion Google impossible</h1>
            <p className="text-slate-600 dark:text-slate-400">{error}</p>
          </>
        ) : (
          <p className="text-slate-600 dark:text-slate-300">Connexion avec Google…</p>
        )}
      </Card>
    </main>
  );
}
