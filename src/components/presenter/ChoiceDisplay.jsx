import React, { useMemo } from 'react';

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
        indexStr: String(idx + 1).padStart(2, '0')
      };
    });
  }, [options, responses]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 p-8 sm:p-12 border border-neutral-800 bg-neutral-950/60 backdrop-blur-sm relative">
      {/* Corner crosshairs */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-neutral-600 -translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-neutral-600 translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-neutral-600 -translate-x-[1px] translate-y-[1px]" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-neutral-600 translate-x-[1px] translate-y-[1px]" />

      <div className="space-y-6">
        {stats.map(({ option, count, percentage, indexStr }, idx) => (
          <div key={idx} className="space-y-2 group">
            <div className="flex justify-between items-baseline font-light">
              <span className="text-base sm:text-lg text-neutral-200 flex items-baseline gap-3 tracking-tight">
                <span className="font-technical text-xs text-neutral-500 font-normal">
                  [ {indexStr} ]
                </span>
                <span>{option}</span>
              </span>
              <div className="flex items-baseline gap-3 font-technical text-sm">
                <span className="text-white font-medium">{percentage}%</span>
                <span className="text-neutral-500 text-xs">({count})</span>
              </div>
            </div>

            {/* Hairline geometric progress bar */}
            <div className="w-full h-1.5 bg-neutral-900 border border-neutral-800/80 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-700 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
