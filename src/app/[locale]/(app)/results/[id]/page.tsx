'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { MessageCircle, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCredits } from '@/lib/supabase/hooks';

type PhotoResult = {
  id: string; category: string; score: number; vote_count: number;
  storage_path: string; created_at: string;
  hot_pct: number; nice_pct: number; ok_pct: number; nope_pct: number;
  comments: { id: string; content: string; created_at: string }[];
};

const reactions = [
  { key: 'hot_pct',  emoji: '🔥', label: 'HOT',  color: 'bg-red-500' },
  { key: 'nice_pct', emoji: '😍', label: 'NICE', color: 'bg-pink-500' },
  { key: 'ok_pct',   emoji: '🙂', label: 'OK',   color: 'bg-yellow-400' },
  { key: 'nope_pct', emoji: '👎', label: 'NOPE', color: 'bg-blue-500' },
];

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [photo, setPhoto] = useState<PhotoResult | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const credits = useCredits();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('photos')
        .select('*, comments(id, content, created_at)')
        .eq('id', id)
        .single();

      if (data) {
        setPhoto(data as PhotoResult);
        const { data: signed } = await supabase.storage
          .from('photos')
          .createSignedUrl(data.storage_path, 3600);
        if (signed) setPhotoUrl(signed.signedUrl);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
    </div>
  );

  if (!photo) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white/40">Foto no encontrada</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-md mx-auto">
      <AppHeader showBack credits={credits} />

      <div className="flex-1 overflow-y-auto px-4 pb-28">
        {/* Photo */}
        <div className="w-full aspect-[3/4] bg-[#111] rounded-3xl mb-4 overflow-hidden">
          {photoUrl
            ? <img src={photoUrl} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><span className="text-white/20 text-sm">Cargando...</span></div>
          }
        </div>

        {/* Score */}
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5 mb-4 flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs mb-1">Score global</p>
            <p className="text-5xl font-black text-yellow-400">{(photo.score ?? 0).toFixed(1)}</p>
            <p className="text-white/40 text-xs mt-1">/ 10 · {photo.vote_count} votos</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-yellow-400/10 border-2 border-yellow-400 flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-yellow-400" />
          </div>
        </div>

        {/* Vote breakdown */}
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5 mb-4">
          <p className="text-white font-bold text-sm mb-4">Desglose de votos</p>
          <div className="flex flex-col gap-3">
            {reactions.map(r => {
              const val = Math.round((photo as any)[r.key] ?? 0);
              return (
                <div key={r.key} className="flex items-center gap-3">
                  <span className="text-lg w-7">{r.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-white/60 text-xs font-bold">{r.label}</span>
                      <span className="text-white text-xs font-bold">{val}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full`} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comments */}
        <div className="bg-[#111] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-yellow-400" />
            <p className="text-white font-bold text-sm">{photo.comments?.length ?? 0} Comentarios</p>
          </div>
          {photo.comments?.length === 0 && (
            <p className="text-white/30 text-sm text-center py-4">Aún no hay comentarios</p>
          )}
          <div className="flex flex-col gap-3">
            {photo.comments?.map(c => (
              <div key={c.id} className="bg-white/5 rounded-xl px-4 py-3">
                <p className="text-white/80 text-sm">{c.content}</p>
                <p className="text-white/30 text-xs mt-1">{new Date(c.created_at).toLocaleDateString('es-ES')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
