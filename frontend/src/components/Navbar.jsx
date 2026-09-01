import React, { useEffect } from 'react';
import { ShieldCheck, LogOut, Search, History as HistoryIcon, Sparkles, LogIn, Home, UserPlus } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, setUser, onOpenAuthModal }) {
  useEffect(() => {
    // Check if user is already logged in via cookie/session
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
    <header className="sticky top-0 z-50 glass-card border-x-0 border-t-0 border-b border-violet-100/80 px-4 md:px-10 py-3.5 flex items-center justify-between bg-white/85 backdrop-blur-md shadow-sm">
      {/* Brand Logo */}
      <div
        onClick={() => setActiveTab('landing')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="p-2 rounded-xl bg-violet-100 border border-violet-200 group-hover:bg-violet-600 group-hover:border-violet-600 transition-all duration-300 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-violet-700 group-hover:text-white transition-colors" />
        </div>
        <h1 className="text-slate-900 text-xl md:text-2xl font-black tracking-tight">
          Verifi<span className="text-gradient">AI</span>
        </h1>
      </div>

      {/* Nav Tabs */}
      <nav className="flex items-center gap-1.5 sm:gap-4">
        <button
          onClick={() => setActiveTab('landing')}
          className={`flex items-center gap-2 text-xs sm:text-sm font-bold transition-all px-3 sm:px-4 py-2 rounded-xl ${
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
          className={`flex items-center gap-2 text-xs sm:text-sm font-bold transition-all px-3 sm:px-4 py-2 rounded-xl ${
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
          className={`flex items-center gap-2 text-xs sm:text-sm font-bold transition-all px-3 sm:px-4 py-2 rounded-xl ${
            activeTab === 'history'
              ? 'text-violet-800 bg-violet-100/90 border border-violet-200 shadow-sm'
              : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50/60'
          }`}
        >
          <HistoryIcon className="w-4 h-4" />
          <span>History</span>
        </button>

        {/* User Auth Section */}
        {user ? (
          <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-violet-100">
            <img
              src={user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=ffffff&bold=true&size=80`}
              alt={user.name}
              className="w-9 h-9 rounded-full border-2 border-violet-400 object-cover shadow-sm"
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
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl border border-violet-200 text-violet-700 bg-violet-50/60 hover:bg-violet-100 transition-all shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              id="navbar-register-btn"
              onClick={() => onOpenAuthModal('register')}
              className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl btn-violet shadow-violet-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
