'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, ChevronLeft } from 'lucide-react';

interface AppHeaderProps {
  credits?: number;
  showBack?: boolean;
  title?: string;
}

export function AppHeader({ credits = 0, showBack = false, title }: AppHeaderProps) {
  const router = useRouter();

  return (
    <div className="relative flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
      {showBack ? (
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      ) : (
        <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
          <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
            <span className="text-black text-xs font-black">C</span>
          </div>
          <span className="text-white font-bold text-sm">{credits}</span>
          <Plus className="w-3.5 h-3.5 text-white/60" />
        </div>
      )}

      <div className="absolute left-1/2 -translate-x-1/2 mt-[3px]">
        {title ? (
          <span className="text-white font-black text-lg">{title}</span>
        ) : (
          <Image src="/logo.PNG" alt="Winko" width={140} height={52} className="object-contain" priority />
        )}
      </div>

      <button className="text-2xl">🔥</button>
    </div>
  );
}
