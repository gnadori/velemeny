import React, { useState } from 'react';
import { Star } from 'lucide-react';

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
      <div className="flex justify-center items-center gap-2 py-4">
        {Array.from({ length: maxScale }, (_, i) => i + 1).map((val) => {
          const isSelected = rating >= val;

          return (
            <button
              type="button"
              key={val}
              onClick={() => setRating(val)}
              className="flex flex-col items-center gap-2 p-2 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  isSelected
                    ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                    : 'text-slate-300 dark:text-slate-700'
                }`}
              />
              <span className={`text-sm font-bold ${rating === val ? 'text-amber-500' : 'text-slate-400'}`}>
                {val}
              </span>
            </button>
          );
        })}
      </div>

      <div className="text-center font-medium text-slate-500 text-sm">
        {rating > 0 ? `Kiválasztott érték: ${rating} / ${maxScale}` : 'Kattints egy csillagra az értékeléshez'}
      </div>

      <button
        type="submit"
        disabled={rating === 0 || submitting}
        className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-lg shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer"
      >
        {submitting ? 'Beküldés...' : 'Értékelés beküldése'}
      </button>
    </form>
  );
}
