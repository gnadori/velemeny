import React from 'react';

export default function Grid2x2Display({ question, responses }) {
  const axisX = question.axisX || 'X tengely';
  const axisY = question.axisY || 'Y tengely';

  const points = responses
    .filter(r => r.value && typeof r.value.x === 'number' && typeof r.value.y === 'number')
    .map(r => ({
      x: r.value.x,
      y: r.value.y
    }));

  return (
    <div className="w-full max-w-3xl mx-auto p-8 sm:p-12 border border-neutral-800 bg-neutral-950/60 backdrop-blur-sm relative flex flex-col items-center">
      {/* Corner crosshairs */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-neutral-600 -translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-neutral-600 translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-neutral-600 -translate-x-[1px] translate-y-[1px]" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-neutral-600 translate-x-[1px] translate-y-[1px]" />

      {/* Top Label */}
      <div className="font-technical text-[10px] text-neutral-400 uppercase tracking-[0.25em] mb-4">
        ↑ {axisY} [ MAX ]
      </div>

      {/* 2x2 Coordinate Canvas */}
      <div className="relative w-full aspect-square max-w-[480px] mx-auto bg-neutral-900/40 border border-neutral-700/80 overflow-hidden">
        {/* Quadrant fine background labels */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none font-technical text-[9px] text-neutral-600 tracking-widest uppercase">
          <div className="border-r border-b border-neutral-800/80 p-3">
            II. MAGAS Y / ALACSONY X
          </div>
          <div className="border-b border-neutral-800/80 p-3 text-right">
            I. MAGAS Y / MAGAS X
          </div>
          <div className="border-r border-neutral-800/80 p-3 flex items-end">
            III. ALACSONY Y / ALACSONY X
          </div>
          <div className="p-3 flex items-end justify-end">
            IV. ALACSONY Y / MAGAS X
          </div>
        </div>

        {/* Center Hairline Crosshairs */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-neutral-600/70" />
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-neutral-600/70" />

        {/* Plotted Data Nodes */}
        {points.map((p, i) => {
          const leftPct = ((p.x - 1) / 9) * 88 + 6;
          const bottomPct = ((p.y - 1) / 9) * 88 + 6;

          return (
            <div
              key={i}
              style={{
                left: `${leftPct}%`,
                bottom: `${bottomPct}%`,
                transform: 'translate(-50%, 50%)'
              }}
              className="absolute w-3.5 h-3.5 rounded-full bg-white border border-black shadow-[0_0_12px_rgba(255,255,255,0.8)] transition-transform hover:scale-150 cursor-pointer"
              title={`X: ${p.x.toFixed(1)}, Y: ${p.y.toFixed(1)}`}
            />
          );
        })}

        {points.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center font-technical text-[10px] text-neutral-600 tracking-widest uppercase">
            [ MÉRÉSI PONTOKRA VÁRVA ]
          </div>
        )}
      </div>

      {/* Bottom Axis Label */}
      <div className="mt-4 flex justify-between w-full max-w-[480px] font-technical text-[10px] text-neutral-400 uppercase tracking-[0.2em]">
        <span>← [ MIN ]</span>
        <span>{axisX}</span>
        <span>[ MAX ] →</span>
      </div>

      <div className="mt-4 font-technical text-[10px] text-neutral-500 tracking-widest uppercase">
        KOORDINÁTA ARCHÍVUM: {points.length} PONT RÖGZÍTVE
      </div>
    </div>
  );
}
