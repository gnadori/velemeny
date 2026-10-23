import React, { useState } from 'react';

export default function RatingInput({ question, onSubmit, submitting }) {
  const maxScale = question.scaleMax || 5;
  const [rating, setRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(rating);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md mx-auto">
      <div className="grid grid-cols-5 gap-2 py-4">
        {Array.from({ length: maxScale }, (_, i) => i + 1).map((val) => {
          const isSelected = rating === val;

          return (
            <button
              type="button"
              key={val}
              onClick={() => setRating(val)}
              className={`p-3 border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                isSelected
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600'
              }`}
            >
              <span className="font-technical text-sm font-bold">
                {val}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-neutral-700'}`} />
            </button>
          );
        })}
      </div>

      <div className="text-center font-technical text-[10px] text-neutral-500 uppercase tracking-widest">
        {rating > 0 ? `KIVÁLASZTVA: [ ${rating} / ${maxScale} ]` : 'VÁLASSZ EGY ÉRTÉKET A SKÁLÁN'}
      </div>

      <button
        type="submit"
        disabled={rating === 0 || submitting}
        className="w-full py-4 px-6 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 text-black disabled:text-neutral-500 font-technical text-xs uppercase tracking-[0.2em] font-bold transition cursor-pointer disabled:cursor-not-allowed"
      >
        {submitting ? '[ RÖGZÍTÉS FOLYAMATBAN... ]' : '[ ÉRTÉKELÉS BEKÜLDÉSE ]'}
      </button>
    </form>
  );
}
