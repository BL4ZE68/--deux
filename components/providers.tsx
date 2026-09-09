'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/lib/store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}

export function NotificationToast({ message, type }: { message: string; type: string }) {
  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4 ${
        typeStyles[type as keyof typeof typeStyles] || typeStyles.info
      }`}
    >
      {message}
    </div>
  );
}
