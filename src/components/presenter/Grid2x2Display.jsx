import React, { useState, useEffect, useRef } from 'react';

export default function Grid2x2Display({ question, responses }) {
  const axisX = question.axisX || 'X tengely';
  const axisY = question.axisY || 'Y tengely';
  const [viewMode, setViewMode] = useState('combined'); // 'heatmap' | 'points' | 'combined'

  const canvasRef = useRef(null);

  const points = responses
    .filter(r => r.value && typeof r.value.x === 'number' && typeof r.value.y === 'number')
    .map(r => ({
      x: r.value.x,
      y: r.value.y
    }));

  // Draw Heatmap on canvas whenever points or viewMode changes
  useEffect(() => {
    if (viewMode === 'points') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (points.length === 0) return;

    // Use 'lighter' (additive blending) so overlapping points accumulate heat
    ctx.globalCompositeOperation = 'lighter';

    const padding = width * 0.06;
    const innerW = width - padding * 2;
    const innerH = height - padding * 2;
    const radius = Math.min(width, height) * 0.16; // adaptive heat radius

    points.forEach(p => {
      const px = ((p.x - 1) / 9) * innerW + padding;
      const py = ((10 - p.y) / 9) * innerH + padding;

      // 1. Wide outer ambient glow (warm purple / indigo to crimson)
      const gradOuter = ctx.createRadialGradient(px, py, 0, px, py, radius * 1.5);
      gradOuter.addColorStop(0, 'rgba(236, 72, 153, 0.28)'); // pink
      gradOuter.addColorStop(0.35, 'rgba(168, 85, 247, 0.18)'); // purple
      gradOuter.addColorStop(0.7, 'rgba(59, 130, 246, 0.08)'); // blue
      gradOuter.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradOuter;
      ctx.beginPath();
      ctx.arc(px, py, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Medium thermal core (rose to amber)
      const gradMid = ctx.createRadialGradient(px, py, 0, px, py, radius * 0.75);
      gradMid.addColorStop(0, 'rgba(244, 63, 94, 0.65)'); // bright rose
      gradMid.addColorStop(0.5, 'rgba(251, 146, 60, 0.4)'); // amber
      gradMid.addColorStop(1, 'rgba(244, 63, 94, 0)');

      ctx.fillStyle = gradMid;
      ctx.beginPath();
      ctx.arc(px, py, radius * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // 3. Hot intense center (white/gold hotspot)
      const gradCore = ctx.createRadialGradient(px, py, 0, px, py, radius * 0.28);
      gradCore.addColorStop(0, 'rgba(255, 255, 255, 0.95)'); // intense white
      gradCore.addColorStop(0.5, 'rgba(254, 240, 138, 0.65)'); // gold
      gradCore.addColorStop(1, 'rgba(251, 146, 60, 0)');

      ctx.fillStyle = gradCore;
      ctx.beginPath();
      ctx.arc(px, py, radius * 0.28, 0, Math.PI * 2);
      ctx.fill();
    });

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }, [points, viewMode]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-10 border border-neutral-800 bg-neutral-950/60 backdrop-blur-sm relative flex flex-col items-center">
      {/* Corner crosshairs */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-neutral-600 -translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-neutral-600 translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-neutral-600 -translate-x-[1px] translate-y-[1px]" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-neutral-600 translate-x-[1px] translate-y-[1px]" />

      {/* Top Controls: Mode Switcher */}
      <div className="w-full flex justify-between items-center mb-6 pb-3 border-b border-neutral-900 font-technical text-[10px]">
        <span className="text-neutral-500 uppercase tracking-widest">
          KOORDINÁTA ARCHÍVUM: {points.length} VÁLASZ
        </span>

        {/* View mode toggle */}
        <div className="flex border border-neutral-800 bg-neutral-950 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('combined')}
            className={`px-2.5 py-1 transition cursor-pointer uppercase tracking-wider ${
              viewMode === 'combined'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Hőtérkép + Pontok
          </button>
          <button
            type="button"
            onClick={() => setViewMode('heatmap')}
            className={`px-2.5 py-1 transition cursor-pointer uppercase tracking-wider ${
              viewMode === 'heatmap'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Csak Hőtérkép
          </button>
          <button
            type="button"
            onClick={() => setViewMode('points')}
            className={`px-2.5 py-1 transition cursor-pointer uppercase tracking-wider ${
              viewMode === 'points'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Csak Pontok
          </button>
        </div>
      </div>

      {/* Structured 2-Column Grid: Y Axis (Col 1), Canvas + X Axis (Col 2) */}
      <div className="inline-grid grid-cols-[auto_320px] sm:grid-cols-[auto_460px] gap-x-3 sm:gap-x-5 items-center">
        {/* Row 1, Col 1: Y Axis on the left side */}
        <div className="flex flex-col items-center justify-between h-[320px] sm:h-[460px] py-1 font-technical text-[10px] text-neutral-400 select-none">
          <span className="uppercase tracking-widest text-[9px] text-neutral-500">[ MAX ]</span>
          <div className="flex items-center gap-2 -rotate-90 origin-center whitespace-nowrap uppercase tracking-[0.2em] font-bold text-neutral-200">
            <span>↑</span>
            <span>{axisY}</span>
          </div>
          <span className="uppercase tracking-widest text-[9px] text-neutral-500">[ MIN ]</span>
        </div>

        {/* Row 1, Col 2: 2x2 Coordinate Canvas */}
        <div className="relative w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] bg-neutral-900/40 border border-neutral-700/80 overflow-hidden shadow-2xl">
          {/* Quadrant fine background labels */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none font-technical text-[9px] text-neutral-600 tracking-widest uppercase z-10">
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
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-neutral-600/70 z-10" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-neutral-600/70 z-10" />

          {/* Canvas for Heatmap rendering */}
          {(viewMode === 'heatmap' || viewMode === 'combined') && (
            <canvas
              ref={canvasRef}
              width={460}
              height={460}
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
            />
          )}

          {/* Plotted Data Nodes (in points or combined mode) */}
          {(viewMode === 'points' || viewMode === 'combined') &&
            points.map((p, i) => {
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
                  className={`absolute rounded-full border border-black shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-transform hover:scale-150 cursor-pointer z-30 ${
                    viewMode === 'combined'
                      ? 'w-2.5 h-2.5 bg-white'
                      : 'w-3.5 h-3.5 bg-white'
                  }`}
                  title={`X: ${p.x.toFixed(1)}, Y: ${p.y.toFixed(1)}`}
                />
              );
            })}

          {points.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center font-technical text-[10px] text-neutral-600 tracking-widest uppercase z-10">
              [ MÉRÉSI PONTOKRA VÁRVA ]
            </div>
          )}
        </div>

        {/* Row 2, Col 1: Empty placeholder under Y-axis */}
        <div></div>

        {/* Row 2, Col 2: X Axis directly and exactly under the Canvas */}
        <div className="mt-3 flex flex-col items-center gap-1.5 w-[320px] sm:w-[460px] font-technical">
          <div className="flex justify-between w-full text-[9px] text-neutral-500 uppercase tracking-widest">
            <span>[ MIN ]</span>
            <span>[ MAX ]</span>
          </div>
          <div className="font-bold tracking-[0.2em] uppercase text-neutral-200 text-xs flex items-center gap-2">
            <span>{axisX}</span>
            <span>→</span>
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      {(viewMode === 'heatmap' || viewMode === 'combined') && points.length > 0 && (
        <div className="mt-6 flex items-center gap-3 font-technical text-[9px] text-neutral-500 uppercase tracking-wider">
          <span>ALACSONY SŰRŰSÉG</span>
          <div className="w-24 h-2 bg-gradient-to-r from-blue-500 via-rose-500 to-white rounded-full border border-neutral-800" />
          <span>MAGAS KONCENTRÁCIÓ (HOTSPOT)</span>
        </div>
      )}
    </div>
  );
}
