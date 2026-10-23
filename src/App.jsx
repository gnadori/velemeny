import React, { useState, useEffect } from 'react';
import ParticipantView from './views/ParticipantView';
import PresenterView from './views/PresenterView';
import AdminView from './views/AdminView';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    const hash = window.location.hash;
    if (hash.includes('admin')) return 'admin';
    if (hash.includes('present')) return 'present';
    return 'participant';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('admin')) {
        setCurrentRoute('admin');
      } else if (hash.includes('present')) {
        setCurrentRoute('present');
      } else {
        setCurrentRoute('participant');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#09090b]">
      {/* Minimalist View Switcher */}
      <nav className="fixed bottom-4 right-4 z-50 flex items-center gap-1 p-1 bg-neutral-950/90 border border-neutral-800 shadow-2xl font-technical text-[10px] tracking-[0.15em] uppercase">
        <a
          href="#/"
          className={`px-3 py-1.5 transition ${
            currentRoute === 'participant'
              ? 'bg-white text-black font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          [ RÉSZTVEVŐ ]
        </a>
        <a
          href="#/present"
          className={`px-3 py-1.5 transition ${
            currentRoute === 'present'
              ? 'bg-white text-black font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          [ KIVETÍTŐ ]
        </a>
        <a
          href="#/admin"
          className={`px-3 py-1.5 transition ${
            currentRoute === 'admin'
              ? 'bg-white text-black font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          [ ADMIN ]
        </a>
      </nav>

      {/* Render View */}
      {currentRoute === 'participant' && <ParticipantView />}
      {currentRoute === 'present' && <PresenterView />}
      {currentRoute === 'admin' && <AdminView />}
    </div>
  );
}
