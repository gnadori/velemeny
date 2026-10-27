import React, { useMemo } from 'react';
import { Star, Heart } from 'lucide-react';

export default function RatingDisplay({ question, responses, t }) {
  const maxScale = Math.max(2, Number(question.scaleMax) || 5);
  const isSlider = maxScale > 10;
  const iconType = isSlider ? 'numbers' : (question.ratingIcon || 'stars'); // 'stars' | 'hearts' | 'numbers'

  const { average, count, distribution, buckets, minVal, maxVal } = useMemo(() => {
    let sum = 0;
    let validCount = 0;
    let min = Infinity;
    let max = -Infinity;

    const values = [];

    responses.forEach(r => {
      const val = Number(r.value);
      if (!isNaN(val) && val >= 0 && val <= maxScale) {
        sum += val;
        validCount++;
        values.push(val);
        if (val < min) min = val;
        if (val > max) max = val;
      }
    });

    const avg = validCount > 0 ? (sum / validCount).toFixed(1) : '0.0';

    if (isSlider) {
      // 5 distribution ranges for scale > 10
      const bucketCount = 5;
      const step = maxScale / bucketCount;
      const bucketList = Array.from({ length: bucketCount }, (_, i) => {
        const from = Math.round(i * step);
        const to = Math.round((i + 1) * step);
        return {
          from,
          to,
          label: `${from} – ${to}${maxScale === 100 ? '%' : ''}`,
          count: 0
        };
      });

      values.forEach(v => {
        const idx = Math.min(bucketCount - 1, Math.floor(v / step));
        bucketList[idx].count++;
      });

      return {
        average: avg,
        count: validCount,
        distribution: {},
        buckets: bucketList,
        minVal: validCount > 0 ? min : 0,
        maxVal: validCount > 0 ? max : 0
      };
    } else {
      // 1..maxScale individual distribution
      const dist = {};
      for (let i = 1; i <= maxScale; i++) dist[i] = 0;

      values.forEach(val => {
        if (dist[val] !== undefined) {
          dist[val]++;
        }
      });

      return {
        average: avg,
        count: validCount,
        distribution: dist,
        buckets: [],
        minVal: 0,
        maxVal: 0
      };
    }
  }, [responses, maxScale, isSlider]);

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
          {maxScale === 100 && (
            <span className="text-2xl font-technical text-neutral-400 font-bold">%</span>
          )}
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

      {/* Right side: Distribution */}
      {isSlider ? (
        /* Histogram / Range distribution for scale > 10 */
        <div className="flex-1 w-full space-y-4 font-technical text-xs">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-neutral-500 pb-1 border-b border-neutral-900">
            <span>TARTOMÁNY</span>
            <span>MIN: {minVal} // MAX: {maxVal}</span>
          </div>

          <div className="space-y-3">
            {buckets.map((b, idx) => {
              const percentage = count > 0 ? Math.round((b.count / count) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-neutral-400 text-[11px]">
                    <span className="tracking-wider text-neutral-200">{b.label}</span>
                    <span className="text-neutral-500">{b.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 border border-neutral-800/80 overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Standard 1..scaleMax breakdown for scale <= 10 */
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
      )}
    </div>
  );
}
