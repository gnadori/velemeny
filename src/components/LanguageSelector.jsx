import React from 'react';

const LANGUAGES = [
  { code: 'hu', label: 'HU' },
  { code: 'en', label: 'EN' },
  { code: 'ro', label: 'RO' }
];

export default function LanguageSelector({ currentLang, onSelectLang }) {
  return (
    <div className="flex items-center gap-1 font-technical text-[10px] tracking-widest uppercase">
      {LANGUAGES.map((lang, idx) => {
        const isActive = currentLang === lang.code;
        return (
          <React.Fragment key={lang.code}>
            <button
              onClick={() => onSelectLang(lang.code)}
              className={`px-1.5 py-0.5 transition cursor-pointer ${
                isActive
                  ? 'text-white font-bold border-b border-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {lang.label}
            </button>
            {idx < LANGUAGES.length - 1 && (
              <span className="text-neutral-700 select-none">/</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
