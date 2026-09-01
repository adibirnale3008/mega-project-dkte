import React, { useEffect } from 'react';
import { ShieldCheck, LogOut, Search, History as HistoryIcon, Sparkles, LogIn } from 'lucide-react';

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
    <header className="sticky top-0 z-50 glass-card border-x-0 border-t-0 border-b border-glass-border px-4 md:px-12 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <div
        onClick={() => setActiveTab('detector')}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:border-primary/50 transition-all">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-white text-xl md:text-2xl font-black tracking-tight">
          Verifi<span className="text-primary">AI</span>
        </h1>
      </div>

      {/* Nav Tabs */}
      <nav className="flex items-center gap-6">
        <button
          onClick={() => setActiveTab('detector')}
          className={`flex items-center gap-2 text-sm font-semibold transition-all px-3 py-1.5 rounded-lg ${
            activeTab === 'detector'
              ? 'text-primary bg-primary/10 border border-primary/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Detector
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 text-sm font-semibold transition-all px-3 py-1.5 rounded-lg ${
            activeTab === 'history'
              ? 'text-primary bg-primary/10 border border-primary/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HistoryIcon className="w-4 h-4" />
          History
        </button>

        {/* User Auth Section */}
        {user ? (
          <div className="flex items-center gap-3 pl-4 border-l border-glass-border">
            <img
              src={user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0dccf2&color=101f22&bold=true&size=80`}
              alt={user.name}
              className="w-9 h-9 rounded-full border border-primary/40 object-cover"
            />
            <div className="hidden lg:flex flex-col leading-tight">
              <span className="text-sm font-bold text-slate-200 max-w-[120px] truncate">
                {user.name}
              </span>
              {user.auth_provider === 'local' && (
                <span className="text-[10px] text-primary/60 font-medium uppercase tracking-wider">Email</span>
              )}
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider p-1.5 rounded hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-4 border-l border-glass-border">
            <button
              id="navbar-signin-btn"
              onClick={() => onOpenAuthModal('login')}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all duration-200"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              id="navbar-register-btn"
              onClick={() => onOpenAuthModal('register')}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl text-background-dark transition-all duration-200 hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #0dccf2, #38ef7d)',
                boxShadow: '0 2px 16px rgba(13,204,242,0.25)',
              }}
            >
              <Sparkles className="w-4 h-4" />
              Register
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
