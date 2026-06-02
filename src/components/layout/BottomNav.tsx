'use client';

import { useRouter, usePathname, useParams } from 'next/navigation';
import Image from 'next/image';
import { Upload, User } from 'lucide-react';

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string ?? 'es';

  const isUpload  = pathname.includes('/upload');
  const isProfile = pathname.includes('/profile');
  const isFeed    = pathname.includes('/feed');

  const centerIcon = '/icon.PNG';

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-black border-t border-white/5 px-8 pt-3 pb-6 z-50">
      <div className="flex items-center justify-around">

        {/* Upload */}
        <button onClick={() => router.push(`/${locale}/upload`)} className="flex flex-col items-center gap-1">
          <Upload className={`w-6 h-6 ${isUpload ? 'text-yellow-400' : 'text-white/50'}`} />
          <span className={`text-xs ${isUpload ? 'text-yellow-400 font-semibold' : 'text-white/40'}`}>Upload</span>
        </button>

        {/* Feed — botón central */}
        <button
          onClick={() => router.push(`/${locale}/feed`)}
          className={`w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center -mt-6 shadow-lg shadow-yellow-400/30 overflow-hidden transition-transform active:scale-90 ${isFeed ? 'ring-2 ring-white/30' : ''}`}
        >
          <Image src={centerIcon} alt="Winko" width={40} height={40} className="object-contain" />
        </button>

        {/* Profile */}
        <button onClick={() => router.push(`/${locale}/profile`)} className="flex flex-col items-center gap-1">
          <User className={`w-6 h-6 ${isProfile ? 'text-yellow-400' : 'text-white/50'}`} />
          <span className={`text-xs ${isProfile ? 'text-yellow-400 font-semibold' : 'text-white/40'}`}>Profile</span>
        </button>

      </div>
    </div>
  );
}
