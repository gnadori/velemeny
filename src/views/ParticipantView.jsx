import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getParticipantId } from '../utils/participant';

import WordCloudInput from '../components/participant/WordCloudInput';
import ChoiceInput from '../components/participant/ChoiceInput';
import TextInput from '../components/participant/TextInput';
import RatingInput from '../components/participant/RatingInput';
import Points100Input from '../components/participant/Points100Input';
import Grid2x2Input from '../components/participant/Grid2x2Input';

export default function ParticipantView() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const participantId = getParticipantId();

  // Listen to active session
  useEffect(() => {
    const unsubSession = onSnapshot(
      doc(db, 'sessions', 'active'),
      (snap) => {
        setSession(snap.exists() ? snap.data() : null);
        setPermissionError(false);
        setLoading(false);
      },
      (error) => {
        console.error('Participant session snapshot error:', error);
        setPermissionError(true);
        setLoading(false);
      }
    );

    return () => unsubSession();
  }, []);

  // Listen if current participant already voted on the active question
  useEffect(() => {
    if (!session?.activeQuestion?.id) {
      setHasVoted(false);
      return;
    }

    const unsubVote = onSnapshot(
      doc(db, 'responses', `${session.activeQuestion.id}_${participantId}`),
      (snap) => {
        setHasVoted(snap.exists());
      },
      (error) => {
        console.error('Participant vote check error:', error);
      }
    );

    return () => unsubVote();
  }, [session?.activeQuestion?.id, participantId]);

  const handleSubmit = async (value) => {
    if (!session?.activeQuestion?.id || submitting) return;

    try {
      setSubmitting(true);
      await setDoc(doc(db, 'responses', `${session.activeQuestion.id}_${participantId}`), {
        questionId: session.activeQuestion.id,
        participantId,
        type: session.activeQuestion.type,
        value,
        createdAt: serverTimestamp()
      });
      setHasVoted(true);
    } catch (err) {
      console.error('Error submitting response:', err);
      alert('Hiba történt a válasz mentésekor: ' + (err.message || 'Hálózati vagy jogosultsági hiba'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-neutral-400 font-technical text-xs tracking-[0.25em] uppercase">
        <span className="animate-pulse">[ CSATLAKOZÁS FOLYAMATBAN... ]</span>
      </div>
    );
  }

  // Permission error in Firestore rules
  if (permissionError) {
    return (
      <div className="min-h-screen flex flex-col justify-between p-6 sm:p-12 bg-[#09090b] text-neutral-300 bg-grid-technical">
        <header className="flex justify-between items-baseline font-technical text-[10px] uppercase tracking-[0.25em] text-neutral-500 border-b border-neutral-900 pb-4">
          <span>VÉLEMÉNY // ARCHÍVUM</span>
          <span>STATUS: JOGOSULTSÁG</span>
        </header>

        <main className="max-w-md w-full mx-auto text-center space-y-6 my-auto py-12">
          <div className="w-8 h-[1px] bg-red-600 mx-auto" />
          <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-white italic tracking-tight">
            Firestore jogosultsági beállítás szükséges
          </h2>
          <p className="font-sans text-xs text-neutral-400 font-light leading-relaxed">
            A Firebase Firestore adatbázis jelenleg csak bejelentkezett felhasználóknak engedélyezi az olvasást. A nyilvános szavazáshoz közzé kell tenni a biztonsági szabályokat a Firebase Console-ban.
          </p>
        </main>

        <footer className="text-center font-technical text-[9px] uppercase tracking-[0.2em] text-neutral-600 pt-4 border-t border-neutral-900">
          FIRESTORE PERMISSION DENIED
        </footer>
      </div>
    );
  }

  // No active question
  if (!session?.activeQuestion) {
    return (
      <div className="min-h-screen flex flex-col justify-between p-6 sm:p-12 bg-[#09090b] text-neutral-300 bg-grid-technical">
        <header className="flex justify-between items-baseline font-technical text-[10px] uppercase tracking-[0.25em] text-neutral-500 border-b border-neutral-900 pb-4">
          <span>VÉLEMÉNY // ARCHÍVUM</span>
          <span>STÁTUSZ: KÉSZENLÉT</span>
        </header>

        <main className="max-w-md w-full mx-auto text-center space-y-6 my-auto py-12">
          <div className="w-8 h-[1px] bg-neutral-600 mx-auto" />
          <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-white italic tracking-tight leading-tight">
            Várakozás az elindításra
          </h2>
          <p className="font-technical text-xs text-neutral-500 tracking-[0.15em] uppercase">
            [ Az előadó hamarosan megnyitja a következő szakaszt ]
          </p>
        </main>

        <footer className="text-center font-technical text-[9px] uppercase tracking-[0.2em] text-neutral-600 pt-4 border-t border-neutral-900">
          AMKK / AZUMA MAKOTO INSPIRED MINIMALISM
        </footer>
      </div>
    );
  }

  const { activeQuestion, votingOpen = true } = session;

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-200 bg-grid-technical flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="flex justify-between items-baseline font-technical text-[10px] uppercase tracking-[0.25em] text-neutral-500 border-b border-neutral-900 pb-4">
        <span>VÉLEMÉNY // INTERAKTÍV</span>
        <span>{votingOpen ? 'SZAVAZÁS: NYITVA' : 'SZAVAZÁS: ZÁRVA'}</span>
      </header>

      {/* Main Body */}
      <main className="max-w-xl w-full mx-auto my-auto py-8 space-y-8">
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="font-technical text-[10px] uppercase tracking-[0.3em] text-neutral-500 block">
            [ AKTUÁLIS KÉRDÉS // {activeQuestion.type.toUpperCase()} ]
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-normal text-white italic tracking-tight leading-snug">
            {activeQuestion.title}
          </h1>
          {activeQuestion.description && (
            <p className="font-sans text-sm text-neutral-400 font-light">
              {activeQuestion.description}
            </p>
          )}
        </div>

        {/* State rendering */}
        {hasVoted ? (
          <div className="p-10 border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm text-center space-y-4">
            <span className="font-technical text-[10px] uppercase tracking-[0.25em] text-neutral-500 block">
              STATUS // RÖGZÍTVE
            </span>
            <h2 className="font-editorial text-3xl font-normal text-white italic">
              A válaszod rögzítésre került
            </h2>
            <div className="w-6 h-[1px] bg-neutral-700 mx-auto my-3" />
            <p className="font-technical text-xs text-neutral-400 tracking-wider uppercase">
              Kövesd a kivetítőt a valós idejű eredményekhez
            </p>
          </div>
        ) : !votingOpen ? (
          <div className="p-10 border border-neutral-800 bg-neutral-950/80 text-center space-y-3">
            <span className="font-technical text-[10px] uppercase tracking-[0.25em] text-neutral-500 block">
              STATUS // LEZÁRVA
            </span>
            <h2 className="font-editorial text-3xl font-normal text-neutral-300 italic">
              A szavazás jelenleg zárva
            </h2>
            <p className="font-technical text-xs text-neutral-500 uppercase tracking-wider">
              Az előadó felfüggesztette a válaszadást erre a kérdésre
            </p>
          </div>
        ) : (
          <div className="p-6 sm:p-8 border border-neutral-800 bg-neutral-950/70 backdrop-blur-sm relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neutral-600 -translate-x-[1px] -translate-y-[1px]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neutral-600 translate-x-[1px] -translate-y-[1px]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neutral-600 -translate-x-[1px] translate-y-[1px]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neutral-600 translate-x-[1px] translate-y-[1px]" />

            {activeQuestion.type === 'wordcloud' && (
              <WordCloudInput onSubmit={handleSubmit} submitting={submitting} />
            )}
            {activeQuestion.type === 'choice' && (
              <ChoiceInput question={activeQuestion} onSubmit={handleSubmit} submitting={submitting} />
            )}
            {activeQuestion.type === 'text' && (
              <TextInput onSubmit={handleSubmit} submitting={submitting} />
            )}
            {activeQuestion.type === 'rating' && (
              <RatingInput question={activeQuestion} onSubmit={handleSubmit} submitting={submitting} />
            )}
            {activeQuestion.type === 'points100' && (
              <Points100Input question={activeQuestion} onSubmit={handleSubmit} submitting={submitting} />
            )}
            {activeQuestion.type === 'grid2x2' && (
              <Grid2x2Input question={activeQuestion} onSubmit={handleSubmit} submitting={submitting} />
            )}
          </div>
        )}
      </main>

      <footer className="flex justify-between items-center font-technical text-[9px] uppercase tracking-[0.2em] text-neutral-600 pt-4 border-t border-neutral-900">
        <span>VÉLEMÉNY</span>
        <span>ID: {participantId.substring(0, 10)}</span>
      </footer>
    </div>
  );
}
