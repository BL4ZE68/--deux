'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { createClient } from '@supabase/supabase-js';

export function useRealtimeSync(
  onMemoryChange?: () => void,
  onReactionChange?: () => void
) {
  const { space } = useAuthStore();

  useEffect(() => {
    if (!space) return;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    const client = createClient(url, key, {
      auth: { persistSession: false },
    });
    const channel = client
      .channel(`space-${space.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'memories', filter: `space_id=eq.${space.id}` },
        () => onMemoryChange?.()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        () => onReactionChange?.()
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [space, onMemoryChange, onReactionChange]);
}
