import React from 'react';

export default function TextDisplay({ responses }) {
  const items = responses
    .map(r => (typeof r.value === 'string' ? r.value.trim() : ''))
    .filter(Boolean);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-neutral-500 font-technical text-xs tracking-[0.2em] uppercase">
        <span className="w-8 h-[1px] bg-neutral-700 mb-6" />
        <span>[ ARCHÍVUM // ÜRES ]</span>
        <span className="text-neutral-600 mt-2 text-[10px] tracking-widest">A beérkező szöveges válaszok indexkártyákként fognak megjelenni</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[65vh] overflow-y-auto p-2">
      {items.map((text, idx) => (
        <div
          key={idx}
          className="relative p-6 border border-neutral-800 bg-neutral-950/70 backdrop-blur-sm text-neutral-200 flex flex-col justify-between hover:border-neutral-700 transition-colors"
        >
          {/* Subtle top index line */}
          <div className="flex justify-between items-center text-[10px] font-technical uppercase tracking-[0.2em] text-neutral-500 pb-3 border-b border-neutral-900 mb-4">
            <span>INDEX // {String(idx + 1).padStart(3, '0')}</span>
            <span>BEJEGYZÉS</span>
          </div>

          <p className="font-editorial text-xl sm:text-2xl leading-relaxed text-neutral-100 font-normal italic">
            "{text}"
          </p>

          <div className="mt-6 flex justify-end text-[10px] font-technical text-neutral-600 tracking-widest">
            +
          </div>
        </div>
      ))}
    </div>
  );
}
