import React, { useState } from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

export default function Points100Input({ question, onSubmit, submitting }) {
  const options = question.options || [];
  const [points, setPoints] = useState(() => {
    const initial = {};
    options.forEach(opt => { initial[opt] = 0; });
    return initial;
  });

  const totalAssigned = Object.values(points).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const remaining = 100 - totalAssigned;

  const handleSliderChange = (opt, val) => {
    const num = Math.max(0, Math.min(100, Number(val) || 0));
    setPoints(prev => ({ ...prev, [opt]: num }));
  };

  const handleStep = (opt, delta) => {
    const current = points[opt] || 0;
    const nextVal = Math.max(0, Math.min(100, current + delta));
    setPoints(prev => ({ ...prev, [opt]: nextVal }));
  };

  const handleDistributeEvenly = () => {
    if (options.length === 0) return;
    const base = Math.floor(100 / options.length);
    let remainder = 100 % options.length;

    const updated = {};
    options.forEach((opt) => {
      updated[opt] = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
    });
    setPoints(updated);
  };

  const handleReset = () => {
    const updated = {};
    options.forEach(opt => { updated[opt] = 0; });
    setPoints(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (totalAssigned !== 100) return;
    onSubmit(points);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-lg mx-auto">
      {/* Remaining Points Meter */}
      <div className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-colors ${
        remaining === 0
          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
          : remaining < 0
          ? 'bg-rose-50 border-rose-500 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
          : 'bg-amber-50 border-amber-400 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
      }`}>
        <div>
          <div className="text-xs uppercase font-bold tracking-wider opacity-80">
            {remaining === 0 ? 'Pontosan 100 pont kiosztva!' : remaining < 0 ? 'Túl sok pontot osztottál ki!' : 'Még kiosztható pontok:'}
          </div>
          <div className="text-2xl font-black">
            {remaining === 0 ? 'Kész a beküldésre' : `${remaining} pont maradt`}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDistributeEvenly}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Egyenletes
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-500 cursor-pointer"
            title="Törlés"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sliders list */}
      <div className="space-y-4">
        {options.map((opt, idx) => {
          const val = points[opt] || 0;

          return (
            <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800 dark:text-slate-100">{opt}</span>
                <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{val} p</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStep(opt, -5)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={val}
                  onChange={(e) => handleSliderChange(opt, e.target.value)}
                  className="flex-1 accent-indigo-600 cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => handleStep(opt, 5)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={totalAssigned !== 100 || submitting}
        className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-lg shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer"
      >
        {submitting ? 'Beküldés...' : totalAssigned === 100 ? 'Elosztás beküldése' : 'Állítsd be pontosan 100 pontra'}
      </button>
    </form>
  );
}
