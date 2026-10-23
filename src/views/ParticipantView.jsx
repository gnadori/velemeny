import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { getParticipantId } from '../utils/participant';
import { CheckCircle2, Clock, Lock, Sparkles } from 'lucide-react';

import WordCloudInput from '../components/participant/WordCloudInput';
import ChoiceInput from '../components/participant/ChoiceInput';
import TextInput from '../components/participant/TextInput';
import RatingInput from '../components/participant/RatingInput';
import Points100Input from '../components/participant/Points100Input';
import Grid2x2Input from '../components/participant/Grid2x2Input';

export default function ParticipantView() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const participantId = getParticipantId();

  // Listen to active session
  useEffect(() => {
    const unsubSession = onSnapshot(doc(db, 'sessions', 'active'), (snap) => {
      if (snap.exists()) {
        setSession(snap.data());
      } else {
        setSession(null);
      }
      setLoading(false);
    });

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
      alert('Hiba történt a válasz elküldésekor. Kérlek próbáld újra!');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No active question
  if (!session?.activeQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl mx-auto flex items-center justify-center">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Hamarosan kezdünk!
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Kérlek várj, amíg az előadó elindítja az első kérdést. A képernyő automatikusan frissülni fog.
          </p>
        </div>
      </div>
    );
  }

  const { activeQuestion, votingOpen = true } = session;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between p-4 sm:p-6">
      <main className="max-w-md w-full mx-auto my-auto py-6">
        {/* Header / Question Title */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            Aktuális kérdés
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {activeQuestion.title}
          </h1>
          {activeQuestion.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeQuestion.description}
            </p>
          )}
        </div>

        {/* Voting state condition */}
        {hasVoted ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              Köszönjük a válaszodat!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              A válaszod sikeresen rögzítésre került. Figyeld a kivetítőt, és várd meg a következő kérdést!
            </p>
          </div>
        ) : !votingOpen ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              A szavazás jelenleg zárva van
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Az előadó pillanatnyilag lezárta erre a kérdésre a válaszadást.
            </p>
          </div>
        ) : (
          /* Question Form by Type */
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-700/80">
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

      <footer className="text-center py-4 text-xs text-slate-400">
        Vélemény &bull; Valós idejű visszajelzés
      </footer>
    </div>
  );
}
