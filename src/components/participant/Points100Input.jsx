import React, { useState } from 'react';

export default function Points100Input({ question, onSubmit, submitting, t }) {
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
      {/* Allocation Status Box */}
      <div className={`p-4 border font-technical flex items-center justify-between transition-colors ${
        remaining === 0
          ? 'bg-neutral-900 border-white text-white'
          : remaining < 0
          ? 'bg-neutral-900 border-red-500/80 text-red-400'
          : 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
      }`}>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">
            {remaining === 0
              ? (t?.points_status_ready || 'STATUS // READY')
              : remaining < 0
              ? (t?.points_status_over || 'ERROR // EXCEEDED')
              : 'BALANCE:'}
          </div>
          <div className="text-xl font-bold tracking-tight mt-0.5">
            {remaining === 0
              ? (t?.points_status_exact || 'EXACTLY 100 POINTS')
              : `${remaining} ${t?.points_remaining || 'POINTS REMAINING'}`}
          </div>
        </div>

        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={handleDistributeEvenly}
            className="px-2.5 py-1.5 border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer uppercase text-[10px]"
          >
            {t?.points_distribute_evenly || 'EGYENLETES'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1.5 border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 cursor-pointer uppercase text-[10px]"
          >
            {t?.points_reset || 'RESET'}
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {options.map((opt, idx) => {
          const val = points[opt] || 0;

          return (
            <div key={idx} className="p-3.5 bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="font-normal text-sm text-neutral-200">{opt}</span>
                <span className="font-technical text-sm text-white font-bold">{val} P</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStep(opt, -5)}
                  className="w-7 h-7 flex items-center justify-center border border-neutral-700 text-neutral-400 hover:text-white cursor-pointer font-technical text-xs"
                >
                  -
                </button>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={val}
                  onChange={(e) => handleSliderChange(opt, e.target.value)}
                  className="flex-1 accent-white cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => handleStep(opt, 5)}
                  className="w-7 h-7 flex items-center justify-center border border-neutral-700 text-neutral-400 hover:text-white cursor-pointer font-technical text-xs"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={totalAssigned !== 100 || submitting}
        className="w-full py-4 px-6 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 text-black disabled:text-neutral-500 font-technical text-xs uppercase tracking-[0.2em] font-bold transition cursor-pointer disabled:cursor-not-allowed"
      >
        {submitting
          ? `[ ${t?.submitting || 'RÖGZÍTÉS FOLYAMATBAN...'} ]`
          : totalAssigned === 100
          ? `[ ${t?.submit_points || 'ELOSZTÁS BEKÜLDÉSE'} ]`
          : `[ ${t?.need_100_points || '100 PONT SZÜKSÉGES'} ]`}
      </button>
    </form>
  );
}
