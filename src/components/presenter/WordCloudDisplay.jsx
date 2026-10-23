import React, { useMemo } from 'react';

const COLORS = [
  'text-indigo-600 dark:text-indigo-400',
  'text-blue-600 dark:text-blue-400',
  'text-emerald-600 dark:text-emerald-400',
  'text-violet-600 dark:text-violet-400',
  'text-amber-600 dark:text-amber-400',
  'text-rose-600 dark:text-rose-400',
  'text-cyan-600 dark:text-cyan-400',
  'text-fuchsia-600 dark:text-fuchsia-400'
];

export default function WordCloudDisplay({ responses }) {
  const words = useMemo(() => {
    const counts = {};
    responses.forEach(r => {
      const list = Array.isArray(r.value) ? r.value : [r.value];
      list.forEach(w => {
        if (!w || typeof w !== 'string') return;
        const clean = w.trim().toLowerCase();
        if (clean.length > 0) {
          counts[clean] = (counts[clean] || 0) + 1;
        }
      });
    });

    const entries = Object.entries(counts);
    if (entries.length === 0) return [];

    const maxCount = Math.max(...entries.map(([, c]) => c));
    const minCount = Math.min(...entries.map(([, c]) => c));

    return entries
      .sort((a, b) => b[1] - a[1])
      .map(([word, count], idx) => {
        // Calculate font size between 1.25rem and 4.5rem
        const range = maxCount - minCount || 1;
        const normalized = (count - minCount) / range;
        const fontSizeRem = 1.25 + normalized * 3.25;

        return {
          word,
          count,
          fontSize: `${fontSizeRem.toFixed(2)}rem`,
          colorClass: COLORS[idx % COLORS.length]
        };
      });
  }, [responses]);

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-pulse">
        <p className="text-2xl font-light">Még nem érkezett szó a szófelhőbe...</p>
        <p className="text-sm mt-2 text-slate-500">A résztvevők válaszai valós időben fognak itt megjelenni.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 p-8 min-h-[350px] max-w-5xl mx-auto rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-xl border border-slate-200/50 dark:border-slate-800">
      {words.map(({ word, count, fontSize, colorClass }, i) => (
        <span
          key={i}
          style={{ fontSize }}
          className={`font-bold transition-all duration-300 hover:scale-110 cursor-default select-none tracking-tight ${colorClass}`}
          title={`${count} alkalommal említve`}
        >
          {word}
          {count > 1 && (
            <span className="text-xs font-semibold ml-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 align-super">
              {count}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
