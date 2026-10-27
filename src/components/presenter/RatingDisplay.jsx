import React, { useMemo } from 'react';
import { Star, Heart } from 'lucide-react';

export default function RatingDisplay({ question, responses, t }) {
  const maxScale = Math.min(10, Math.max(2, Number(question.scaleMax) || 5));
  const iconType = question.ratingIcon || 'stars'; // 'stars' | 'hearts' | 'numbers'

  const { average, count, distribution } = useMemo(() => {
    const dist = {};
    for (let i = 1; i <= maxScale; i++) dist[i] = 0;

    let sum = 0;
    let validCount = 0;

    responses.forEach(r => {
      const val = Number(r.value);
      if (!isNaN(val) && val >= 1 && val <= maxScale) {
        dist[val] = (dist[val] || 0) + 1;
        sum += val;
        validCount++;
      }
    });

    const avg = validCount > 0 ? (sum / validCount).toFixed(2) : '0.00';
    return { average: avg, count: validCount, distribution: dist };
  }, [responses, maxScale]);

  return (
    <div className="w-full max-w-4xl mx-auto p-8 sm:p-12 border border-neutral-800 bg-neutral-950/60 backdrop-blur-sm relative flex flex-col md:flex-row items-center gap-10">
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-neutral-600 -translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-neutral-600 translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-neutral-600 -translate-x-[1px] translate-y-[1px]" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-neutral-600 translate-x-[1px] translate-y-[1px]" />

      {/* Left side: Clean Big Average Number */}
      <div className="flex flex-col items-center justify-center p-8 border border-neutral-800/80 bg-neutral-900/40 min-w-[220px]">
        <span className="text-[10px] font-technical uppercase tracking-[0.25em] text-neutral-500 mb-2">
          {t?.average_score || 'ÁTLAGÉRTÉK'}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-6xl sm:text-7xl font-extrabold text-white tracking-tight">
            {average}
          </span>
          {iconType === 'stars' && (
            <Star className="w-9 h-9 fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
          )}
          {iconType === 'hearts' && (
            <Heart className="w-9 h-9 fill-rose-500 text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]" />
          )}
        </div>
        <span className="text-xs font-technical text-neutral-500 mt-2 tracking-widest">
          / {maxScale}.00
        </span>
        <div className="w-8 h-[1px] bg-neutral-800 my-4" />
        <span className="text-[11px] font-technical text-neutral-400 tracking-wider">
          {t?.sample_size || 'MINTASZÁM'}: {count}
        </span>
      </div>

      {/* Right side: Precision Breakdown */}
      <div className="flex-1 w-full space-y-2.5 font-technical text-xs max-h-[360px] overflow-y-auto pr-1">
        {Array.from({ length: maxScale }, (_, i) => maxScale - i).map(score => {
          const voteCount = distribution[score] || 0;
          const percentage = count > 0 ? Math.round((voteCount / count) * 100) : 0;

          return (
            <div key={score} className="space-y-1">
              <div className="flex justify-between items-center text-neutral-400 text-[11px]">
                <span className="tracking-wider flex items-center gap-1.5">
                  <span className="text-neutral-200 font-bold">{String(score).padStart(2, '0')}</span>
                  {iconType === 'stars' && (
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  )}
                  {iconType === 'hearts' && (
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  )}
                  {iconType === 'numbers' && (
                    <span className="text-neutral-500">[{t?.scale_label || 'SKÁLA'}]</span>
                  )}
                </span>
                <span className="text-neutral-500">{voteCount} ({percentage}%)</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-900 border border-neutral-800/80 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    iconType === 'hearts'
                      ? 'bg-rose-500'
                      : iconType === 'stars'
                      ? 'bg-amber-400'
                      : 'bg-white'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
