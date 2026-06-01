'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { Gender, Orientation } from '@/types';

const GenderIcon = ({ gender }: { gender: Gender }) => {
  if (gender === 'male') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
      <circle cx="10" cy="14" r="5" /><line x1="14.5" y1="9.5" x2="21" y2="3" /><polyline points="16 3 21 3 21 8" />
    </svg>
  );
  if (gender === 'female') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
      <circle cx="12" cy="8" r="5" /><line x1="12" y1="13" x2="12" y2="21" /><line x1="9" y1="18" x2="15" y2="18" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="2" x2="12" y2="7" /><line x1="12" y1="17" x2="12" y2="22" />
      <line x1="2" y1="12" x2="7" y2="12" /><line x1="17" y1="12" x2="22" y2="12" />
    </svg>
  );
};

export default function AboutYouPage() {
  const t = useTranslations('onboarding.aboutYou');
  const router = useRouter();

  const [gender, setGender] = useState<Gender | null>(null);
  const [orientation, setOrientation] = useState<Orientation | null>(null);

  const canContinue = gender !== null && orientation !== null;

  const handleContinue = () => {
    sessionStorage.setItem('about_you', JSON.stringify({ gender, orientation }));
    router.push('./your-identity');
  };

  const genderOptions: { value: Gender; label: string }[] = [
    { value: 'male', label: t('man') },
    { value: 'female', label: t('woman') },
    { value: 'other', label: t('other') },
  ];

  const orientationOptions: { value: Orientation; label: string }[] = [
    { value: 'men', label: t('men') },
    { value: 'women', label: t('women') },
    { value: 'everyone', label: t('everyone') },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <ProgressBar current={4} total={8} />

      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
        <svg viewBox="0 0 24 24" fill="none" stroke="#F5C000" strokeWidth={1.5} className="w-10 h-10">
          <circle cx="9" cy="10" r="3" /><circle cx="15" cy="10" r="3" />
          <path d="M6 20c0-3 1.5-5 3-5" /><path d="M18 20c0-3-1.5-5-3-5" />
          <path d="M9 15c1 1 5 1 6 0" />
        </svg>
      </div>

      <h1 className="text-2xl font-black text-white mb-8 text-center">{t('title')}</h1>

      {/* Gender */}
      <div className="w-full mb-8">
        <p className="text-white/60 text-sm mb-3">{t('genderQuestion')}</p>
        <div className="grid grid-cols-3 gap-3">
          {genderOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setGender(opt.value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-2xl border-2 py-4 px-2 transition-all',
                gender === opt.value
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
              )}
            >
              <GenderIcon gender={opt.value} />
              <span className="text-sm font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orientation */}
      <div className="w-full mb-10">
        <p className="text-white/60 text-sm mb-3">{t('orientationQuestion')}</p>
        <div className="grid grid-cols-3 gap-3">
          {orientationOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setOrientation(opt.value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-2xl border-2 py-4 px-2 transition-all',
                orientation === opt.value
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
              )}
            >
              <GenderIcon gender={opt.value === 'men' ? 'male' : opt.value === 'women' ? 'female' : 'other'} />
              <span className="text-sm font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleContinue} disabled={!canContinue}
        className={!canContinue ? 'opacity-40 cursor-not-allowed' : ''}>
        {t('button')}
      </Button>
    </div>
  );
}
