import React, { useState } from 'react';

export default function TextInput({ onSubmit, submitting }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <div className="relative">
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Fogalmazd meg a gondolatodat..."
          maxLength={300}
          className="w-full p-4 bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-400 font-light text-base resize-none transition-colors"
        />
        <div className="text-right font-technical text-[10px] text-neutral-500 mt-1 uppercase tracking-widest">
          [ {String(text.length).padStart(3, '0')} / 300 KARAKTER ]
        </div>
      </div>

      <button
        type="submit"
        disabled={!text.trim() || submitting}
        className="w-full py-4 px-6 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 text-black disabled:text-neutral-500 font-technical text-xs uppercase tracking-[0.2em] font-bold transition cursor-pointer disabled:cursor-not-allowed"
      >
        {submitting ? '[ RÖGZÍTÉS FOLYAMATBAN... ]' : '[ GONDOLAT BEKÜLDÉSE ]'}
      </button>
    </form>
  );
}
