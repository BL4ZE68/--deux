'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { Heart, MessageCircle, Images, Settings, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  firstName: string;
  avatar?: string;
}

interface Space {
  id: string;
  user1_id: string;
  user2_id?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const initializeDashboard = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          localStorage.removeItem('auth_token');
          router.push('/auth/login');
          return;
        }
        const data = await response.json();
        setUser(data.user);
        setSpace(data.space);
      } catch (error) {
        console.error('Error:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    void initializeDashboard();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600" />
      </div>
    );
  }

  if (!user) return null;
  const hasPartner = Boolean(space?.user2_id);

  const navigation = (
    <nav className="p-6 space-y-2">
      <Link href="/dashboard">
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600">
          <Heart className="w-5 h-5" />
          Dashboard
        </div>
      </Link>
      <Link href="/journal">
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">
          <MessageCircle className="w-5 h-5" />
          Journal
        </div>
      </Link>
      <Link href="/memories">
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">
          <Images className="w-5 h-5" />
          Galerie
        </div>
      </Link>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="text-xl font-bold text-pink-600">À deux</div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="pt-16 lg:pt-0 flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform lg:relative lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-pink-600 mb-2">À deux</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{user.firstName}</p>
          </div>
          {navigation}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <Link href="/profile">
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300">
                <Settings className="w-5 h-5" />
                Profil
              </div>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600">
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-5xl">
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Bienvenue, {user.firstName} ! ❤️
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {hasPartner ? 'Votre espace privé est prêt pour vos prochains souvenirs.' : 'Invitez votre personne pour commencer votre histoire.'}
              </p>
            </div>

            {hasPartner && (
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                  ['127', 'jours ensemble'],
                  ['🔥 14', 'jours de streak'],
                  ['284', 'souvenirs'],
                ].map(([value, label]) => (
                  <Card key={label} className="p-6 text-center">
                    <div className="text-3xl font-bold text-pink-600 mb-2">{value}</div>
                    <div className="text-slate-600 dark:text-slate-400">{label}</div>
                  </Card>
                ))}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">💌 Pour toi</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {hasPartner ? 'J’espère que ta journée s’est bien passée ❤️' : 'Aucun message pour l’instant'}
                </p>
                <Link href="/journal"><Button variant="ghost">Lire →</Button></Link>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">📸 Aujourd’hui</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {hasPartner ? 'Ajoutez un nouveau moment à votre histoire.' : 'Aucun souvenir pour l’instant'}
                </p>
                <Link href="/journal"><Button variant="ghost">Voir →</Button></Link>
              </Card>
            </div>

            {hasPartner ? (
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/journal"><Button size="lg" className="w-full"><MessageCircle className="w-5 h-5 mr-2" />Ajouter un souvenir</Button></Link>
                <Link href="/journal"><Button size="lg" variant="secondary" className="w-full"><Heart className="w-5 h-5 mr-2" />Voir le journal</Button></Link>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Heart className="w-12 h-12 text-pink-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Invitez votre personne</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Partagez un code d’invitation pour commencer votre histoire ensemble.</p>
                <Button onClick={() => router.push('/auth/create-space')}>Générer un code d’invitation</Button>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
