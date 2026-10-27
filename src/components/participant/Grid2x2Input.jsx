import React, { useState, useRef } from 'react';

export default function Grid2x2Input({ question, onSubmit, submitting, t }) {
  const axisX = question.axisX || 'X tengely';
  const axisY = question.axisY || 'Y tengely';

  const [coords, setCoords] = useState(null);
  const gridRef = useRef(null);

  const handleGridClick = (e) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const rawX = (clickX / rect.width) * 9 + 1;
    const rawY = ((rect.height - clickY) / rect.height) * 9 + 1;

    setCoords({
      x: Math.max(1, Math.min(10, Math.round(rawX * 10) / 10)),
      y: Math.max(1, Math.min(10, Math.round(rawY * 10) / 10))
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!coords) return;
    onSubmit(coords);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md mx-auto">
      {/* 2D Grid with Y-axis on the left */}
      <div className="flex items-center gap-2.5 sm:gap-3 justify-center w-full">
        {/* Left (Y) Axis */}
        <div className="flex flex-col items-center justify-between h-[280px] sm:h-[320px] py-1 font-technical text-[9px] text-neutral-400 select-none">
          <span className="uppercase tracking-widest text-[8px] text-neutral-500">[ MAX ]</span>
          <div className="flex items-center gap-1.5 -rotate-90 origin-center whitespace-nowrap uppercase tracking-widest font-bold text-neutral-300">
            <span>↑</span>
            <span>{axisY}</span>
          </div>
          <span className="uppercase tracking-widest text-[8px] text-neutral-500">[ MIN ]</span>
        </div>

        {/* The Grid Canvas */}
        <div
          ref={gridRef}
          onClick={handleGridClick}
          className="relative w-full aspect-square max-w-[280px] sm:max-w-[320px] bg-neutral-900 border border-neutral-700 overflow-hidden cursor-crosshair touch-none select-none shadow-xl"
        >
          {/* Subtle Quadrant borders */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
            <div className="border-r border-b border-neutral-800/80" />
            <div className="border-b border-neutral-800/80" />
            <div className="border-r border-neutral-800/80" />
            <div />
          </div>

          {/* Center axes */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-neutral-600" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-neutral-600" />

          {/* Target Marker */}
          {coords ? (
            <div
              style={{
                left: `${((coords.x - 1) / 9) * 88 + 6}%`,
                bottom: `${((coords.y - 1) / 9) * 88 + 6}%`,
                transform: 'translate(-50%, 50%)'
              }}
              className="absolute w-4 h-4 rounded-full bg-white border border-black shadow-[0_0_10px_white] pointer-events-none"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center font-technical text-[10px] text-neutral-500 uppercase tracking-widest pointer-events-none text-center px-4">
              [ {t?.grid_touch_hint || 'ÉRINTSD MEG A POZÍCIÓT'} ]
            </div>
          )}
        </div>
      </div>

      {/* Bottom (X) Axis */}
      <div className="flex flex-col items-center gap-1 w-full max-w-[280px] sm:max-w-[320px] mx-auto ml-6 sm:ml-7 font-technical">
        <div className="flex justify-between w-full text-[8px] text-neutral-500 uppercase tracking-widest">
          <span>[ MIN ]</span>
          <span>[ MAX ]</span>
        </div>
        <div className="font-bold tracking-widest uppercase text-neutral-200 text-xs flex items-center gap-1.5">
          <span>{axisX}</span>
          <span>→</span>
        </div>
      </div>

      {coords && (
        <div className="text-center font-technical text-[11px] text-neutral-300 tracking-wider">
          {t?.grid_coords || 'KOORDINÁTÁK'}: X={coords.x} // Y={coords.y}
        </div>
      )}

      <button
        type="submit"
        disabled={!coords || submitting}
        className="w-full py-4 px-6 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 text-black disabled:text-neutral-500 font-technical text-xs uppercase tracking-[0.2em] font-bold transition cursor-pointer disabled:cursor-not-allowed"
      >
        {submitting ? `[ ${t?.submitting || 'RÖGZÍTÉS FOLYAMATBAN...'} ]` : `[ ${t?.submit_grid || 'POZÍCIÓ BEKÜLDÉSE'} ]`}
      </button>
    </form>
  );
}
