'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui';
import { Lock, Plus, Calendar } from 'lucide-react';
import Link from 'next/link';

interface SecretMessage {
  id: string;
  author_id: string;
  title: string;
  content: string;
  opens_at: string;
  created_at: string;
}

export default function SecretsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [secrets, setSecrets] = useState<SecretMessage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    unlocksAt: new Date().toISOString().split('T')[0],
  });

  const loadSecrets = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const res = await fetch('/api/secrets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSecrets(data.secrets);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const meRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!meRes.ok) {
          router.push('/auth/login');
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);
        await loadSecrets();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    void init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');
    if (!token || !formData.title || !formData.content) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/secrets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          opensAt: formData.unlocksAt,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          title: '',
          content: '',
          unlocksAt: new Date().toISOString().split('T')[0],
        });
        await loadSecrets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const isUnlocked = (dateStr: string) => new Date(dateStr).getTime() <= new Date().getTime();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/dashboard">
          <button className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6">
            ← Retour
          </button>
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">💌 Ouvre quand...</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Créer un message
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Titre"
                placeholder="Ouvre quand tu es..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Ton message secret..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <Input
                label="Accessible à partir du"
                type="date"
                value={formData.unlocksAt}
                onChange={(e) => setFormData({ ...formData, unlocksAt: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Création...' : 'Créer le message secret'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="space-y-4">
          {secrets.length === 0 ? (
            <Card className="p-12 text-center">
              <Lock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                Aucun message secret pour l'instant
              </p>
            </Card>
          ) : (
            secrets.map((secret) => {
              const unlocked = isUnlocked(secret.opens_at);
              const isAuthor = secret.author_id === user?.id;

              return (
                <Card key={secret.id} className="p-6">
                  <div className="flex gap-4">
                    <div className="text-pink-600">
                      {unlocked ? (
                        <Heart className="w-5 h-5" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        {secret.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                        <Calendar className="w-4 h-4" />
                        Accessible le {new Date(secret.opens_at).toLocaleDateString('fr-FR')}
                      </div>

                      {unlocked || isAuthor ? (
                        <p className="text-slate-700 dark:text-slate-300 mb-4 italic">
                          {secret.content}
                          {isAuthor && !unlocked && (
                            <span className="block text-xs text-pink-500 mt-1 not-italic">
                              (Visible seulement par vous car vous en êtes l'auteur)
                            </span>
                          )}
                        </p>
                      ) : (
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-center text-slate-500 italic text-sm">
                          Revenez le {new Date(secret.opens_at).toLocaleDateString('fr-FR')} pour découvrir ce message.
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
