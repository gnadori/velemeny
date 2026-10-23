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
    <div className="relative min-h-screen">
      {/* Subtle Switcher for development & easy navigation */}
      <nav className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-2xl text-xs font-semibold text-slate-300">
        <a
          href="#/"
          className={`px-3 py-1.5 rounded-xl transition ${
            currentRoute === 'participant'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'hover:text-white hover:bg-slate-800'
          }`}
        >
          Résztvevő
        </a>
        <a
          href="#/present"
          className={`px-3 py-1.5 rounded-xl transition ${
            currentRoute === 'present'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'hover:text-white hover:bg-slate-800'
          }`}
        >
          Kivetítő
        </a>
        <a
          href="#/admin"
          className={`px-3 py-1.5 rounded-xl transition ${
            currentRoute === 'admin'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'hover:text-white hover:bg-slate-800'
          }`}
        >
          Admin
        </a>
      </nav>

      {/* Render View */}
      {currentRoute === 'participant' && <ParticipantView />}
      {currentRoute === 'present' && <PresenterView />}
      {currentRoute === 'admin' && <AdminView />}
    </div>
  );
}
