import React, { useState } from 'react';
import { Star, Heart } from 'lucide-react';

export default function RatingInput({ question, onSubmit, submitting, t }) {
  const maxScale = Math.min(10, Math.max(2, Number(question.scaleMax) || 5));
  const iconType = question.ratingIcon || 'stars'; // 'stars' | 'hearts' | 'numbers'
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const activeValue = hoverRating || rating;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(rating);
  };

  const isSmall = maxScale > 6;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-lg mx-auto">
      {/* Icon based ratings: Stars or Hearts */}
      {iconType === 'stars' && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 py-4">
          {Array.from({ length: maxScale }, (_, i) => i + 1).map((val) => {
            const isFilled = activeValue >= val;
            return (
              <button
                type="button"
                key={val}
                onClick={() => setRating(val)}
                onMouseEnter={() => setHoverRating(val)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 sm:p-2 transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                title={`${val} / ${maxScale}`}
              >
                <Star
                  className={`${isSmall ? 'w-7 h-7 sm:w-9 sm:h-9' : 'w-9 h-9 sm:w-11 sm:h-11'} transition-colors duration-150 ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                      : 'text-neutral-700'
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      {iconType === 'hearts' && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 py-4">
          {Array.from({ length: maxScale }, (_, i) => i + 1).map((val) => {
            const isFilled = activeValue >= val;
            return (
              <button
                type="button"
                key={val}
                onClick={() => setRating(val)}
                onMouseEnter={() => setHoverRating(val)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 sm:p-2 transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                title={`${val} / ${maxScale}`}
              >
                <Heart
                  className={`${isSmall ? 'w-7 h-7 sm:w-9 sm:h-9' : 'w-9 h-9 sm:w-11 sm:h-11'} transition-colors duration-150 ${
                    isFilled
                      ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                      : 'text-neutral-700'
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Number tiles rating */}
      {iconType === 'numbers' && (
        <div className={`grid ${maxScale <= 5 ? 'grid-cols-5' : maxScale <= 8 ? 'grid-cols-4 sm:grid-cols-8' : 'grid-cols-5 sm:grid-cols-10'} gap-2 py-4`}>
          {Array.from({ length: maxScale }, (_, i) => i + 1).map((val) => {
            const isSelected = rating === val;
            return (
              <button
                type="button"
                key={val}
                onClick={() => setRating(val)}
                className={`p-3 border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
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
      )}

      {/* Value readout */}
      <div className="text-center font-technical text-[10px] text-neutral-400 uppercase tracking-widest">
        {rating > 0
          ? `${t?.scale_selected || 'KIVÁLASZTVA'}: [ ${rating} / ${maxScale} ]`
          : (t?.scale_select || 'VÁLASSZ ÉRTÉKET A SKÁLÁN')}
      </div>

      <button
        type="submit"
        disabled={rating === 0 || submitting}
        className="w-full py-4 px-6 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 text-black disabled:text-neutral-500 font-technical text-xs uppercase tracking-[0.2em] font-bold transition cursor-pointer disabled:cursor-not-allowed"
      >
        {submitting ? `[ ${t?.submitting || 'RÖGZÍTÉS FOLYAMATBAN...'} ]` : `[ ${t?.submit_rating || 'ÉRTÉKELÉS BEKÜLDÉSE'} ]`}
      </button>
    </form>
  );
}
