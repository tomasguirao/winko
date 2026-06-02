'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Flag, Send, Plus, Shield } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { useCredits } from '@/lib/supabase/hooks';
import type { Reaction } from '@/types';

type FeedPhoto = {
  id: string; nickname: string; age: number; gender: string;
  distance_km: number | null; category: string;
  storage_path: string; photo_url?: string;
};

const reactions: { value: Reaction; emoji: string; label: string; border: string; bg: string }[] = [
  { value: 'hot',  emoji: '🔥', label: 'HOT',  border: 'border-red-500',    bg: 'bg-red-500/10' },
  { value: 'nice', emoji: '😍', label: 'NICE', border: 'border-pink-500',   bg: 'bg-pink-500/10' },
  { value: 'ok',   emoji: '🙂', label: 'OK',   border: 'border-yellow-400', bg: 'bg-yellow-400/10' },
  { value: 'nope', emoji: '👎', label: 'NOPE', border: 'border-blue-500',   bg: 'bg-blue-500/10' },
];

export default function FeedPage() {
  const t = useTranslations('feed');
  const router = useRouter();
  const supabase = createClient();
  const credits = useCredits();

  const [queue, setQueue] = useState<FeedPhoto[]>([]);
  const [current, setCurrent] = useState<FeedPhoto | null>(null);
  const [index, setIndex] = useState(0);
  const [voted, setVoted] = useState<Reaction | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadFeed = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('feed_photos')
      .select('*')
      .limit(20);

    if (!data?.length) { setLoading(false); return; }

    // Get signed URLs
    const withUrls = await Promise.all(data.map(async (p: FeedPhoto) => {
      const { data: signed } = await supabase.storage
        .from('photos').createSignedUrl(p.storage_path, 3600);
      return { ...p, photo_url: signed?.signedUrl };
    }));

    setQueue(withUrls);
    setCurrent(withUrls[0]);
    setLoading(false);
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  // Load more when near end
  useEffect(() => {
    if (queue.length > 0 && index >= queue.length - 3) loadFeed();
  }, [index]);

  const nextPhoto = () => {
    const next = index + 1;
    setIndex(next);
    setCurrent(queue[next] ?? null);
    setVoted(null);
    setComment('');
  };

  const handleVote = async (reaction: Reaction) => {
    if (!current || voted || submitting) return;
    setVoted(reaction);
    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ photo_id: current.id, reaction }),
    });

    setSubmitting(false);
    // Auto-advance after short delay
    setTimeout(nextPhoto, 600);
  };

  const handleComment = async () => {
    if (!comment.trim() || !current) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('comments').insert({
      photo_id: current.id,
      user_id: user.id,
      content: comment.trim(),
    });
    setComment('');
  };

  const handleReport = async () => {
    if (!current) return;
    const reason = prompt('Motivo del reporte:');
    if (!reason) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('reports').insert({
      photo_id: current.id,
      reporter_id: user.id,
      type: 'photo',
      reason: 'offensive',
      details: reason,
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
    </div>
  );

  if (!current) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl mb-4">🎉</p>
      <p className="text-white font-black text-xl mb-2">¡Has visto todo!</p>
      <p className="text-white/40 text-sm">Vuelve más tarde para ver nuevas fotos</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-md mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div
          onClick={() => router.push('buy-credits')}
          className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
            <span className="text-black text-xs font-black">C</span>
          </div>
          <span className="text-white font-bold text-sm">{credits}</span>
          <Plus className="w-3.5 h-3.5 text-white/60" />
        </div>
        <Image src="/logo.PNG" alt="Winko" width={100} height={36} className="object-contain" priority />
        <button className="text-2xl">🔥</button>
      </div>

      {/* Privacy tagline */}
      <div className="flex items-center justify-center gap-2 px-4 pb-3">
        <Shield className="w-3.5 h-3.5 text-white/40" />
        <span className="text-white/40 text-xs">
          {t('anonymous')} · {t('noFaces')} · {current.distance_km ? t('away', { distance: Math.round(current.distance_km) }) : 'Global'}
        </span>
      </div>

      {/* Photo card */}
      <div className="mx-4 rounded-3xl bg-[#111] overflow-hidden flex-1 relative">

        {/* User info */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur rounded-full px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#F5C000" strokeWidth={2} className="w-4 h-4">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">{current.nickname}</p>
              <p className="text-white/50 text-xs mt-0.5">
                {current.age} · {current.distance_km ? `${Math.round(current.distance_km)} km` : 'Global'}
              </p>
            </div>
          </div>
          <div className="bg-black/60 backdrop-blur rounded-full px-3 py-2">
            <span className="text-white text-sm font-semibold capitalize">{current.category}</span>
          </div>
        </div>

        {/* Photo */}
        <div className="aspect-[3/4]">
          {current.photo_url
            ? <img src={current.photo_url} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-b from-[#1a1500] to-[#0a0a0a] flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-yellow-400 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-24 h-24">
                    <circle cx="35" cy="40" r="8" fill="black" />
                    <path d="M 55 30 Q 67 42 78 30" stroke="black" strokeWidth="6" fill="none" strokeLinecap="round" />
                    <path d="M 20 65 Q 50 88 80 65" stroke="black" strokeWidth="6" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
          }
        </div>

        {/* Counter + report */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="bg-black/60 backdrop-blur rounded-full px-3 py-1.5">
            <span className="text-white/70 text-sm font-medium">{index + 1}/{queue.length}</span>
          </div>
          <button onClick={handleReport} className="w-9 h-9 bg-black/60 backdrop-blur rounded-full flex items-center justify-center">
            <Flag className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      {/* Vote buttons */}
      <div className="grid grid-cols-4 gap-3 px-4 py-4">
        {reactions.map(r => (
          <button
            key={r.value}
            onClick={() => handleVote(r.value)}
            disabled={!!voted || submitting}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-full w-16 h-16 border-2 justify-center transition-all active:scale-90',
              voted === r.value ? `${r.border} ${r.bg}` : 'border-white/20 bg-white/5',
              voted && voted !== r.value ? 'opacity-40' : ''
            )}
          >
            <span className="text-2xl">{r.emoji}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3 px-4 pb-2">
        {reactions.map(r => (
          <p key={r.value} className="text-center text-white/60 text-xs font-bold">{r.label}</p>
        ))}
      </div>

      {/* Comment input */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 bg-white/8 border border-white/10 rounded-2xl px-4 py-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-white/40 flex-shrink-0">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <input
            type="text"
            placeholder={t('commentPlaceholder')}
            value={comment}
            onChange={e => setComment(e.target.value.slice(0, 120))}
            className="flex-1 bg-transparent text-white placeholder-white/30 text-sm focus:outline-none"
          />
          {comment && (
            <button onClick={handleComment} className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Send className="w-3.5 h-3.5 text-black" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-around px-8 pb-8 pt-2 border-t border-white/5">
        <button onClick={() => router.push('upload')} className="flex flex-col items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white/50">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-white/40 text-xs">{t('...')}</span>
        </button>
        <button className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center -mt-6 shadow-lg shadow-yellow-400/30 overflow-hidden">
          <Image src="/logo-icon.PNG" alt="Winko" width={40} height={40} className="object-contain" />
        </button>
        <button onClick={() => router.push('profile')} className="flex flex-col items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white/50">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-white/40 text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}
