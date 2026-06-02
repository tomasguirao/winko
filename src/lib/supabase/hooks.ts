'use client';

import { useEffect, useState } from 'react';
import { createClient } from './client';
import type { User } from '@supabase/supabase-js';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useCredits() {
  const [credits, setCredits] = useState<number>(0);
  const { user } = useUser();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    supabase
      .from('users')
      .select('credits_balance')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setCredits(data?.credits_balance ?? 0));
  }, [user]);

  return credits;
}
