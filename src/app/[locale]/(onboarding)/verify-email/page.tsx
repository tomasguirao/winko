'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Mail, RefreshCw } from 'lucide-react';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Button } from '@/components/ui/Button';

export default function VerifyEmailPage() {
  const t = useTranslations('onboarding.verifyEmail');
  const router = useRouter();

  const email = typeof window !== 'undefined'
    ? JSON.parse(sessionStorage.getItem('register_data') || '{}').email || 'tu@email.com'
    : 'tu@email.com';

  return (
    <div className="w-full flex flex-col items-center">
      <ProgressBar current={3} total={8} />

      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6 relative">
        <Mail className="w-10 h-10 text-yellow-400" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-black text-white mb-4 text-center">{t('title')}</h1>
      <p className="text-white/50 text-sm text-center mb-4">{t('subtitle')}</p>

      <div className="bg-white/10 rounded-xl px-6 py-3 mb-4">
        <p className="text-white font-medium text-sm">{email}</p>
      </div>

      <p className="text-white/40 text-sm text-center mb-10">{t('instructions')}</p>

      <button className="flex items-center gap-2 text-white/60 text-sm mb-6 hover:text-white transition-colors">
        <RefreshCw className="w-4 h-4" />
        {t('resend')}
      </button>

      <Button onClick={() => router.push('./about-you')}>
        {t('button')}
      </Button>
    </div>
  );
}
