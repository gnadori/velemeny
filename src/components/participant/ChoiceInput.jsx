import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function ChoiceInput({ question, onSubmit, submitting }) {
  const options = question.options || [];
  const allowMultiple = question.allowMultiple || false;
  const [selected, setSelected] = useState([]);

  const toggleOption = (opt) => {
    if (allowMultiple) {
      if (selected.includes(opt)) {
        setSelected(selected.filter(item => item !== opt));
      } else {
        setSelected([...selected, opt]);
      }
    } else {
      setSelected([opt]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected.length === 0) return;
    onSubmit(allowMultiple ? selected : selected[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <div className="space-y-3">
        {options.map((opt, idx) => {
          const isSelected = selected.includes(opt);
          const letter = String.fromCharCode(65 + idx);

          return (
            <button
              type="button"
              key={idx}
              onClick={() => toggleOption(opt)}
              className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {letter}
                </span>
                <span className="font-semibold text-lg">{opt}</span>
              </div>
              {isSelected && <Check className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
            </button>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={selected.length === 0 || submitting}
        className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-lg shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer"
      >
        {submitting ? 'Beküldés...' : 'Válasz beküldése'}
      </button>
    </form>
  );
}
