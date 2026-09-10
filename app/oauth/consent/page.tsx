'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { Heart, ShieldCheck } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

type AuthorizationDetails = {
  authorization_id?: string;
  client?: {
    name?: string;
    uri?: string;
  };
  redirect_uri?: string;
  scope?: string;
  redirect_url?: string;
};

function ConsentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authorizationId = searchParams.get('authorization_id');
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAuthorization = async () => {
      if (!authorizationId) {
        setError('Demande OAuth invalide : authorization_id manquant.');
        setLoading(false);
        return;
      }

      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError('Supabase n’est pas configuré.');
        setLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push(`/auth/login?redirect=/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`);
        return;
      }

      const { data, error: detailsError } =
        await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

      if (detailsError || !data) {
        setError(detailsError?.message || 'Demande d’autorisation introuvable.');
      } else if (!('authorization_id' in data)) {
        window.location.href = data.redirect_url;
        return;
      } else {
        setDetails(data);
      }
      setLoading(false);
    };

    void loadAuthorization();
  }, [authorizationId, router]);

  const decide = async (decision: 'approve' | 'deny') => {
    if (!authorizationId) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    setProcessing(true);
    setError('');
    const result =
      decision === 'approve'
        ? await supabase.auth.oauth.approveAuthorization(authorizationId)
        : await supabase.auth.oauth.denyAuthorization(authorizationId);

    if (result.error) {
      setError(result.error.message);
      setProcessing(false);
      return;
    }

    window.location.href = result.data.redirect_url;
  };

  if (loading) {
    return <p className="text-center text-slate-600 dark:text-slate-300">Chargement de la demande…</p>;
  }

  if (error) {
    return (
      <Card className="w-full max-w-lg p-8">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Autorisation impossible</h1>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </Card>
    );
  }

  if (!details) return null;
  const scopes = details.scope?.split(' ').filter(Boolean) ?? [];

  return (
    <Card className="w-full max-w-lg p-8">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Heart className="w-8 h-8 text-pink-600" />
        <span className="text-2xl font-bold text-slate-900 dark:text-white">À deux</span>
      </div>
      <div className="flex items-start gap-3 mb-6">
        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
            Autoriser {details.client?.name || 'cette application'} ?
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Cette application demande l’accès à votre compte À deux.
          </p>
        </div>
      </div>

      {scopes.length > 0 && (
        <div className="mb-6">
          <p className="font-medium text-slate-900 dark:text-white mb-2">Autorisations demandées</p>
          <ul className="space-y-2">
            {scopes.map((scope) => (
              <li key={scope} className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
                {scope}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          disabled={processing}
          onClick={() => void decide('deny')}
        >
          Refuser
        </Button>
        <Button
          className="flex-1"
          disabled={processing}
          onClick={() => void decide('approve')}
        >
          {processing ? 'Traitement…' : 'Autoriser'}
        </Button>
      </div>
    </Card>
  );
}

export default function OAuthConsentPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-white dark:from-slate-950 dark:via-pink-950/20 dark:to-slate-950 flex items-center justify-center px-4">
      <Suspense fallback={<p>Chargement…</p>}>
        <ConsentContent />
      </Suspense>
    </main>
  );
}
