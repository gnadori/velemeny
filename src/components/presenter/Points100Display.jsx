import React, { useMemo } from 'react';

const COLORS = [
  'bg-emerald-500',
  'bg-sky-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-amber-500'
];

export default function Points100Display({ question, responses }) {
  const options = question.options || [];

  const results = useMemo(() => {
    const sums = {};
    options.forEach(opt => { sums[opt] = 0; });

    let validCount = 0;
    responses.forEach(r => {
      if (r.value && typeof r.value === 'object') {
        let hasData = false;
        options.forEach(opt => {
          const val = Number(r.value[opt]) || 0;
          sums[opt] += val;
          hasData = true;
        });
        if (hasData) validCount++;
      }
    });

    return options.map((opt, idx) => {
      const avg = validCount > 0 ? (sums[opt] / validCount).toFixed(1) : 0;
      return {
        option: opt,
        avg: Number(avg),
        color: COLORS[idx % COLORS.length]
      };
    }).sort((a, b) => b.avg - a.avg);
  }, [options, responses]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 p-8 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-xl border border-slate-200/50 dark:border-slate-800">
      <div className="flex justify-between items-center text-sm font-semibold text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
        <span>Opció / Prioritás</span>
        <span>Átlagos kapott pont (100-ból)</span>
      </div>

      {results.map(({ option, avg, color }, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex justify-between items-center font-medium">
            <span className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center justify-center">
                #{idx + 1}
              </span>
              {option}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {avg} <span className="text-sm font-medium text-slate-400">pont</span>
            </span>
          </div>

          <div className="w-full h-7 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
              style={{ width: `${Math.max(avg, avg > 0 ? 3 : 0)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
