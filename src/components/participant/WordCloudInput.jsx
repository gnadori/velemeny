import React, { useState } from 'react';

export default function WordCloudInput({ onSubmit, submitting }) {
  const [words, setWords] = useState(['', '', '']);

  const handleChange = (index, value) => {
    const updated = [...words];
    updated[index] = value;
    setWords(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanWords = words
      .map(w => w.trim())
      .filter(w => w.length > 0);

    if (cleanWords.length === 0) return;
    onSubmit(cleanWords);
  };

  const hasAtLeastOne = words.some(w => w.trim().length > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
              #{i + 1}
            </span>
            <input
              type="text"
              value={words[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder={`${i + 1}. szó vagy kifejezés`}
              maxLength={40}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none text-slate-800 dark:text-slate-100 font-medium text-lg transition shadow-sm"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={!hasAtLeastOne || submitting}
        className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-lg shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer"
      >
        {submitting ? 'Beküldés...' : 'Válaszok beküldése'}
      </button>
    </form>
  );
}
