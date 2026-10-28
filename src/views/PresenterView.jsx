import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import { translations, getSavedLanguage, saveLanguage } from '../utils/i18n';
import LanguageSelector from '../components/LanguageSelector';

import WordCloudDisplay from '../components/presenter/WordCloudDisplay';
import ChoiceDisplay from '../components/presenter/ChoiceDisplay';
import TextDisplay from '../components/presenter/TextDisplay';
import RatingDisplay from '../components/presenter/RatingDisplay';
import Points100Display from '../components/presenter/Points100Display';
import Grid2x2Display from '../components/presenter/Grid2x2Display';

export default function PresenterView() {
  const [session, setSession] = useState(null);
  const [responses, setResponses] = useState([]);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lang, setLang] = useState(getSavedLanguage);

  const t = translations[lang] || translations.hu;
  const cleanPath = window.location.pathname.endsWith('/')
    ? window.location.pathname
    : window.location.pathname + '/';
  const joinUrl = window.location.origin + cleanPath;

  const handleSelectLang = (newLang) => {
    setLang(newLang);
    saveLanguage(newLang);
  };

  // Keyboard shortcut listener: 'Q' toggles QR modal, 'Esc' closes it
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'q' || e.key === 'Q') {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
        setShowQrModal((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowQrModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'sessions', 'active'),
      (snap) => {
        setSession(snap.exists() ? snap.data() : null);
      },
      (error) => {
        console.error('Presenter session snapshot error:', error);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const qId = session?.activeQuestion?.id;
    if (!qId) {
      setResponses([]);
      return;
    }

    const q = query(collection(db, 'responses'), where('questionId', '==', qId));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setResponses(docs);
      },
      (error) => {
        console.error('Presenter responses query error:', error);
      }
    );

    return () => unsub();
  }, [session?.activeQuestion?.id]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const activeQuestion = session?.activeQuestion;
  const votingOpen = session?.votingOpen ?? true;

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 bg-grid-technical flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Header */}
      <header className="px-6 py-4 sm:px-12 border-b border-neutral-900 bg-neutral-950/70 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-baseline gap-4">
          <span className="text-xl font-extrabold tracking-tight text-white">
            {t.presenter_title}
          </span>
          <span className="font-technical text-[10px] uppercase tracking-[0.25em] text-neutral-500 hidden sm:inline">
            [ {t.presenter_archive} ]
          </span>
        </div>

        <div className="flex items-center gap-4 font-technical text-xs">
          {/* Response Count Pill */}
          <div className="px-3 py-1.5 border border-neutral-800 bg-neutral-900/60 text-neutral-300">
            <span className="text-white font-bold">{responses.length}</span>
            <span className="text-neutral-500 ml-1.5 uppercase text-[10px] tracking-wider">{t.responses_count}</span>
          </div>

          {!votingOpen && (
            <div className="px-3 py-1.5 border border-red-900/50 bg-red-950/20 text-red-400 text-[10px] uppercase tracking-wider">
              [ {t.closed_badge} ]
            </div>
          )}

          {/* QR trigger */}
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-700 hover:border-neutral-500 bg-neutral-900 text-neutral-200 transition text-[10px] uppercase tracking-[0.15em] cursor-pointer"
            title={`${t.qr_modal_title} [Q]`}
          >
            <span className="w-2 h-2 bg-white inline-block"></span>
            <span>[ {t.qr_code_btn} ]</span>
          </button>

          {/* Language Selector */}
          <LanguageSelector currentLang={lang} onSelectLang={handleSelectLang} />

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="px-2.5 py-1.5 border border-neutral-800 hover:border-neutral-600 bg-neutral-900 text-neutral-400 hover:text-white transition cursor-pointer text-xs font-mono"
            title="Fullscreen"
          >
            {isFullscreen ? '[ ⤓ ]' : '[ ⤢ ]'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center p-6 sm:p-14 max-w-7xl w-full mx-auto">
        {!activeQuestion ? (
          <div className="text-center space-y-10 animate-in fade-in duration-500 max-w-lg mx-auto">
            <div className="w-8 h-[1px] bg-neutral-600 mx-auto" />

            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {t.join_prompt_title}
            </h2>

            <div className="p-4 bg-neutral-900 border border-neutral-800 inline-block shadow-2xl relative">
              <div className="p-4 bg-white">
                <QRCodeSVG value={joinUrl} size={220} level="M" />
              </div>
            </div>

            <div className="space-y-1.5 font-technical">
              <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                {t.direct_access}:
              </div>
              <div className="text-sm font-normal text-neutral-300 break-all select-all tracking-wider border-b border-neutral-800 pb-1">
                {joinUrl}
              </div>
            </div>

            <p className="font-technical text-[10px] uppercase tracking-[0.2em] text-neutral-600 animate-pulse">
              [ {t.waiting_for_admin} ]
            </p>
          </div>
        ) : (
          <div className="w-full space-y-10 animate-in fade-in duration-300">
            {/* Header Title */}
            <div className="text-center max-w-4xl mx-auto space-y-2">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-snug">
                {activeQuestion.title}
              </h2>
              {activeQuestion.description && (
                <p className="font-sans text-base text-neutral-400 font-light">
                  {activeQuestion.description}
                </p>
              )}
            </div>

            {/* Visualisations */}
            <div className="w-full">
              {activeQuestion.type === 'wordcloud' && (
                <WordCloudDisplay responses={responses} t={t} />
              )}
              {activeQuestion.type === 'choice' && (
                <ChoiceDisplay question={activeQuestion} responses={responses} t={t} />
              )}
              {activeQuestion.type === 'text' && (
                <TextDisplay responses={responses} t={t} />
              )}
              {activeQuestion.type === 'rating' && (
                <RatingDisplay question={activeQuestion} responses={responses} t={t} />
              )}
              {activeQuestion.type === 'points100' && (
                <Points100Display question={activeQuestion} responses={responses} t={t} />
              )}
              {activeQuestion.type === 'grid2x2' && (
                <Grid2x2Display question={activeQuestion} responses={responses} t={t} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer with Persistent Scannable QR Code */}
      <footer className="px-6 py-3.5 sm:px-12 border-t border-neutral-900 bg-neutral-950/85 backdrop-blur-md flex items-center justify-between font-technical text-[10px] uppercase tracking-[0.2em] text-neutral-500 z-10">
        <div className="flex items-center gap-4">
          {/* Always visible, scannable QR Code */}
          <div
            onClick={() => setShowQrModal(true)}
            className="p-1.5 bg-white border border-neutral-700 shadow-xl cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
            title={`${t.qr_modal_title} - ${t.click_to_enlarge}`}
          >
            <QRCodeSVG value={joinUrl} size={72} level="M" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-neutral-200 tracking-widest">
                [ {t.scan_to_join} ]
              </span>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="text-[9px] text-neutral-500 hover:text-neutral-300 lowercase font-mono cursor-pointer underline underline-offset-2 transition"
              >
                ({t.click_to_enlarge})
              </button>
            </div>
            <div className="text-xs font-semibold text-white tracking-wider font-mono select-all">
              {joinUrl}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-1">
          <span className="text-neutral-400 font-bold tracking-[0.3em]">VÉLEMÉNY</span>
          <span className="text-[8px] text-neutral-600 tracking-widest">[ LIVE INTERACTIVE DISPLAY ]</span>
        </div>
      </footer>

      {/* QR Code Modal Overlay */}
      {showQrModal && (
        <div
          onClick={() => setShowQrModal(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-950 border border-neutral-800 p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative"
          >
            <div className="flex justify-between items-center text-[10px] font-technical uppercase tracking-[0.25em] text-neutral-500 pb-3 border-b border-neutral-900">
              <span>{t.qr_modal_title}</span>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-neutral-400 hover:text-white cursor-pointer px-2 py-1 border border-neutral-800 hover:border-neutral-600"
              >
                [ X / ESC ]
              </button>
            </div>

            <div className="p-4 bg-white inline-block shadow-2xl">
              <QRCodeSVG value={joinUrl} size={260} level="M" />
            </div>

            <div className="space-y-1 font-technical">
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest">{t.direct_access}:</div>
              <p className="text-sm font-bold text-neutral-200 tracking-wider font-mono break-all select-all">{joinUrl}</p>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-technical text-xs uppercase tracking-widest cursor-pointer transition"
            >
              [ {t.close_modal} ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
