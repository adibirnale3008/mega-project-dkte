import React from 'react';
import { Lock, Sparkles, X, LogIn, UserPlus } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
      <div
        className="glass-card max-w-md w-full rounded-3xl p-7 relative flex flex-col items-center text-center gap-5 bg-white/95 border border-violet-200 shadow-violet-glow-lg"
        style={{
          animation: 'modalSlideIn 0.25s ease-out forwards',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-violet-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 rounded-2xl bg-amber-100 text-amber-700 border border-amber-200 mt-2 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Guest Search Limit Reached
          </h3>
          <p className="text-sm text-slate-600">
            You've used all 3 free guest searches. Sign in or create a free account to unlock{' '}
            <span className="text-violet-700 font-extrabold">Unlimited AI Checks</span> and full search history tracking!
          </p>
        </div>

        <div className="w-full bg-violet-50/70 rounded-2xl p-4 border border-violet-100 flex flex-col gap-2 text-xs text-slate-600 text-left">
          <div className="flex items-center gap-2 text-violet-800 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-violet-600" />
            Why Create an Account?
          </div>
          <p>• Save search history permanently across devices</p>
          <p>• Access deep Groq AI fact-check reasoning</p>
          <p>• View full source credibility metrics and citations</p>
          <p>• 100% Free forever — no credit card required</p>
        </div>

        <div className="flex gap-3 w-full pt-1">
          <button
            onClick={handleSignIn}
            className="flex-1 btn-violet-outline py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            onClick={handleRegister}
            className="flex-1 btn-violet py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-violet-sm"
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}
