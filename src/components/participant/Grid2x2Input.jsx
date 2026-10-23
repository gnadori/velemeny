import React, { useState, useRef } from 'react';

export default function Grid2x2Input({ question, onSubmit, submitting }) {
  const axisX = question.axisX || 'X tengely';
  const axisY = question.axisY || 'Y tengely';

  const [coords, setCoords] = useState(null); // { x: 5, y: 5 }
  const gridRef = useRef(null);

  const handleGridClick = (e) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Normalizing between 1 and 10
    const rawX = (clickX / rect.width) * 9 + 1;
    // Y is inverted (top is high, bottom is low)
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
      <p className="text-sm text-center text-slate-500">
        Kattints vagy érintsd meg a rácsot az elhelyezéshez!
      </p>

      {/* Top Label */}
      <div className="text-xs font-bold text-center text-slate-500 uppercase tracking-wider">
        ↑ {axisY} (Magas)
      </div>

      {/* Interactive 2x2 Tap Area */}
      <div
        ref={gridRef}
        onClick={handleGridClick}
        className="relative w-full aspect-square max-w-[340px] mx-auto bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-indigo-200 dark:border-slate-700 overflow-hidden shadow-inner cursor-crosshair touch-none select-none"
      >
        {/* Quadrant Guidelines */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-30 pointer-events-none">
          <div className="border-r border-b border-dashed border-slate-400" />
          <div className="border-b border-dashed border-slate-400" />
          <div className="border-r border-dashed border-slate-400" />
          <div />
        </div>

        {/* Center axes */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-indigo-500/40" />
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-indigo-500/40" />

        {/* Selected Point Marker */}
        {coords ? (
          <div
            style={{
              left: `${((coords.x - 1) / 9) * 90 + 5}%`,
              bottom: `${((coords.y - 1) / 9) * 90 + 5}%`,
              transform: 'translate(-50%, 50%)'
            }}
            className="absolute w-7 h-7 rounded-full bg-indigo-600 border-2 border-white shadow-xl shadow-indigo-600/50 flex items-center justify-center animate-bounce-short pointer-events-none"
          >
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-semibold pointer-events-none">
            Érintsd meg a pozíciót
          </div>
        )}
      </div>

      {/* Bottom Label */}
      <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
        <span>← Alacsony {axisX}</span>
        <span>Magas →</span>
      </div>

      {/* Coords badge */}
      {coords && (
        <div className="text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          Kiválasztva: {axisX} = {coords.x}, {axisY} = {coords.y}
        </div>
      )}

      <button
        type="submit"
        disabled={!coords || submitting}
        className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-lg shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer"
      >
        {submitting ? 'Beküldés...' : 'Pozíció beküldése'}
      </button>
    </form>
  );
}
