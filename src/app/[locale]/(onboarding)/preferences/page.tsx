'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { MapPin, Flag, Globe } from 'lucide-react';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { Category, Distance } from '@/types';

const categories: { value: Category; emoji: string }[] = [
  { value: 'body', emoji: '🧍' },
  { value: 'chest', emoji: '👕' },
  { value: 'back', emoji: '🔙' },
  { value: 'butt', emoji: '🍑' },
  { value: 'intimate', emoji: '🔞' },
];

const distances: { value: Distance; icon: React.ElementType; label: string; sub?: string }[] = [
  { value: '20km', icon: MapPin, label: 'nearMe', sub: 'nearMeSub' },
  { value: 'country', icon: Flag, label: 'myCountry' },
  { value: 'global', icon: Globe, label: 'global' },
];

export default function PreferencesPage() {
  const t = useTranslations('onboarding.preferences');
  const router = useRouter();

  const [selectedCategories, setSelectedCategories] = useState<Category[]>(['body', 'chest', 'back', 'butt']);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 99]);
  const [distance, setDistance] = useState<Distance>('20km');

  const toggleCategory = (cat: Category) => {
    setSelectedCategories(prev =>
      prev.includes(cat)
        ? prev.length > 1 ? prev.filter(c => c !== cat) : prev
        : [...prev, cat]
    );
  };

  const handleContinue = () => {
    sessionStorage.setItem('preferences', JSON.stringify({
      categories: selectedCategories,
      age_range_min: ageRange[0],
      age_range_max: ageRange[1],
      distance,
    }));
    router.push('./welcome');
  };

  return (
    <div className="w-full flex flex-col">
      <ProgressBar current={6} total={8} />

      <h1 className="text-2xl font-black text-white mb-1 text-center">{t('title')}</h1>
      <p className="text-white/50 text-sm text-center mb-6">{t('subtitle')}</p>

      {/* Categories */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => toggleCategory(cat.value)}
            className={cn(
              'relative rounded-2xl border-2 py-4 flex flex-col items-center gap-2 transition-all',
              selectedCategories.includes(cat.value)
                ? 'border-yellow-400 bg-yellow-400/10'
                : 'border-white/10 bg-white/5'
            )}
          >
            {selectedCategories.includes(cat.value) && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <span className="text-2xl">{cat.emoji}</span>
            <span className={cn(
              'text-xs font-semibold',
              selectedCategories.includes(cat.value) ? 'text-yellow-400' : 'text-white/60'
            )}>
              {t(cat.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Age range */}
      <div className="mb-6">
        <p className="text-white/60 text-sm mb-3">{t('ageRange')}</p>
        <div className="flex items-center justify-between text-white/40 text-xs mb-2">
          <span>{ageRange[0]}</span>
          <span>{ageRange[1]}</span>
        </div>
        <input
          type="range"
          min={18}
          max={99}
          value={ageRange[1]}
          onChange={e => setAgeRange([ageRange[0], Number(e.target.value)])}
          className="w-full accent-yellow-400"
        />
      </div>

      {/* Distance */}
      <div className="mb-8">
        <p className="text-white/60 text-sm mb-3">{t('distance')}</p>
        <div className="grid grid-cols-3 gap-3">
          {distances.map(({ value, icon: Icon, label, sub }) => (
            <button
              key={value}
              onClick={() => setDistance(value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-2xl border-2 py-4 px-2 transition-all',
                distance === value
                  ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                  : 'border-white/10 bg-white/5 text-white/60'
              )}
            >
              <Icon className="w-5 h-5" />
              <div className="text-center">
                <p className="text-xs font-semibold">{t(label)}</p>
                {sub && <p className="text-xs opacity-60">{t(sub)}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleContinue}>
        {t('button')}
      </Button>
    </div>
  );
}
