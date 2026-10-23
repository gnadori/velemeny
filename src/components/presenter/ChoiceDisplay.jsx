import React, { useMemo } from 'react';

const BAR_COLORS = [
  'bg-blue-500 text-blue-500',
  'bg-indigo-500 text-indigo-500',
  'bg-purple-500 text-purple-500',
  'bg-pink-500 text-pink-500',
  'bg-amber-500 text-amber-500',
  'bg-emerald-500 text-emerald-500',
  'bg-cyan-500 text-cyan-500'
];

export default function ChoiceDisplay({ question, responses }) {
  const options = question.options || [];

  const stats = useMemo(() => {
    const counts = {};
    options.forEach(opt => { counts[opt] = 0; });

    let totalVotes = 0;
    responses.forEach(r => {
      const selected = Array.isArray(r.value) ? r.value : [r.value];
      selected.forEach(val => {
        if (counts[val] !== undefined) {
          counts[val]++;
          totalVotes++;
        }
      });
    });

    return options.map((opt, idx) => {
      const count = counts[opt] || 0;
      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      return {
        option: opt,
        count,
        percentage,
        color: BAR_COLORS[idx % BAR_COLORS.length]
      };
    });
  }, [options, responses]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 p-8 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-xl border border-slate-200/50 dark:border-slate-800">
      {stats.map(({ option, count, percentage, color }, idx) => (
        <div key={idx} className="space-y-1.5">
          <div className="flex justify-between items-baseline text-slate-800 dark:text-slate-100 font-medium">
            <span className="text-xl font-semibold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                {String.fromCharCode(65 + idx)}
              </span>
              {option}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{count} szavazat</span>
              <span className="text-sm font-semibold text-slate-400">({percentage}%)</span>
            </div>
          </div>
          <div className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${color.split(' ')[0]}`}
              style={{ width: `${Math.max(percentage, count > 0 ? 3 : 0)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
