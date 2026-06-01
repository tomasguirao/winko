'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Button } from '@/components/ui/Button';

export default function WelcomePage() {
  const t = useTranslations('onboarding.welcome');
  const router = useRouter();

  return (
    <div className="w-full flex flex-col items-center">
      <ProgressBar current={7} total={8} />

      {/* Gift box */}
      <div className="text-8xl mb-6 animate-bounce">🎁</div>

      <h1 className="text-3xl font-black text-white mb-4 text-center">{t('title')}</h1>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎉</span>
        <span className="text-yellow-400 text-3xl font-black">{t('credits')}</span>
      </div>

      <p className="text-white/50 text-sm text-center mb-10 max-w-xs">{t('creditsSub')}</p>
      <p className="text-white/40 text-sm text-center mb-10">{t('description')}</p>

      <Button onClick={() => router.push('./location')}>
        {t('button')}
      </Button>
    </div>
  );
}
