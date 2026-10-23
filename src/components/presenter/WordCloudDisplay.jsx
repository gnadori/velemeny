import React, { useMemo } from 'react';

export default function WordCloudDisplay({ responses, t }) {
  const words = useMemo(() => {
    const counts = {};
    responses.forEach(r => {
      const list = Array.isArray(r.value) ? r.value : [r.value];
      list.forEach(w => {
        if (!w || typeof w !== 'string') return;
        const clean = w.trim();
        if (clean.length > 0) {
          const key = clean.toLowerCase();
          counts[key] = {
            raw: clean,
            count: (counts[key]?.count || 0) + 1
          };
        }
      });
    });

    const entries = Object.values(counts);
    if (entries.length === 0) return [];

    const maxCount = Math.max(...entries.map(e => e.count));
    const minCount = Math.min(...entries.map(e => e.count));

    return entries
      .sort((a, b) => b.count - a.count)
      .map(({ raw, count }) => {
        const range = maxCount - minCount || 1;
        const normalized = (count - minCount) / range;
        const fontSizeRem = 1.25 + normalized * 3.25;

        return {
          word: raw,
          count,
          fontSize: `${fontSizeRem.toFixed(2)}rem`,
          opacity: 0.6 + normalized * 0.4
        };
      });
  }, [responses]);

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-neutral-500 font-technical text-xs tracking-[0.2em] uppercase">
        <span className="w-8 h-[1px] bg-neutral-700 mb-6" />
        <span>[ 00 ] {t?.waiting_for_words || 'Várakozás beérkező kifejezésekre'}</span>
        <span className="text-neutral-600 mt-2 text-[10px] tracking-widest">{t?.waiting_for_words_desc || 'A beküldött szavak valós időben rendeződnek'}</span>
      </div>
    );
  }

  return (
    <div className="relative p-10 sm:p-14 max-w-5xl mx-auto border border-neutral-800 bg-neutral-950/60 backdrop-blur-sm min-h-[380px] flex items-center justify-center">
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-neutral-600 -translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-neutral-600 translate-x-[1px] -translate-y-[1px]" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-neutral-600 -translate-x-[1px] translate-y-[1px]" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-neutral-600 translate-x-[1px] translate-y-[1px]" />

      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 max-w-4xl text-center">
        {words.map(({ word, count, fontSize, opacity }, i) => (
          <div
            key={i}
            style={{ fontSize, opacity }}
            className="transition-all duration-300 hover:opacity-100 hover:scale-105 select-none cursor-default inline-flex items-baseline gap-1.5 font-bold tracking-tight text-white"
          >
            <span>{word}</span>
            {count > 1 && (
              <span className="font-technical text-[10px] tracking-normal text-neutral-500 font-normal">
                [{count}]
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
