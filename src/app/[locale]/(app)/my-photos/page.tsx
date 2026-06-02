'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { TrendingUp, Clock, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCredits } from '@/lib/supabase/hooks';

type Photo = {
  id: string; category: string; status: string;
  score: number | null; vote_count: number;
  storage_path: string; created_at: string;
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  published: { label: 'Publicada', color: 'text-green-400', icon: <TrendingUp className="w-3 h-3" /> },
  pending:   { label: 'Pendiente', color: 'text-yellow-400', icon: <Clock className="w-3 h-3" /> },
  rejected:  { label: 'Rechazada', color: 'text-red-400', icon: <XCircle className="w-3 h-3" /> },
};

export default function MyPhotosPage() {
  const router = useRouter();
  const credits = useCredits();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('my-photos:', data?.length, 'photos, error:', error?.message);
      setPhotos(data ?? []);

      // Thumbnails
      const urls: Record<string, string> = {};
      for (const p of data ?? []) {
        const { data: signed } = await supabase.storage
          .from('photos').createSignedUrl(p.storage_path, 3600);
        if (signed) urls[p.id] = signed.signedUrl;
      }
      setThumbs(urls);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-md mx-auto">
      <AppHeader showBack credits={credits} />

      <div className="px-4 pt-2 pb-4 flex-shrink-0">
        <h1 className="text-xl font-black text-white">Mis fotos</h1>
        <p className="text-white/40 text-sm">{photos.length} fotos subidas</p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-28">
          {photos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📸</p>
              <p className="text-white font-bold">Aún no has subido fotos</p>
              <p className="text-white/40 text-sm mt-1">Sube tu primera foto y empieza a recibir valoraciones</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {photos.map(photo => {
                const status = statusConfig[photo.status] ?? statusConfig.pending;
                return (
                  <button
                    key={photo.id}
                    onClick={() => photo.status === 'published' && router.push(`../results/${photo.id}`)}
                    className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden text-left"
                  >
                    <div className="aspect-[3/4] bg-white/5 overflow-hidden">
                      {thumbs[photo.id]
                        ? <img src={thumbs[photo.id]} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><span className="text-white/20 text-xs capitalize">{photo.category}</span></div>
                      }
                    </div>
                    <div className="p-3">
                      <div className={`flex items-center gap-1 mb-1 ${status.color}`}>
                        {status.icon}
                        <span className="text-xs font-bold">{status.label}</span>
                      </div>
                      {photo.status === 'published' && (
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-400 font-black text-lg">{(photo.score ?? 0).toFixed(1)}</span>
                          <span className="text-white/40 text-xs">{photo.vote_count} votos</span>
                        </div>
                      )}
                      <p className="text-white/30 text-xs mt-1">{new Date(photo.created_at).toLocaleDateString('es-ES')}</p>
                    </div>
                  </button>
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
