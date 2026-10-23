import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getParticipantId } from '../utils/participant';
import { translations, getSavedLanguage, saveLanguage } from '../utils/i18n';
import LanguageSelector from '../components/LanguageSelector';

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
  const [lang, setLang] = useState(getSavedLanguage);

  const t = translations[lang] || translations.hu;
  const participantId = getParticipantId();

  const handleSelectLang = (newLang) => {
    setLang(newLang);
    saveLanguage(newLang);
  };

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
      alert('Hiba / Error / Eroare: ' + (err.message || ''));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-neutral-400 font-technical text-xs tracking-[0.25em] uppercase">
        <span className="animate-pulse">[ {t.connecting} ]</span>
      </div>
    );
  }

  // Permission error in Firestore rules
  if (permissionError) {
    return (
      <div className="min-h-screen flex flex-col justify-between p-6 sm:p-12 bg-[#09090b] text-neutral-300 bg-grid-technical">
        <header className="flex justify-between items-center border-b border-neutral-900 pb-4">
          <span className="font-technical text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            {t.header_status}: ERROR
          </span>
          <LanguageSelector currentLang={lang} onSelectLang={handleSelectLang} />
        </header>

        <main className="max-w-md w-full mx-auto text-center space-y-6 my-auto py-12">
          <div className="w-8 h-[1px] bg-red-600 mx-auto" />
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t.permission_error_title}
          </h2>
          <p className="text-xs text-neutral-400 font-light leading-relaxed">
            {t.permission_error_desc}
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
        <header className="flex justify-between items-center border-b border-neutral-900 pb-4">
          <span className="font-technical text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            {t.header_status}: {t.status_ready}
          </span>
          <LanguageSelector currentLang={lang} onSelectLang={handleSelectLang} />
        </header>

        <main className="max-w-md w-full mx-auto text-center space-y-6 my-auto py-12">
          <div className="w-8 h-[1px] bg-neutral-600 mx-auto" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t.waiting_title}
          </h2>
          <p className="font-technical text-xs text-neutral-400 tracking-[0.15em] uppercase">
            [ {t.waiting_subtitle} ]
          </p>
        </main>

        <footer className="text-center font-technical text-[9px] uppercase tracking-[0.2em] text-neutral-600 pt-4 border-t border-neutral-900">
          VÉLEMÉNY
        </footer>
      </div>
    );
  }

  const { activeQuestion, votingOpen = true } = session;

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-200 bg-grid-technical flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header with Language Switcher */}
      <header className="flex justify-between items-center border-b border-neutral-900 pb-4">
        <span className="font-technical text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          {votingOpen ? t.status_voting_open : t.status_voting_closed}
        </span>
        <LanguageSelector currentLang={lang} onSelectLang={handleSelectLang} />
      </header>

      {/* Main Body */}
      <main className="max-w-xl w-full mx-auto my-auto py-8 space-y-8">
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="font-technical text-[10px] uppercase tracking-[0.3em] text-neutral-500 block">
            [ {t.current_question} ]
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
            {activeQuestion.title}
          </h1>
          {activeQuestion.description && (
            <p className="text-sm text-neutral-400 font-light">
              {activeQuestion.description}
            </p>
          )}
        </div>

        {/* State rendering */}
        {hasVoted ? (
          <div className="p-10 border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm text-center space-y-4">
            <span className="font-technical text-[10px] uppercase tracking-[0.25em] text-neutral-500 block">
              STATUS // OK
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {t.voted_title}
            </h2>
            <div className="w-6 h-[1px] bg-neutral-700 mx-auto my-3" />
            <p className="font-technical text-xs text-neutral-400 tracking-wider uppercase">
              {t.voted_subtitle}
            </p>
          </div>
        ) : !votingOpen ? (
          <div className="p-10 border border-neutral-800 bg-neutral-950/80 text-center space-y-3">
            <span className="font-technical text-[10px] uppercase tracking-[0.25em] text-neutral-500 block">
              STATUS // LOCKED
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-300 tracking-tight">
              {t.voting_closed_title}
            </h2>
            <p className="font-technical text-xs text-neutral-500 uppercase tracking-wider">
              {t.voting_closed_subtitle}
            </p>
          </div>
        ) : (
          <div className="p-6 sm:p-8 border border-neutral-800 bg-neutral-950/70 backdrop-blur-sm relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neutral-600 -translate-x-[1px] -translate-y-[1px]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neutral-600 translate-x-[1px] -translate-y-[1px]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neutral-600 -translate-x-[1px] translate-y-[1px]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neutral-600 translate-x-[1px] translate-y-[1px]" />

            {activeQuestion.type === 'wordcloud' && (
              <WordCloudInput onSubmit={handleSubmit} submitting={submitting} t={t} />
            )}
            {activeQuestion.type === 'choice' && (
              <ChoiceInput question={activeQuestion} onSubmit={handleSubmit} submitting={submitting} t={t} />
            )}
            {activeQuestion.type === 'text' && (
              <TextInput onSubmit={handleSubmit} submitting={submitting} t={t} />
            )}
            {activeQuestion.type === 'rating' && (
              <RatingInput question={activeQuestion} onSubmit={handleSubmit} submitting={submitting} t={t} />
            )}
            {activeQuestion.type === 'points100' && (
              <Points100Input question={activeQuestion} onSubmit={handleSubmit} submitting={submitting} t={t} />
            )}
            {activeQuestion.type === 'grid2x2' && (
              <Grid2x2Input question={activeQuestion} onSubmit={handleSubmit} submitting={submitting} t={t} />
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
