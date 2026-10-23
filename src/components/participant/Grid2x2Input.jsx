import React, { useState, useRef } from 'react';

export default function Grid2x2Input({ question, onSubmit, submitting }) {
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
      <div className="font-technical text-[10px] text-center text-neutral-400 uppercase tracking-[0.25em]">
        ↑ {axisY} [ MAX ]
      </div>

      <div
        ref={gridRef}
        onClick={handleGridClick}
        className="relative w-full aspect-square max-w-[320px] mx-auto bg-neutral-900 border border-neutral-700 overflow-hidden cursor-crosshair touch-none select-none"
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
          <div className="absolute inset-0 flex items-center justify-center font-technical text-[10px] text-neutral-500 uppercase tracking-widest pointer-events-none">
            [ ÉRINTSD MEG A POZÍCIÓT ]
          </div>
        )}
      </div>

      <div className="flex justify-between font-technical text-[10px] text-neutral-400 uppercase tracking-[0.2em]">
        <span>← [ MIN ]</span>
        <span>{axisX}</span>
        <span>[ MAX ] →</span>
      </div>

      {coords && (
        <div className="text-center font-technical text-[11px] text-neutral-300 tracking-wider">
          KOORDINÁTÁK: X={coords.x} // Y={coords.y}
        </div>
      )}

      <button
        type="submit"
        disabled={!coords || submitting}
        className="w-full py-4 px-6 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 text-black disabled:text-neutral-500 font-technical text-xs uppercase tracking-[0.2em] font-bold transition cursor-pointer disabled:cursor-not-allowed"
      >
        {submitting ? '[ RÖGZÍTÉS FOLYAMATBAN... ]' : '[ POZÍCIÓ BEKÜLDÉSE ]'}
      </button>
    </form>
  );
}
