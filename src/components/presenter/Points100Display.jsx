import React, { useMemo } from 'react';

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
      const avg = validCount > 0 ? (sums[opt] / validCount).toFixed(1) : '0.0';
      return {
        option: opt,
        avg: Number(avg),
        origIndex: String(idx + 1).padStart(2, '0')
      };
    }).sort((a, b) => b.avg - a.avg);
  }, [options, responses]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-8 sm:p-12 border border-neutral-800 bg-neutral-950/60 backdrop-blur-sm relative">
      {/* Corner crosshairs */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-neutral-600 -translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-neutral-600 translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-neutral-600 -translate-x-[1px] translate-y-[1px]" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-neutral-600 translate-x-[1px] translate-y-[1px]" />

      <div className="flex justify-between items-center text-[10px] font-technical uppercase tracking-[0.25em] text-neutral-500 pb-3 border-b border-neutral-900">
        <span>TÉTEL // ELOSZLÁS</span>
        <span>ÁTLAGOS ALLOKÁCIÓ [ 100 PONTBÓL ]</span>
      </div>

      <div className="space-y-6">
        {results.map(({ option, avg, origIndex }, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex justify-between items-baseline font-light">
              <span className="text-base sm:text-lg text-neutral-200 flex items-baseline gap-3 tracking-tight">
                <span className="font-technical text-xs text-neutral-500">
                  [ {String(idx + 1).padStart(2, '0')} ]
                </span>
                <span>{option}</span>
              </span>
              <span className="font-technical text-lg text-white">
                {avg} <span className="text-xs text-neutral-500 font-normal">PONT</span>
              </span>
            </div>

            <div className="w-full h-1.5 bg-neutral-900 border border-neutral-800/80 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-700 ease-out"
                style={{ width: `${avg}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
