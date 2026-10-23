import React, { useMemo } from 'react';

export default function RatingDisplay({ question, responses }) {
  const maxScale = question.scaleMax || 5;

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
    <div className="w-full max-w-4xl mx-auto p-8 sm:p-14 border border-neutral-800 bg-neutral-950/60 backdrop-blur-sm relative flex flex-col md:flex-row items-center gap-12">
      {/* Corner crosshairs */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-neutral-600 -translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-neutral-600 translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-neutral-600 -translate-x-[1px] translate-y-[1px]" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-neutral-600 translate-x-[1px] translate-y-[1px]" />

      {/* Left side: Editorial Average Number */}
      <div className="flex flex-col items-center justify-center p-8 border border-neutral-800/80 bg-neutral-900/40 min-w-[220px]">
        <span className="text-[10px] font-technical uppercase tracking-[0.25em] text-neutral-500 mb-2">
          ÁTLAGÉRTÉK
        </span>
        <span className="font-editorial text-7xl sm:text-8xl font-normal text-white tracking-tighter">
          {average}
        </span>
        <span className="text-xs font-technical text-neutral-500 mt-2 tracking-widest">
          / {maxScale}.00
        </span>
        <div className="w-8 h-[1px] bg-neutral-800 my-4" />
        <span className="text-[11px] font-technical text-neutral-400 tracking-wider">
          MINTASZÁM: {count}
        </span>
      </div>

      {/* Right side: Precision Breakdown */}
      <div className="flex-1 w-full space-y-3 font-technical text-xs">
        {Array.from({ length: maxScale }, (_, i) => maxScale - i).map(score => {
          const voteCount = distribution[score] || 0;
          const percentage = count > 0 ? Math.round((voteCount / count) * 100) : 0;

          return (
            <div key={score} className="space-y-1">
              <div className="flex justify-between items-center text-neutral-400 text-[11px]">
                <span className="tracking-wider">SKÁLA // {String(score).padStart(2, '0')}</span>
                <span className="text-neutral-500">{voteCount} szavazat ({percentage}%)</span>
              </div>
              <div className="w-full h-1 bg-neutral-900 border border-neutral-800/80 overflow-hidden">
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
  );
}
