import React from 'react';
import { AlertTriangle, Lock, Sparkles, X, LogIn, UserPlus } from 'lucide-react';

export default function GuestModal({ isOpen, onClose, onOpenAuthModal }) {
  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    onOpenAuthModal('login');
  };

  const handleRegister = () => {
    onClose();
    onOpenAuthModal('register');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-md">
      <div
        className="glass-card max-w-md w-full rounded-2xl p-6 relative flex flex-col items-center text-center gap-4"
        style={{
          border: '1px solid rgba(245,158,11,0.3)',
          boxShadow: '0 0 30px rgba(245,158,11,0.15)',
          animation: 'modalSlideIn 0.25s ease-out forwards',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 mt-2">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white tracking-tight">
            Guest Limit Reached
          </h3>
          <p className="text-sm text-slate-300">
            You've used all 3 free guest searches. Sign in or create a free account to unlock{' '}
            <span className="text-primary font-bold">Unlimited AI Checks</span> and full search history tracking!
          </p>
        </div>

        <div className="w-full bg-background-dark/60 rounded-xl p-4 border border-glass-border flex flex-col gap-2 text-xs text-slate-400 text-left">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <Sparkles className="w-4 h-4 text-primary" />
            Why Sign In?
          </div>
          <p>• Save search history permanently across devices</p>
          <p>• Access deep Groq AI fact-check summaries</p>
          <p>• View full source credibility metrics and evidence snippets</p>
          <p>• Free forever — no credit card required</p>
        </div>

        <div className="flex gap-3 w-full mt-1">
          <button
            onClick={handleSignIn}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-primary/40 text-primary font-bold text-sm hover:bg-primary/10 hover:border-primary/70 transition-all duration-200"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            onClick={handleRegister}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-background-dark transition-all duration-200 hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #0dccf2, #38ef7d)',
              boxShadow: '0 4px 16px rgba(13,204,242,0.25)',
            }}
          >
            <UserPlus className="w-4 h-4" />
            Register Free
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}
