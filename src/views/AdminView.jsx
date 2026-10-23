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

const TYPE_CONFIG = {
  wordcloud: { label: 'SZÓFELHŐ', code: '01' },
  choice: { label: 'VÁLASZTÁS', code: '02' },
  text: { label: 'RÖVID SZÖVEG', code: '03' },
  rating: { label: 'PONTOZÁS', code: '04' },
  points100: { label: '100 PONT', code: '05' },
  grid2x2: { label: '2X2 RÁCS', code: '06' }
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
    } catch (err) {
      console.error(err);
      alert('Hiba a minta kérdések hozzáadásakor.');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Biztosan törlöd ezt a kérdést az archívumból?')) return;
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
          alert('Legalább 2 opciót meg kell adni.');
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
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-neutral-400 font-technical text-xs tracking-[0.25em] uppercase">
        <span>[ AZONOSÍTÁS FOLYAMATBAN... ]</span>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] text-neutral-200 bg-grid-technical flex flex-col justify-center items-center p-6">
        <div className="max-w-md w-full border border-neutral-800 bg-neutral-950/80 p-10 text-center space-y-8 shadow-2xl relative">
          <div className="font-technical text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            [ KONSZOL // HOZZÁFÉRÉS ]
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Kurátori belépés
            </h1>
            <p className="font-sans text-sm text-neutral-400 font-light mt-2">
              Jelentkezz be Google fiókoddal a prezentációk kezeléséhez.
            </p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-4 px-6 bg-white hover:bg-neutral-200 text-black font-technical text-xs uppercase tracking-[0.2em] font-bold transition cursor-pointer"
          >
            [ BELÉPÉS GOOGLE FIÓKKAL ]
          </button>
        </div>
      </div>
    );
  }

  // Different email logged in
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-[#09090b] text-neutral-200 bg-grid-technical flex flex-col justify-center items-center p-6">
        <div className="max-w-md w-full border border-red-900/50 bg-neutral-950/90 p-10 text-center space-y-6 shadow-2xl">
          <div className="font-technical text-[10px] uppercase tracking-[0.3em] text-red-400">
            [ HOZZÁFÉRÉS // MEGTAKADVA ]
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Jogosulatlan azonosító
            </h1>
            <p className="font-technical text-xs text-neutral-400 mt-2">
              Aktív profil: <span className="text-white">{user.email}</span>
            </p>
            <p className="font-technical text-[10px] text-neutral-500 uppercase tracking-widest mt-3">
              Kizárólag: {ADMIN_EMAIL}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-3 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-technical text-xs uppercase tracking-widest cursor-pointer"
          >
            [ KIJELENTKEZÉS ÉS VÁLTÁS ]
          </button>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  const activeQ = session?.activeQuestion;
  const isVotingOpen = session?.votingOpen ?? true;

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 bg-grid-technical flex flex-col">
      {/* Top Header */}
      <header className="px-6 py-4 sm:px-12 border-b border-neutral-900 bg-neutral-950/70 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-baseline gap-4">
          <span className="text-xl font-bold tracking-tight text-white">
            Vélemény
          </span>
          <span className="font-technical text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            [ VEZÉRLŐPULT // {user.email} ]
          </span>
        </div>

        <div className="flex items-center gap-4 font-technical text-xs">
          <a
            href="#/present"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 border border-neutral-700 hover:border-neutral-500 bg-neutral-900 text-neutral-200 transition text-[10px] uppercase tracking-wider"
          >
            [ KIVETÍTŐ MEGNYITÁSA ↗ ]
          </a>
          <button
            onClick={handleLogout}
            className="px-2.5 py-1.5 border border-neutral-800 hover:border-neutral-600 bg-neutral-900 text-neutral-400 hover:text-white transition cursor-pointer text-[10px] uppercase tracking-wider"
          >
            [ KILÉPÉS ]
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="p-6 sm:p-12 max-w-6xl w-full mx-auto space-y-10 flex-1">
        {/* Active Presentation Bar */}
        <section className="p-8 border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm space-y-6 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-4 pb-4 border-b border-neutral-900">
            <div>
              <span className="font-technical text-[10px] uppercase tracking-[0.25em] text-neutral-500 block">
                [ ÉLŐBEN KIVETÍTETT SZAKASZ ]
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                {activeQ ? activeQ.title : 'Jelenleg nincs aktív kérdés indítva'}
              </h2>
            </div>

            {activeQ && (
              <div className="font-technical text-xs text-neutral-300">
                [ {activeResponsesCount} BEÉRKEZETT VÁLASZ ]
              </div>
            )}
          </div>

          {activeQ ? (
            <div className="flex flex-wrap items-center gap-3 font-technical text-xs">
              <button
                onClick={handleToggleVoting}
                className="px-4 py-2.5 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 transition cursor-pointer uppercase tracking-wider"
              >
                {isVotingOpen ? '[ SZAVAZÁS LEZÁRÁSA ]' : '[ SZAVAZÁS MEGNYITÁSA ]'}
              </button>

              <button
                onClick={handleResetResponses}
                className="px-4 py-2.5 border border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white transition cursor-pointer uppercase tracking-wider"
              >
                [ VÁLASZOK NULLÁZÁSA ]
              </button>

              <button
                onClick={handleStopQuestion}
                className="px-4 py-2.5 border border-neutral-800 hover:border-red-800/80 bg-neutral-900 text-neutral-400 hover:text-red-400 transition cursor-pointer uppercase tracking-wider sm:ml-auto"
              >
                [ LEÁLLÍTÁS ]
              </button>
            </div>
          ) : (
            <p className="font-technical text-xs text-neutral-500 tracking-wider uppercase">
              Válassz egy kérdést a katalógusból és kattints az [ INDÍTÁS ] gombra.
            </p>
          )}
        </section>

        {/* Catalog */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-4 pb-4 border-b border-neutral-900">
            <div>
              <span className="font-technical text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                KATALÓGUS // {questions.length} TÉTEL
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Kérdésgyűjtemény</h2>
            </div>

            <div className="flex items-center gap-3 font-technical text-xs">
              {questions.length === 0 && (
                <button
                  onClick={handleAddSampleQuestions}
                  className="px-3.5 py-2 border border-neutral-700 hover:border-neutral-500 bg-neutral-900 text-neutral-200 uppercase tracking-wider cursor-pointer"
                >
                  [ MINTAKÉRDÉSEK BETÖLTÉSE ]
                </button>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-wider cursor-pointer"
              >
                [ + ÚJ KÉRDÉS ]
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {questions.map((q, idx) => {
              const isRunning = activeQ?.id === q.id;
              const typeMeta = TYPE_CONFIG[q.type] || TYPE_CONFIG.wordcloud;

              return (
                <div
                  key={q.id}
                  className={`p-6 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
                    isRunning
                      ? 'border-white bg-neutral-900/90'
                      : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3 font-technical text-[10px] text-neutral-500 uppercase tracking-widest">
                      <span>[ {String(idx + 1).padStart(2, '0')} ]</span>
                      <span>{typeMeta.label}</span>
                      {isRunning && (
                        <span className="text-white border border-white px-2 py-0.5">
                          [ AKTÍV VETÍTÉS ]
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {q.title}
                    </h3>
                    {q.description && (
                      <p className="font-sans text-xs text-neutral-400 font-light">{q.description}</p>
                    )}
                    {q.options && q.options.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1 font-technical text-[10px] text-neutral-400">
                        {q.options.map((opt, i) => (
                          <span key={i} className="border border-neutral-800 px-2 py-0.5">
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 font-technical text-xs self-end sm:self-center">
                    {isRunning ? (
                      <button
                        onClick={handleStopQuestion}
                        className="px-3.5 py-2 border border-neutral-600 hover:border-white text-white uppercase tracking-wider cursor-pointer"
                      >
                        [ LEÁLLÍTÁS ]
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLaunchQuestion(q)}
                        className="px-3.5 py-2 bg-neutral-800 hover:bg-white text-neutral-200 hover:text-black uppercase tracking-wider transition cursor-pointer"
                      >
                        [ INDÍTÁS ]
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="px-2.5 py-2 text-neutral-600 hover:text-red-400 transition cursor-pointer"
                      title="Törlés"
                    >
                      [ X ]
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
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-950 border border-neutral-800 p-8 max-w-lg w-full space-y-6 shadow-2xl my-8 relative"
          >
            <div className="flex justify-between items-center pb-4 border-b border-neutral-900 font-technical text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              <span>ÚJ TÉTEL HOZZÁADÁSA</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                [ X ]
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-5">
              <div>
                <label className="block font-technical text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2">
                  Típus kiválasztása
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([typeKey, cfg]) => {
                    const isSelected = newType === typeKey;
                    return (
                      <button
                        type="button"
                        key={typeKey}
                        onClick={() => setNewType(typeKey)}
                        className={`p-2.5 border font-technical text-[10px] uppercase tracking-wider transition cursor-pointer ${
                          isSelected
                            ? 'bg-white text-black border-white font-bold'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-technical text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">
                  Kérdés szövege *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="pl. Mi a három szó, ami eszedbe jut róla?"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-neutral-400 font-light text-sm"
                />
              </div>

              <div>
                <label className="block font-technical text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">
                  Rövid leírás (opcionális)
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="pl. Írd be a kifejezéseket a mezőkbe"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-neutral-400 font-light text-xs"
                />
              </div>

              {(newType === 'choice' || newType === 'points100') && (
                <div className="space-y-2">
                  <label className="block font-technical text-[10px] uppercase tracking-[0.2em] text-neutral-400">
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
                        placeholder={`[ ${String.fromCharCode(65 + i)} ] opció`}
                        className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 text-white font-light text-xs"
                      />
                      {newOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setNewOptions(newOptions.filter((_, idx) => idx !== i))}
                          className="px-3 border border-neutral-800 text-neutral-500 hover:text-red-400 cursor-pointer font-technical text-xs"
                        >
                          X
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewOptions([...newOptions, ''])}
                    className="font-technical text-[10px] text-neutral-400 hover:text-white uppercase tracking-wider py-1 cursor-pointer"
                  >
                    + TOVÁBBI OPCIÓ HOZZÁADÁSA
                  </button>
                </div>
              )}

              {newType === 'rating' && (
                <div>
                  <label className="block font-technical text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">
                    Skála maximuma
                  </label>
                  <select
                    value={newScaleMax}
                    onChange={(e) => setNewScaleMax(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white font-technical text-xs focus:outline-none"
                  >
                    <option value={5}>1 - 5 skála</option>
                    <option value={10}>1 - 10 skála</option>
                  </select>
                </div>
              )}

              {newType === 'grid2x2' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-technical text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">
                      Vízszintes (X) tengely
                    </label>
                    <input
                      type="text"
                      value={newAxisX}
                      onChange={(e) => setNewAxisX(e.target.value)}
                      placeholder="Ráfordítás (Alacsony → Magas)"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 text-white font-light text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-technical text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">
                      Függőleges (Y) tengely
                    </label>
                    <input
                      type="text"
                      value={newAxisY}
                      onChange={(e) => setNewAxisY(e.target.value)}
                      placeholder="Várható hatás (Kicsi → Óriási)"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 text-white font-light text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3 font-technical text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-neutral-400 cursor-pointer uppercase tracking-wider"
                >
                  [ MÉGSE ]
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-white hover:bg-neutral-200 text-black font-bold cursor-pointer uppercase tracking-wider"
                >
                  [ MENTÉS ]
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
