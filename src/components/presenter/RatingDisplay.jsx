import React, { useMemo } from 'react';
import { Star } from 'lucide-react';

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

    const avg = validCount > 0 ? (sum / validCount).toFixed(1) : 0;
    return { average: avg, count: validCount, distribution: dist };
  }, [responses, maxScale]);

  return (
    <div className="w-full max-w-3xl mx-auto p-8 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-xl border border-slate-200/50 dark:border-slate-800 flex flex-col md:flex-row items-center gap-10">
      {/* Left side: Big Average */}
      <div className="flex flex-col items-center justify-center p-6 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl border border-amber-500/20 min-w-[200px]">
        <span className="text-6xl font-black text-amber-500 tracking-tight">{average}</span>
        <div className="flex items-center gap-1 text-amber-400 my-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-6 h-6 ${
                i < Math.round((average / maxScale) * 5)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 dark:text-slate-700'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {count} értékelés alapján
        </span>
      </div>

      {/* Right side: Breakdown */}
      <div className="flex-1 w-full space-y-2">
        {Array.from({ length: maxScale }, (_, i) => maxScale - i).map(score => {
          const voteCount = distribution[score] || 0;
          const percentage = count > 0 ? Math.round((voteCount / count) * 100) : 0;

          return (
            <div key={score} className="flex items-center gap-3 text-sm">
              <span className="w-6 font-bold text-slate-600 dark:text-slate-300 flex items-center justify-end gap-1">
                {score} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </span>
              <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-14 text-right font-medium text-slate-500 dark:text-slate-400">
                {voteCount} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
