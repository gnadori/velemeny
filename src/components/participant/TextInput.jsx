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
          placeholder="Írd ide a válaszodat..."
          maxLength={300}
          className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100 font-medium text-lg resize-none shadow-sm"
        />
        <div className="text-right text-xs text-slate-400 mt-1">
          {text.length} / 300 karakter
        </div>
      </div>

      <button
        type="submit"
        disabled={!text.trim() || submitting}
        className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-lg shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer"
      >
        {submitting ? 'Beküldés...' : 'Válasz beküldése'}
      </button>
    </form>
  );
}
