'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Button } from '@/components/ui/Button';

export default function AdultsOnlyPage() {
  const t = useTranslations('onboarding.adultsOnly');
  const router = useRouter();

  const [checks, setChecks] = useState({
    age: false,
    content: false,
    terms: false,
    privacy: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  const toggle = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = () => {
    if (!allChecked) return;
    sessionStorage.setItem('consent_adults_only', JSON.stringify({
      ...checks,
      timestamp: new Date().toISOString(),
      terms_version: 'v1.0',
      privacy_version: 'v1.0',
    }));
    router.push('./register');
  };

  const checkItems = [
    { key: 'age' as const, content: <span>{t('check1')}</span> },
    { key: 'content' as const, content: <span>{t('check2')}</span> },
    {
      key: 'terms' as const, content: (
        <span>
          {t('check3pre')}
          <a
            href="/es/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-yellow-400 underline underline-offset-2 hover:text-yellow-300"
          >
            {t('check3Terms')}
          </a>
        </span>
      )
    },
    {
      key: 'privacy' as const, content: (
        <span>
          {t('check4pre')}
          <a
            href="/es/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-yellow-400 underline underline-offset-2 hover:text-yellow-300"
          >
            {t('check4Privacy')}
          </a>
        </span>
      )
    },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <ProgressBar current={1} total={8} />

      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
        <Shield className="w-10 h-10 text-yellow-400" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-black text-white mb-2 text-center">{t('title')}</h1>
      <p className="text-white/50 text-sm text-center mb-8">{t('subtitle')}</p>

      {/* Checkboxes */}
      <div className="w-full flex flex-col gap-4 mb-8">
        {checkItems.map(({ key, content }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className="flex items-start gap-3 text-left"
          >
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
              checks[key]
                ? 'bg-yellow-400 border-yellow-400'
                : 'border-white/30'
            }`}>
              {checks[key] && (
                <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-white/80 text-sm leading-snug">{content}</span>
          </button>
        ))}
      </div>

      <Button onClick={handleContinue} disabled={!allChecked}
        className={!allChecked ? 'opacity-40 cursor-not-allowed' : ''}>
        {t('button')}
      </Button>
    </div>
  );
}
