import React, { useState } from 'react';

export default function ChoiceInput({ question, onSubmit, submitting, t }) {
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
      <div className="space-y-2.5">
        {options.map((opt, idx) => {
          const isSelected = selected.includes(opt);
          const letter = String.fromCharCode(65 + idx);

          return (
            <button
              type="button"
              key={idx}
              onClick={() => toggleOption(opt)}
              className={`w-full p-4 border text-left flex items-baseline justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-900/80 text-neutral-200 border-neutral-800 hover:border-neutral-600'
              }`}
            >
              <div className="flex items-baseline gap-3">
                <span className={`font-technical text-xs ${isSelected ? 'text-neutral-600' : 'text-neutral-500'}`}>
                  [ {letter} ]
                </span>
                <span className="font-medium text-base tracking-tight">{opt}</span>
              </div>
              {isSelected && (
                <span className="font-technical text-xs font-bold tracking-widest">
                  [ {t?.selected_badge || 'KIVÁLASZTVA'} ]
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={selected.length === 0 || submitting}
        className="w-full py-4 px-6 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 text-black disabled:text-neutral-500 font-technical text-xs uppercase tracking-[0.2em] font-bold transition cursor-pointer disabled:cursor-not-allowed"
      >
        {submitting ? `[ ${t?.submitting || 'RÖGZÍTÉS FOLYAMATBAN...'} ]` : `[ ${t?.submit_choice || 'DÖNTÉS BEKÜLDÉSE'} ]`}
      </button>
    </form>
  );
}
