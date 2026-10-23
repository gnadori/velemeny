import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import { Maximize2, Minimize2, QrCode, Users, Lock, Sparkles } from 'lucide-react';

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

  // Participant join URL is the current origin + root path
  const joinUrl = window.location.origin + window.location.pathname;

  // Listen to active session
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'sessions', 'active'), (snap) => {
      setSession(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, []);

  // Listen to responses for current question
  useEffect(() => {
    const qId = session?.activeQuestion?.id;
    if (!qId) {
      setResponses([]);
      return;
    }

    const q = query(collection(db, 'responses'), where('questionId', '==', qId));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setResponses(docs);
    });

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Bar for Presenter */}
      <header className="p-4 sm:px-8 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/20">
            V
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">Vélemény</h1>
            <p className="text-xs text-slate-400">Élő Kivetítő Nézet</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Response Counter */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-sm text-sm font-semibold">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="text-white font-bold text-base">{responses.length}</span>
            <span className="text-slate-400 hidden sm:inline">válasz</span>
          </div>

          {/* Voting Status Indicator */}
          {!votingOpen && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Lezárva</span>
            </div>
          )}

          {/* Join Info / QR Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-sm font-medium transition cursor-pointer"
            title="Csatlakozási QR kód megnyitása"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">Csatlakozás QR</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Teljes képernyő"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 max-w-7xl w-full mx-auto">
        {!activeQuestion ? (
          /* Waiting Screen with Large QR code */
          <div className="text-center space-y-8 animate-in fade-in duration-500 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Készülj a szavazásra
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Csatlakozz a mobiloddal!
            </h2>

            <div className="p-6 bg-white rounded-3xl inline-block shadow-2xl shadow-indigo-500/10 ring-4 ring-indigo-500/20">
              <QRCodeSVG value={joinUrl} size={240} level="M" />
            </div>

            <div className="space-y-1">
              <p className="text-sm uppercase tracking-wider text-slate-400 font-semibold">
                Vagy látogass el a böngésződben ide:
              </p>
              <p className="text-2xl font-mono font-bold text-indigo-300 break-all select-all">
                {joinUrl}
              </p>
            </div>

            <p className="text-slate-400 text-sm animate-pulse">
              Várakozás az első kérdés elindítására az admin felületről...
            </p>
          </div>
        ) : (
          /* Active Question & Live Visualization */
          <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Question Title Header */}
            <div className="text-center max-w-4xl mx-auto space-y-2">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-snug">
                {activeQuestion.title}
              </h2>
              {activeQuestion.description && (
                <p className="text-lg text-slate-400 font-normal">
                  {activeQuestion.description}
                </p>
              )}
            </div>

            {/* Visualisation based on type */}
            <div className="w-full">
              {activeQuestion.type === 'wordcloud' && (
                <WordCloudDisplay responses={responses} />
              )}
              {activeQuestion.type === 'choice' && (
                <ChoiceDisplay question={activeQuestion} responses={responses} />
              )}
              {activeQuestion.type === 'text' && (
                <TextDisplay responses={responses} />
              )}
              {activeQuestion.type === 'rating' && (
                <RatingDisplay question={activeQuestion} responses={responses} />
              )}
              {activeQuestion.type === 'points100' && (
                <Points100Display question={activeQuestion} responses={responses} />
              )}
              {activeQuestion.type === 'grid2x2' && (
                <Grid2x2Display question={activeQuestion} responses={responses} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="p-4 sm:px-8 border-t border-slate-900 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Csatlakozás:</span>
          <span className="font-mono text-slate-300 font-semibold">{joinUrl}</span>
        </div>
        <div>
          <span>Vélemény &bull; Mentimeter alternatíva</span>
        </div>
      </footer>

      {/* QR Code Modal Overlay */}
      {showQrModal && (
        <div
          onClick={() => setShowQrModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-white">Csatlakozási QR-kód</h3>
            <div className="p-5 bg-white rounded-2xl inline-block shadow-inner">
              <QRCodeSVG value={joinUrl} size={220} level="M" />
            </div>
            <p className="text-sm font-mono text-indigo-300 break-all">{joinUrl}</p>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition cursor-pointer"
            >
              Bezárás
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
