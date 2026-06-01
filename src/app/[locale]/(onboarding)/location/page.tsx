'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { MapPin, Lock, Shield } from 'lucide-react';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Button } from '@/components/ui/Button';

export default function LocationPage() {
  const t = useTranslations('onboarding.location');
  const router = useRouter();

  const handleAllow = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sessionStorage.setItem('location', JSON.stringify({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            permission: true,
          }));
          router.push('../../feed');
        },
        () => {
          sessionStorage.setItem('location', JSON.stringify({ permission: false }));
          router.push('../../feed');
        }
      );
    }
  };

  const handleSkip = () => {
    sessionStorage.setItem('location', JSON.stringify({ permission: false }));
    router.push('../../feed');
  };

  return (
    <div className="w-full flex flex-col items-center">
      <ProgressBar current={8} total={8} />

      {/* Location pin with glow */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl scale-150" />
        <div className="relative w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
          <MapPin className="w-12 h-12 text-yellow-400" />
        </div>
      </div>

      <h1 className="text-2xl font-black text-white mb-3 text-center">{t('title')}</h1>
      <p className="text-white/50 text-sm text-center mb-8 max-w-xs">{t('subtitle')}</p>

      {/* Privacy notes */}
      <div className="w-full flex flex-col gap-3 mb-10">
        {[
          { icon: Lock, text: t('privacy1') },
          { icon: Shield, text: t('privacy2') },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <Icon className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <p className="text-white/60 text-sm">{text}</p>
          </div>
        ))}
      </div>

      <div className="w-full flex flex-col gap-3">
        <Button onClick={handleAllow}>
          <span className="flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            {t('allow')}
          </span>
        </Button>
        <Button variant="secondary" onClick={handleSkip}>
          {t('skip')}
        </Button>
      </div>
    </div>
  );
}
