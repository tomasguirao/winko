'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Flag, Send, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Reaction } from '@/types';

// Mock data — se reemplaza con Supabase
const MOCK_PHOTO = {
  id: '1',
  nickname: 'Nova7421',
  distance_km: 12,
  category: 'body' as const,
  current: 2,
  total: 5,
};

const reactions: { value: Reaction; emoji: string; label: string; border: string; bg: string }[] = [
  { value: 'hot',  emoji: '🔥', label: 'HOT',  border: 'border-red-500',    bg: 'bg-red-500/10' },
  { value: 'nice', emoji: '😍', label: 'NICE', border: 'border-pink-500',   bg: 'bg-pink-500/10' },
  { value: 'ok',   emoji: '🙂', label: 'OK',   border: 'border-yellow-400', bg: 'bg-yellow-400/10' },
  { value: 'nope', emoji: '👎', label: 'NOPE', border: 'border-blue-500',   bg: 'bg-blue-500/10' },
];

export default function FeedPage() {
  const t = useTranslations('feed');
  const [voted, setVoted] = useState<Reaction | null>(null);
  const [comment, setComment] = useState('');

  const handleVote = (reaction: Reaction) => {
    setVoted(reaction);
    // TODO: save vote to Supabase, deduct 1 credit
  };

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-md mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        {/* Credits */}
        <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
          <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
            <span className="text-black text-xs font-black">C</span>
          </div>
          <span className="text-white font-bold text-sm">120</span>
          <Plus className="w-3.5 h-3.5 text-white/60" />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-1">
          <span className="text-white font-black text-xl tracking-tight">WINKO</span>
          <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-5 h-5">
              <circle cx="35" cy="40" r="7" fill="black" />
              <path d="M 55 32 Q 65 40 75 32" stroke="black" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M 22 62 Q 50 82 78 62" stroke="black" strokeWidth="5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Hot streak */}
        <button className="text-2xl">🔥</button>
      </div>

      {/* Privacy tagline */}
      <div className="flex items-center justify-center gap-2 px-4 pb-3">
        <Shield className="w-3.5 h-3.5 text-white/40" />
        <span className="text-white/40 text-xs">
          {t('anonymous')} · {t('noFaces')} · {t('away', { distance: MOCK_PHOTO.distance_km })}
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
              <p className="text-white font-bold text-sm leading-none">{MOCK_PHOTO.nickname}</p>
              <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                </svg>
                {MOCK_PHOTO.distance_km} km away
              </p>
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur rounded-full px-3 py-2 flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4 h-4 opacity-70">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-white text-sm font-semibold capitalize">{t(`category.${MOCK_PHOTO.category}`)}</span>
          </div>
        </div>

        {/* Photo placeholder */}
        <div className="aspect-[3/4] flex items-center justify-center bg-gradient-to-b from-[#1a1500] to-[#0a0a0a]">
          <div className="w-32 h-32 rounded-full bg-yellow-400 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              <circle cx="35" cy="40" r="8" fill="black" />
              <path d="M 55 30 Q 67 42 78 30" stroke="black" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M 20 65 Q 50 88 80 65" stroke="black" strokeWidth="6" fill="none" strokeLinecap="round" />
              {/* Shine lines */}
              <line x1="82" y1="18" x2="90" y2="10" stroke="black" strokeWidth="4" strokeLinecap="round" />
              <line x1="88" y1="28" x2="98" y2="26" stroke="black" strokeWidth="4" strokeLinecap="round" />
              <line x1="80" y1="8" x2="84" y2="0" stroke="black" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Counter + report */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="bg-black/60 backdrop-blur rounded-full px-3 py-1.5">
            <span className="text-white/70 text-sm font-medium">{MOCK_PHOTO.current}/{MOCK_PHOTO.total}</span>
          </div>
          <button className="w-9 h-9 bg-black/60 backdrop-blur rounded-full flex items-center justify-center">
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
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-full w-16 h-16 border-2 justify-center transition-all active:scale-90',
              voted === r.value ? `${r.border} ${r.bg}` : 'border-white/20 bg-white/5'
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
            <button className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Send className="w-3.5 h-3.5 text-black" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-around px-8 pb-8 pt-2 border-t border-white/5">
        <button className="flex flex-col items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white/50">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-white/40 text-xs">{useTranslations('nav')('upload')}</span>
        </button>

        {/* Center logo button */}
        <button className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center -mt-6 shadow-lg shadow-yellow-400/30">
          <svg viewBox="0 0 100 100" className="w-9 h-9">
            <circle cx="35" cy="40" r="8" fill="black" />
            <path d="M 55 30 Q 67 42 78 30" stroke="black" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M 20 65 Q 50 88 80 65" stroke="black" strokeWidth="7" fill="none" strokeLinecap="round" />
          </svg>
        </button>

        <button className="flex flex-col items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white/50">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-white/40 text-xs">{useTranslations('nav')('profile')}</span>
        </button>
      </div>
    </div>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
