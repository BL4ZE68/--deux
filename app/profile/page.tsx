'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui';
import { Settings, LogOut, Moon, Sun } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  firstName: string;
  avatar?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [formData, setFormData] = useState({
    firstName: '',
  });

  useEffect(() => {
    const initializeProfile = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          router.push('/auth/login');
          return;
        }

        const data = await response.json();
        setUser(data.user);
        setFormData({ firstName: data.user.firstName });

        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
        setTheme(savedTheme);
      } catch (error) {
        console.error('Error:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    initializeProfile();
  }, [router]);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // Update HTML element
    if (typeof document !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/dashboard">
          <button className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6">
            ← Retour
          </button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-8">
            <Settings className="w-8 h-8 text-pink-600" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profil</h1>
          </div>
        </div>

        <Card className="p-8 space-y-8">
          {/* User Info */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Informations personnelles
            </h2>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={user.email}
                disabled
                className="opacity-50 cursor-not-allowed"
              />
              <Input
                label="Prénom"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <Button className="w-full md:w-auto">Enregistrer les modifications</Button>
            </div>
          </div>

          {/* Preferences */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Préférences
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="text-slate-700 dark:text-slate-300">
                  Mode {theme === 'light' ? 'clair' : 'sombre'}
                </span>
              </div>
              <Button
                variant="secondary"
                onClick={handleThemeToggle}
              >
                Basculer
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Zone de danger</h2>
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
