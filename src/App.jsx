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
    <div className="min-h-screen bg-[#09090b]">
      {currentRoute === 'participant' && <ParticipantView />}
      {currentRoute === 'present' && <PresenterView />}
      {currentRoute === 'admin' && <AdminView />}
    </div>
  );
}
