'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

const FeatureIcons = [
  // Shield / Anonymous
  () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor" />
    </svg>
  ),
  // No face
  () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
      <circle cx="12" cy="12" r="9" />
      <line x1="4" y1="4" x2="20" y2="20" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
    </svg>
  ),
  // Lock / Privacy
  () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  // 18+
  () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <text x="5" y="16" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">18+</text>
    </svg>
  ),
  // Chat / Opinions
  () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h8M8 14h5" strokeLinecap="round" />
    </svg>
  ),
];

export default function SplashPage() {
  const router = useRouter();
  const t = useTranslations('splash');

  const features = [
    t('feature1'), t('feature2'), t('feature3'), t('feature4'), t('feature5'),
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-md mx-auto relative overflow-hidden">

      {/* Top content */}
      <div className="px-6 pt-12 z-10 relative">
        <Image
          src="/logo.PNG"
          alt="Winko"
          width={260}
          height={96}
          className="object-contain mb-4"
          priority
        />
        <h2 className="text-3xl font-black text-white leading-tight">
          {t('tagline1')}<br />
          {t('tagline2')}<span className="text-yellow-400">{t('tagline2bold')}</span>
        </h2>
      </div>

      {/* Silhouette image */}
      <div className="flex-1 relative min-h-64">
        <Image
          src="/silouette.png"
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Bottom section */}
      <div className="relative z-10 px-6 pb-10 bg-black">

        {/* Feature icons */}
        <div className="flex items-start justify-between mb-8">
          {features.map((label, i) => {
            const Icon = FeatureIcons[i];
            return (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
                  <Icon />
                </div>
                <p className="text-white/60 text-[10px] text-center leading-tight whitespace-pre-line">
                  {label}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA button */}
        <button
          onClick={() => router.push('./adults-only')}
          className="w-full bg-yellow-400 text-black font-black text-lg rounded-2xl py-4 flex items-center justify-center gap-3 active:scale-95 transition-transform mb-4"
        >
          {t('cta')}
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Login link */}
        <button
          onClick={() => router.push('./login')}
          className="w-full text-yellow-400 text-sm underline underline-offset-2 text-center"
        >
          {t('login')}
        </button>
      </div>
    </div>
  );
}
