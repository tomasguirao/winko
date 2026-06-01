'use client';

import { cn } from '@/lib/utils/cn';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i < current ? 'bg-yellow-400' : 'bg-white/20'
            )}
          />
        ))}
      </div>
    </div>
  );
}
