'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Mail, MapPin, User } from 'lucide-react';
import Image from 'next/image';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Button } from '@/components/ui/Button';

// Placeholder — en producción vendrá de Supabase
const MOCK_NICKNAME = 'Nova7421';

export default function YourIdentityPage() {
  const t = useTranslations('onboarding.yourIdentity');
  const router = useRouter();

  return (
    <div className="w-full flex flex-col items-center">
      <ProgressBar current={5} total={8} />

      {/* Wink mascot */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">✨</span>
        <div className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center overflow-hidden">
          <Image src="/logo-icon.PNG" alt="Winko" width={64} height={64} className="object-contain" />
        </div>
        <span className="text-4xl">✨</span>
      </div>

      <h1 className="text-2xl font-black text-white mb-2 text-center">{t('title')}</h1>
      <p className="text-white/50 text-sm text-center mb-4">{t('subtitle')}</p>

      {/* Nickname */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-yellow-400 text-2xl">✦</span>
        <span className="text-yellow-400 text-4xl font-black tracking-tight">{MOCK_NICKNAME}</span>
        <span className="text-yellow-400 text-2xl">✦</span>
      </div>

      {/* Privacy bullets */}
      <div className="w-full bg-white/5 rounded-2xl p-5 flex flex-col gap-4 mb-8">
        {[
          { icon: User, text: t('privacy1') },
          { icon: Mail, text: t('privacy2') },
          { icon: MapPin, text: t('privacy3') },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-white/60" />
            </div>
            <p className="text-white/70 text-sm">{text}</p>
          </div>
        ))}
      </div>

      <p className="text-white/40 text-xs text-center mb-6">{t('tagline')}</p>

      <Button onClick={() => router.push('./preferences')}>
        {t('button')}
      </Button>
    </div>
  );
}
