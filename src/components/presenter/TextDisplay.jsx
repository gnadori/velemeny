import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function TextDisplay({ responses }) {
  const items = responses
    .map(r => (typeof r.value === 'string' ? r.value.trim() : ''))
    .filter(Boolean);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-pulse">
        <MessageSquare className="w-16 h-16 mb-4 opacity-40" />
        <p className="text-2xl font-light">Még nem érkezett szöveges válasz...</p>
        <p className="text-sm mt-2 text-slate-500">Amint valaki beküldi a gondolatát, itt azonnal megjelenik egy kártyán.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[65vh] overflow-y-auto p-4 custom-scrollbar">
      {items.map((text, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md shadow-md border border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col justify-between hover:shadow-lg transition-all"
        >
          <p className="text-lg leading-relaxed font-normal whitespace-pre-wrap">{text}</p>
          <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>#{idx + 1}</span>
            <span>Válasz</span>
          </div>
        </div>
      ))}
    </div>
  );
}
