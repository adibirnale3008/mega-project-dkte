import React, { useEffect } from 'react';
import { ShieldCheck, LogOut, Search, History as HistoryIcon, Sparkles, LogIn, Home, UserPlus } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, setUser, onOpenAuthModal }) {
  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 glass-card border-x-0 border-t-0 border-b border-violet-100/80 px-4 md:px-10 py-3 flex items-center justify-between bg-white/90 backdrop-blur-md shadow-sm">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-violet-100 border border-violet-200 group-hover:bg-violet-600 group-hover:border-violet-600 transition-all duration-300 shadow-sm">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-violet-700 group-hover:text-white transition-colors" />
          </div>
          <h1 className="text-slate-900 text-lg sm:text-xl md:text-2xl font-black tracking-tight">
            Verifi<span className="text-gradient">AI</span>
          </h1>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setActiveTab('landing')}
            className={`flex items-center gap-2 text-xs sm:text-sm font-bold transition-all px-3.5 py-2 rounded-xl ${
              activeTab === 'landing'
                ? 'text-violet-800 bg-violet-100/90 border border-violet-200 shadow-sm'
                : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50/60'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('detector')}
            className={`flex items-center gap-2 text-xs sm:text-sm font-bold transition-all px-3.5 py-2 rounded-xl ${
              activeTab === 'detector'
                ? 'text-violet-800 bg-violet-100/90 border border-violet-200 shadow-sm'
                : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span>AI Detector</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 text-xs sm:text-sm font-bold transition-all px-3.5 py-2 rounded-xl ${
              activeTab === 'history'
                ? 'text-violet-800 bg-violet-100/90 border border-violet-200 shadow-sm'
                : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50/60'
            }`}
          >
            <HistoryIcon className="w-4 h-4" />
            <span>History</span>
          </button>
        </nav>

        {/* User Auth Section */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-violet-100">
            <img
              src={user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=ffffff&bold=true&size=80`}
              alt={user.name}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-violet-400 object-cover shadow-sm"
            />
            <div className="hidden lg:flex flex-col leading-tight">
              <span className="text-xs font-bold text-slate-800 max-w-[110px] truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-violet-600 font-semibold uppercase tracking-wider">
                {user.auth_provider === 'google' ? 'Google' : 'User'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-xs text-rose-600 hover:text-rose-700 font-bold p-2 rounded-xl hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-violet-100">
            <button
              id="navbar-signin-btn"
              onClick={() => onOpenAuthModal('login')}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-violet-200 text-violet-700 bg-violet-50/60 hover:bg-violet-100 transition-all shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              id="navbar-register-btn"
              onClick={() => onOpenAuthModal('register')}
              className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl btn-violet shadow-violet-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Visible < 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-violet-100 py-2 px-4 shadow-[0_-4px_20px_rgba(124,58,237,0.1)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('landing')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'landing'
                ? 'text-violet-700 font-bold'
                : 'text-slate-500 hover:text-violet-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('detector')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'detector'
                ? 'text-violet-700 font-bold'
                : 'text-slate-500 hover:text-violet-600'
            }`}
          >
            <Sparkles className="w-5 h-5 text-violet-600" />
            <span className="text-[10px]">AI Detector</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'history'
                ? 'text-violet-700 font-bold'
                : 'text-slate-500 hover:text-violet-600'
            }`}
          >
            <HistoryIcon className="w-5 h-5" />
            <span className="text-[10px]">History</span>
          </button>
        </div>
      </div>
    </>
  );
}
