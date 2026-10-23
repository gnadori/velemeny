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
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-technical text-neutral-500 text-xs">
              [ 0{i + 1} ]
            </span>
            <input
              type="text"
              value={words[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder={`Kifejezés 0${i + 1}`}
              maxLength={40}
              className="w-full pl-14 pr-4 py-3.5 bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-400 font-light text-base transition-colors"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={!hasAtLeastOne || submitting}
        className="w-full py-4 px-6 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 text-black disabled:text-neutral-500 font-technical text-xs uppercase tracking-[0.2em] font-bold transition cursor-pointer disabled:cursor-not-allowed"
      >
        {submitting ? '[ RÖGZÍTÉS FOLYAMATBAN... ]' : '[ VÁLASZOK BEKÜLDÉSE ]'}
      </button>
    </form>
  );
}
