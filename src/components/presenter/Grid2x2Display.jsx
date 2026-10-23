import React from 'react';

export default function Grid2x2Display({ question, responses }) {
  const axisX = question.axisX || 'X tengely';
  const axisY = question.axisY || 'Y tengely';

  const points = responses
    .filter(r => r.value && typeof r.value.x === 'number' && typeof r.value.y === 'number')
    .map(r => ({
      x: r.value.x, // 1 - 10
      y: r.value.y  // 1 - 10
    }));

  return (
    <div className="w-full max-w-3xl mx-auto p-6 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-xl border border-slate-200/50 dark:border-slate-800 flex flex-col items-center">
      
      {/* Top label: Y max */}
      <div className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">
        ↑ {axisY} (Magas)
      </div>

      <div className="flex items-center w-full">
        {/* Left label: rotated Y */}
        <div className="text-xs font-bold text-slate-400 -rotate-90 origin-center -ml-8 mr-2 uppercase tracking-widest whitespace-nowrap hidden sm:block">
          {axisY}
        </div>

        {/* The 2x2 Grid Canvas */}
        <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-slate-700 overflow-hidden shadow-inner">
          {/* Quadrant backgrounds */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-30 pointer-events-none">
            <div className="border-r border-b border-dashed border-slate-400 flex items-start justify-start p-3 text-xs font-semibold text-slate-500">
              II. Magas Y / Alacsony X
            </div>
            <div className="border-b border-dashed border-slate-400 flex items-start justify-end p-3 text-xs font-semibold text-slate-500">
              I. Magas Y / Magas X
            </div>
            <div className="border-r border-dashed border-slate-400 flex items-end justify-start p-3 text-xs font-semibold text-slate-500">
              III. Alacsony Y / Alacsony X
            </div>
            <div className="flex items-end justify-end p-3 text-xs font-semibold text-slate-500">
              IV. Alacsony Y / Magas X
            </div>
          </div>

          {/* Center Crosshairs */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-indigo-500/40" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-indigo-500/40" />

          {/* Plotted Points */}
          {points.map((p, i) => {
            // Convert scale 1-10 to percentage 5% to 95%
            const leftPct = ((p.x - 1) / 9) * 90 + 5;
            const bottomPct = ((p.y - 1) / 9) * 90 + 5;

            return (
              <div
                key={i}
                style={{
                  left: `${leftPct}%`,
                  bottom: `${bottomPct}%`,
                  transform: 'translate(-50%, 50%)'
                }}
                className="absolute w-5 h-5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 shadow-lg shadow-indigo-500/50 flex items-center justify-center animate-bounce-short hover:scale-150 transition-transform cursor-pointer"
                title={`X: ${p.x.toFixed(1)}, Y: ${p.y.toFixed(1)}`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            );
          })}

          {points.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium">
              Kattintásra vagy beküldésre vár...
            </div>
          )}
        </div>
      </div>

      {/* Bottom label: X axis */}
      <div className="mt-3 flex justify-between w-full max-w-[500px] text-xs font-bold text-slate-500 uppercase tracking-wider">
        <span>← Alacsony</span>
        <span>{axisX}</span>
        <span>Magas →</span>
      </div>

      <div className="mt-2 text-xs text-slate-400 font-medium">
        Összesen {points.length} pont elhelyezve a rácson
      </div>
    </div>
  );
}
