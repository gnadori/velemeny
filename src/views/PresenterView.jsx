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
  const joinUrl = window.location.origin + window.location.pathname;

  const handleSelectLang = (newLang) => {
    setLang(newLang);
    saveLanguage(newLang);
  };

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
            className="px-3 py-1.5 border border-neutral-700 hover:border-neutral-500 bg-neutral-900 text-neutral-200 transition text-[10px] uppercase tracking-[0.15em] cursor-pointer"
          >
            [ {t.qr_code_btn} ]
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

      {/* Footer */}
      <footer className="px-6 py-4 sm:px-12 border-t border-neutral-900 bg-neutral-950/70 flex items-center justify-between font-technical text-[10px] uppercase tracking-[0.2em] text-neutral-500">
        <div className="flex items-center gap-3">
          <span>{t.direct_access}:</span>
          <span className="text-neutral-300">{joinUrl}</span>
        </div>
        <div>
          <span>VÉLEMÉNY</span>
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
            className="bg-neutral-950 border border-neutral-800 p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative"
          >
            <div className="flex justify-between items-center text-[10px] font-technical uppercase tracking-[0.25em] text-neutral-500 pb-3 border-b border-neutral-900">
              <span>{t.qr_modal_title}</span>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                [ X ]
              </button>
            </div>

            <div className="p-4 bg-white inline-block">
              <QRCodeSVG value={joinUrl} size={200} level="M" />
            </div>

            <p className="font-technical text-xs text-neutral-400 break-all">{joinUrl}</p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-technical text-xs uppercase tracking-widest cursor-pointer"
            >
              [ {t.close_modal} ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
