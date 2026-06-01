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
    // Store consents with timestamp
    sessionStorage.setItem('consent_adults_only', JSON.stringify({
      ...checks,
      timestamp: new Date().toISOString(),
      terms_version: 'v1.0',
      privacy_version: 'v1.0',
    }));
    router.push('./register');
  };

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
        {[
          { key: 'age', label: t('check1') },
          { key: 'content', label: t('check2') },
          { key: 'terms', label: null, custom: true, type: 'terms' },
          { key: 'privacy', label: null, custom: true, type: 'privacy' },
        ].map(({ key, label, custom, type }) => (
          <button
            key={key}
            onClick={() => toggle(key as keyof typeof checks)}
            className="flex items-start gap-3 text-left"
          >
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
              checks[key as keyof typeof checks]
                ? 'bg-yellow-400 border-yellow-400'
                : 'border-white/30'
            }`}>
              {checks[key as keyof typeof checks] && (
                <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-white/80 text-sm leading-snug">
              {custom && type === 'terms' ? (
                <>
                  {t('check3').replace('{terms}', '')}
                  <span className="text-yellow-400 underline">{t('check3Terms')}</span>
                </>
              ) : custom && type === 'privacy' ? (
                <>
                  {t('check4').replace('{privacy}', '')}
                  <span className="text-yellow-400 underline">{t('check4Privacy')}</span>
                </>
              ) : label}
            </span>
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
