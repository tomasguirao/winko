'use client';

import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Flame, MessageCircle, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCredits } from '@/lib/supabase/hooks';

type Alert = {
  id: string; type: 'vote' | 'comment';
  title: string; body: string; time: string; read: boolean;
  icon: React.ElementType; color: string; bg: string;
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)} días`;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const credits = useCredits();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: votes }, { data: comments }] = await Promise.all([
        supabase.from('votes')
          .select('id, reaction, created_at, photos!inner(user_id, category)')
          .eq('photos.user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30),
        supabase.from('comments')
          .select('id, content, created_at, photos!inner(user_id, category)')
          .eq('photos.user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      const voteAlerts: Alert[] = (votes ?? []).map((v: any) => ({
        id: `v-${v.id}`,
        type: 'vote',
        icon: v.reaction === 'hot' ? Flame : TrendingUp,
        color: v.reaction === 'hot' ? 'text-red-400' : v.reaction === 'nice' ? 'text-pink-400' : 'text-white/60',
        bg: v.reaction === 'hot' ? 'bg-red-400/10' : 'bg-white/10',
        title: `Nuevo voto ${v.reaction?.toUpperCase()} ${v.reaction === 'hot' ? '🔥' : v.reaction === 'nice' ? '😍' : ''}`,
        body: `Tu foto de ${v.photos?.category} ha recibido un voto.`,
        time: timeAgo(v.created_at),
        read: false,
      }));

      const commentAlerts: Alert[] = (comments ?? []).map((c: any) => ({
        id: `c-${c.id}`,
        type: 'comment',
        icon: MessageCircle,
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        title: 'Nuevo comentario 💬',
        body: `"${c.content}"`,
        time: timeAgo(c.created_at),
        read: false,
      }));

      const all = [...voteAlerts, ...commentAlerts]
        .sort((a, b) => a.time.localeCompare(b.time));

      setAlerts(all);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-md mx-auto">
      <AppHeader showBack credits={credits} />

      <div className="px-4 pt-2 pb-4 flex-shrink-0">
        <h1 className="text-xl font-black text-white">Alertas</h1>
        <p className="text-white/40 text-sm">{alerts.length} notificaciones</p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-28">
          {alerts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔔</p>
              <p className="text-white font-bold">Sin alertas aún</p>
              <p className="text-white/40 text-sm mt-1">Aquí verás los votos y comentarios que recibas</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {alerts.map(alert => {
                const Icon = alert.icon;
                return (
                  <div key={alert.id} className="bg-[#111] border border-white/8 rounded-2xl p-4 flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full ${alert.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${alert.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm">{alert.title}</p>
                      <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{alert.body}</p>
                      <p className="text-white/25 text-xs mt-1.5">{alert.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
