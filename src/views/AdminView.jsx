import React, { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { auth, googleProvider, db, ADMIN_EMAIL } from '../firebase';
import { SAMPLE_QUESTIONS } from '../utils/sampleQuestions';

import {
  LogIn,
  LogOut,
  Play,
  Square,
  Lock,
  Unlock,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Cloud,
  CheckSquare,
  MessageSquare,
  Star,
  Sliders,
  Grid
} from 'lucide-react';

const TYPE_CONFIG = {
  wordcloud: { label: 'Szófelhő', icon: Cloud, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40' },
  choice: { label: 'Választás', icon: CheckSquare, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
  text: { label: 'Rövid szöveg', icon: MessageSquare, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
  rating: { label: 'Pontozás', icon: Star, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
  points100: { label: '100 pont', icon: Sliders, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
  grid2x2: { label: '2x2 Rács', icon: Grid, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' }
};

export default function AdminView() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [questions, setQuestions] = useState([]);
  const [session, setSession] = useState(null);
  const [activeResponsesCount, setActiveResponsesCount] = useState(0);

  // New question form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('wordcloud');
  const [newOptions, setNewOptions] = useState(['', '']);
  const [newScaleMax, setNewScaleMax] = useState(5);
  const [newAxisX, setNewAxisX] = useState('Ráfordítás (Alacsony → Magas)');
  const [newAxisY, setNewAxisY] = useState('Várható hatás (Kicsi → Óriási)');

  // Auth observer
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Listen to questions list
  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    const unsub = onSnapshot(collection(db, 'questions'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setQuestions(list);
    });

    return () => unsub();
  }, [user]);

  // Listen to active session
  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    const unsub = onSnapshot(doc(db, 'sessions', 'active'), (snap) => {
      setSession(snap.exists() ? snap.data() : null);
    });

    return () => unsub();
  }, [user]);

  // Count responses for active question
  useEffect(() => {
    const qId = session?.activeQuestion?.id;
    if (!qId) {
      setActiveResponsesCount(0);
      return;
    }

    const q = query(collection(db, 'responses'), where('questionId', '==', qId));
    const unsub = onSnapshot(q, (snap) => {
      setActiveResponsesCount(snap.size);
    });

    return () => unsub();
  }, [session?.activeQuestion?.id]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Login error:', err);
      alert('Hiba történt a Google bejelentkezés során: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleLaunchQuestion = async (q) => {
    try {
      await setDoc(doc(db, 'sessions', 'active'), {
        activeQuestion: q,
        votingOpen: true,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
      alert('Nem sikerült elindítani a kérdést.');
    }
  };

  const handleStopQuestion = async () => {
    try {
      await setDoc(doc(db, 'sessions', 'active'), {
        activeQuestion: null,
        votingOpen: false,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVoting = async () => {
    if (!session?.activeQuestion) return;
    try {
      await setDoc(
        doc(db, 'sessions', 'active'),
        { votingOpen: !session.votingOpen },
        { merge: true }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetResponses = async () => {
    const qId = session?.activeQuestion?.id;
    if (!qId) return;

    if (!confirm('Biztosan törölni szeretnéd a jelenlegi kérdésre érkezett összes szavazatot?')) {
      return;
    }

    try {
      const q = query(collection(db, 'responses'), where('questionId', '==', qId));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      alert('Válaszok sikeresen törölve.');
    } catch (err) {
      console.error(err);
      alert('Hiba a válaszok törlése során.');
    }
  };

  const handleAddSampleQuestions = async () => {
    try {
      for (const sample of SAMPLE_QUESTIONS) {
        await addDoc(collection(db, 'questions'), {
          ...sample,
          createdAt: serverTimestamp()
        });
      }
      alert('6 minta kérdés sikeresen hozzáadva!');
    } catch (err) {
      console.error(err);
      alert('Hiba a minta kérdések hozzáadásakor.');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Biztosan törlöd ezt a kérdést?')) return;
    try {
      await deleteDoc(doc(db, 'questions', id));
      if (session?.activeQuestion?.id === id) {
        await handleStopQuestion();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const qData = {
        title: newTitle.trim(),
        description: newDesc.trim(),
        type: newType,
        createdAt: serverTimestamp()
      };

      if (newType === 'choice' || newType === 'points100') {
        qData.options = newOptions.map(o => o.trim()).filter(Boolean);
        if (qData.options.length < 2) {
          alert('Legalább 2 opciót meg kell adni!');
          return;
        }
      }

      if (newType === 'rating') {
        qData.scaleMax = Number(newScaleMax) || 5;
      }

      if (newType === 'grid2x2') {
        qData.axisX = newAxisX.trim() || 'X tengely';
        qData.axisY = newAxisY.trim() || 'Y tengely';
      }

      await addDoc(collection(db, 'questions'), qData);

      // Reset form
      setNewTitle('');
      setNewDesc('');
      setNewType('wordcloud');
      setNewOptions(['', '']);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert('Hiba az új kérdés mentésekor: ' + err.message);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-2xl mx-auto flex items-center justify-center">
            <LogIn className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Adminisztrátori belépés</h1>
            <p className="text-slate-400 text-sm mt-1">
              Jelentkezz be a Google fiókoddal a kérdések kezeléséhez és az előadás indításához.
            </p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <LogIn className="w-5 h-5" />
            Bejelentkezés Google fiókkal
          </button>
        </div>
      </div>
    );
  }

  // Logged in with different email
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Hozzáférés megtagadva</h1>
            <p className="text-slate-400 text-sm mt-2">
              Bejelentkezve mint: <strong className="text-rose-300">{user.email}</strong>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Az adminisztrációs felületet kizárólag a <strong>{ADMIN_EMAIL}</strong> fiók kezelheti.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Kijelentkezés és belépés másikkal
          </button>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  const activeQ = session?.activeQuestion;
  const isVotingOpen = session?.votingOpen ?? true;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="p-4 sm:px-8 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg">
            V
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">Vélemény Vezérlőpult</h1>
            <p className="text-xs text-slate-400">Admin: {user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#/present"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Kivetítő megnyitása
          </a>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Kijelentkezés"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-8 flex-1">
        {/* Live Presentation Control Card */}
        <section className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Élőben kivetített kérdés
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                {activeQ ? activeQ.title : 'Nincs aktív kérdés indítva'}
              </h2>
            </div>

            {activeQ && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-indigo-300">
                  {activeResponsesCount} beérkezett válasz
                </span>
              </div>
            )}
          </div>

          {activeQ ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleToggleVoting}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                  isVotingOpen
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
              >
                {isVotingOpen ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                {isVotingOpen ? 'Szavazás lezárása' : 'Szavazás megnyitása'}
              </button>

              <button
                onClick={handleResetResponses}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Válaszok törlése
              </button>

              <button
                onClick={handleStopQuestion}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-sm font-semibold transition cursor-pointer ml-auto"
              >
                <Square className="w-4 h-4" />
                Kérdés leállítása
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Válassz ki egy kérdést az alábbi listából, és kattints az <strong>„Indítás”</strong> gombra a szavazás elindításához.
            </p>
          )}
        </section>

        {/* Questions Management */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Kérdések ({questions.length})</h2>
              <p className="text-sm text-slate-400">Készíts előre kérdéssort vagy indíts el egyet.</p>
            </div>

            <div className="flex items-center gap-2">
              {questions.length === 0 && (
                <button
                  onClick={handleAddSampleQuestions}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Minta kérdések betöltése
                </button>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Új kérdés
              </button>
            </div>
          </div>

          {/* List of questions */}
          <div className="grid grid-cols-1 gap-3">
            {questions.map((q) => {
              const isRunning = activeQ?.id === q.id;
              const typeMeta = TYPE_CONFIG[q.type] || TYPE_CONFIG.wordcloud;
              const TypeIcon = typeMeta.icon;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isRunning
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold ${typeMeta.color}`}>
                        <TypeIcon className="w-3.5 h-3.5" />
                        {typeMeta.label}
                      </span>
                      {isRunning && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                          ÉLŐBEN MEGY
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white">{q.title}</h3>
                    {q.description && (
                      <p className="text-xs text-slate-400">{q.description}</p>
                    )}
                    {q.options && q.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {q.options.map((opt, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs">
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isRunning ? (
                      <button
                        onClick={handleStopQuestion}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-600/30 transition cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5" />
                        Leállítás
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLaunchQuestion(q)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Indítás
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      title="Kérdés törlése"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Add Question Modal */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl my-8"
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Új kérdés létrehozása</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Kérdés típusa
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([typeKey, cfg]) => {
                    const Icon = cfg.icon;
                    const isSelected = newType === typeKey;
                    return (
                      <button
                        type="button"
                        key={typeKey}
                        onClick={() => setNewType(typeKey)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Kérdés szövege *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="pl. Mi a három szó, ami eszedbe jut róla?"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Rövid leírás / Instrukció (opcionális)
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="pl. Írd be a kifejezéseket a mezőkbe"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Extra inputs for Choice or 100 points */}
              {(newType === 'choice' || newType === 'points100') && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Válaszlehetőségek
                  </label>
                  {newOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[i] = e.target.value;
                          setNewOptions(updated);
                        }}
                        placeholder={`${String.fromCharCode(65 + i)} opció`}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
                      />
                      {newOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setNewOptions(newOptions.filter((_, idx) => idx !== i))}
                          className="px-3 rounded-xl bg-slate-800 text-rose-400 hover:bg-slate-700 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewOptions([...newOptions, ''])}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 py-1 flex items-center gap-1 cursor-pointer"
                  >
                    + További opció hozzáadása
                  </button>
                </div>
              )}

              {/* Extra input for Rating */}
              {newType === 'rating' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Skála maximuma
                  </label>
                  <select
                    value={newScaleMax}
                    onChange={(e) => setNewScaleMax(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none"
                  >
                    <option value={5}>1 - 5 skála (Csillagok)</option>
                    <option value={10}>1 - 10 skála</option>
                  </select>
                </div>
              )}

              {/* Extra input for Grid 2x2 */}
              {newType === 'grid2x2' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Vízszintes (X) tengely felirata
                    </label>
                    <input
                      type="text"
                      value={newAxisX}
                      onChange={(e) => setNewAxisX(e.target.value)}
                      placeholder="pl. Ráfordítás (Alacsony → Magas)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Függőleges (Y) tengely felirata
                    </label>
                    <input
                      type="text"
                      value={newAxisY}
                      onChange={(e) => setNewAxisY(e.target.value)}
                      placeholder="pl. Várható hatás (Kicsi → Óriási)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm cursor-pointer"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Kérdés mentése
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
