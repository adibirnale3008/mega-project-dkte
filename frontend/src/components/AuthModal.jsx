import React, { useState, useEffect, useRef } from 'react';
import {
  X, Mail, Lock, User, Eye, EyeOff, ShieldCheck,
  Sparkles, AlertCircle, CheckCircle, ArrowRight, Loader2
} from 'lucide-react';

// ─── Google Sign-In Button Container ───────────────────────────────────────────
function GoogleSignInContainer({ onSuccess }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const renderBtn = () => {
      if (window.google?.accounts?.id && containerRef.current) {
        window.google.accounts.id.initialize({
          client_id: '122964210066-0tihuhdjrg1bpqhtesg8imias9c260e5.apps.googleusercontent.com',
          callback: async (googleRes) => {
            try {
              const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: googleRes.credential }),
                credentials: 'include',
              });
              const data = await response.json();
              if (response.ok && data.user) onSuccess(data.user);
            } catch (err) {
              console.error('Google Sign-In error:', err);
            }
          },
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          width: containerRef.current.offsetWidth || 340,
          logo_alignment: 'left',
        });
      }
    };
    const timer = setTimeout(renderBtn, 100);
    return () => clearTimeout(timer);
  }, [onSuccess]);

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center"
      style={{ minHeight: 44 }}
    />
  );
}

// ─── Input Field ───────────────────────────────────────────────────────────────
function InputField({ id, label, type = 'text', value, onChange, placeholder, icon: Icon, error, autoComplete }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-bold text-slate-700 uppercase tracking-wider">
        {label}
      </label>
      <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
        error
          ? 'border-red-500 bg-red-50/50'
          : 'border-violet-200 bg-white focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-200'
      }`}>
        {Icon && (
          <div className="pl-3.5 shrink-0 text-violet-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="pr-3.5 shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main AuthModal ────────────────────────────────────────────────────────────
export default function AuthModal({ isOpen, onClose, onSuccess, defaultTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regErrors, setRegErrors] = useState({});

  // Reset state when tab changes
  useEffect(() => {
    setGlobalError('');
    setSuccessMsg('');
    setLoginErrors({});
    setRegErrors({});
  }, [activeTab]);

  // Reset everything when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setGlobalError('');
      setSuccessMsg('');
      setLoginEmail('');
      setLoginPassword('');
      setLoginErrors({});
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirm('');
      setRegErrors({});
    }
  }, [isOpen, defaultTab]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ── Login Submit ──────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setSuccessMsg('');

    const errors = {};
    if (!loginEmail.trim()) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) errors.email = 'Enter a valid email.';
    if (!loginPassword) errors.password = 'Password is required.';
    if (Object.keys(errors).length) { setLoginErrors(errors); return; }
    setLoginErrors({});

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setSuccessMsg('Welcome back! Logging you in...');
        setTimeout(() => { onSuccess(data.user); onClose(); }, 800);
      } else {
        setGlobalError(data.error || 'Login failed. Please try again.');
      }
    } catch {
      setGlobalError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // ── Register Submit ───────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setSuccessMsg('');

    const errors = {};
    if (!regName.trim()) errors.name = 'Full name is required.';
    else if (regName.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
    if (!regEmail.trim()) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) errors.email = 'Enter a valid email.';
    if (!regPassword) errors.password = 'Password is required.';
    else if (regPassword.length < 6) errors.password = 'Password must be at least 6 characters.';
    if (!regConfirm) errors.confirm = 'Please confirm your password.';
    else if (regPassword !== regConfirm) errors.confirm = 'Passwords do not match.';
    if (Object.keys(errors).length) { setRegErrors(errors); return; }
    setRegErrors({});

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setSuccessMsg('Account created! Welcome to VerifiAI 🎉');
        setTimeout(() => { onSuccess(data.user); onClose(); }, 900);
      } else {
        setGlobalError(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setGlobalError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="glass-card w-full max-w-md rounded-3xl relative overflow-hidden bg-white/95 border border-violet-200/80 shadow-violet-glow-lg"
        style={{
          animation: 'modalSlideIn 0.25s ease-out forwards',
        }}
      >
        {/* Top gradient bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ background: 'linear-gradient(90deg, #7c3aed, #6366f1, #a855f7)' }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-xl hover:bg-violet-50"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex flex-col items-center gap-2 text-center">
          <div className="p-3.5 rounded-2xl bg-violet-100 border border-violet-200 text-violet-700 shadow-sm mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Verifi<span className="text-gradient">AI</span>
          </h2>
          <p className="text-xs text-slate-600 max-w-[280px]">
            Sign in to unlock unlimited AI fact-checks and full history tracking
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mx-6 mb-5 flex rounded-2xl p-1 bg-violet-50 border border-violet-100">
          {['login', 'register'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-600 hover:text-violet-700'
              }`}
            >
              {tab === 'login' ? 'Log In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Form Area */}
        <div className="px-6 pb-7 space-y-4">

          {/* Global feedback */}
          {globalError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{globalError}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── Login Form ── */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <InputField
                id="login-email"
                label="Email Address"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@example.com"
                icon={Mail}
                error={loginErrors.email}
                autoComplete="email"
              />
              <InputField
                id="login-password"
                label="Password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Your password"
                icon={Lock}
                error={loginErrors.password}
                autoComplete="current-password"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-violet py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-violet-glow"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Log In to Account</span> <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── Register Form ── */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5" noValidate>
              <InputField
                id="reg-name"
                label="Full Name"
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Your full name"
                icon={User}
                error={regErrors.name}
                autoComplete="name"
              />
              <InputField
                id="reg-email"
                label="Email Address"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="you@example.com"
                icon={Mail}
                error={regErrors.email}
                autoComplete="email"
              />
              <InputField
                id="reg-password"
                label="Password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Min. 6 characters"
                icon={Lock}
                error={regErrors.password}
                autoComplete="new-password"
              />
              <InputField
                id="reg-confirm"
                label="Confirm Password"
                type="password"
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                placeholder="Repeat your password"
                icon={Lock}
                error={regErrors.confirm}
                autoComplete="new-password"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-violet py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-violet-glow"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Create Free Account</span> <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-violet-100" />
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">or continue with</span>
            <div className="flex-1 h-px bg-violet-100" />
          </div>

          {/* Google Sign-In */}
          <GoogleSignInContainer onSuccess={(user) => { onSuccess(user); onClose(); }} />

          {/* Switch tab hint */}
          <p className="text-center text-xs text-slate-600 pt-1">
            {activeTab === 'login' ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => setActiveTab('register')} className="text-violet-700 font-extrabold hover:underline">
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => setActiveTab('login')} className="text-violet-700 font-extrabold hover:underline">
                  Log in
                </button>
              </>
            )}
          </p>
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
