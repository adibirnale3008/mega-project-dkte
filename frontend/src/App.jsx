import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Detector from './components/Detector';
import History from './components/History';
import GuestModal from './components/GuestModal';
import HistoryModal from './components/HistoryModal';
import AuthModal from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('detector');
  const [user, setUser] = useState(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState('login');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const openAuthModal = (tab = 'login') => {
    setAuthDefaultTab(tab);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 flex flex-col selection:bg-primary selection:text-background-dark">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        setUser={setUser}
        onOpenAuthModal={openAuthModal}
      />

      {/* Main Page Area */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8">
        {activeTab === 'detector' && (
          <Detector
            user={user}
            onRequestGuestModal={() => setShowGuestModal(true)}
          />
        )}

        {activeTab === 'history' && (
          <History
            user={user}
            onSelectItem={(item) => setSelectedHistoryItem(item)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="glass-card border-x-0 border-b-0 border-t border-glass-border py-6 text-center text-xs text-slate-500">
        <p>© 2026 VerifiAI — AI-Powered Fake News Detection &amp; Credibility Verification System</p>
      </footer>

      {/* Modals */}
      <GuestModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onOpenAuthModal={openAuthModal}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(userData) => setUser(userData)}
        defaultTab={authDefaultTab}
      />

      <HistoryModal
        item={selectedHistoryItem}
        onClose={() => setSelectedHistoryItem(null)}
      />
    </div>
  );
}
