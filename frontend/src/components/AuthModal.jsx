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
          theme: 'filled_black',
          size: 'large',
          shape: 'rectangular',
          width: containerRef.current.offsetWidth || 340,
          logo_alignment: 'left',
        });
      }
    };
    // Wait a tick for the modal to mount fully
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
      <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
        error
          ? 'border-red-500/60 bg-red-500/5'
          : 'border-glass-border bg-white/[0.04] focus-within:border-primary/50 focus-within:bg-primary/5'
      }`}>
        {Icon && (
          <div className="pl-3.5 shrink-0 text-slate-500">
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
          className="w-full bg-transparent px-3 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="pr-3.5 shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
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

    // Client-side validation
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

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10, 18, 20, 0.85)', backdropFilter: 'blur(16px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="glass-card w-full max-w-md rounded-2xl relative overflow-hidden"
        style={{
          border: '1px solid rgba(13,204,242,0.18)',
          boxShadow: '0 0 60px rgba(13,204,242,0.12), 0 32px 64px rgba(0,0,0,0.5)',
          animation: 'modalSlideIn 0.25s ease-out forwards',
        }}
      >
        {/* Top gradient bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #0dccf2, #38ef7d, #0dccf2)' }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-6 pt-7 pb-5 flex flex-col items-center gap-2 text-center">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-1">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Verifi<span className="text-primary">AI</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-[260px]">
            Sign in to unlock unlimited AI fact-checks and full history tracking
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mx-6 mb-5 flex rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {['login', 'register'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'bg-primary text-background-dark shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'login' ? 'Log In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Form Area */}
        <div className="px-6 pb-6 space-y-4">

          {/* Global feedback */}
          {globalError && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{globalError}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 text-sm animate-fade-in">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── Login Form ── */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5" noValidate>
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
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-background-dark transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading ? '#0dccf2aa' : 'linear-gradient(135deg, #0dccf2, #38ef7d)',
                  boxShadow: loading ? 'none' : '0 4px 24px rgba(13,204,242,0.3)',
                }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Log In <ArrowRight className="w-4 h-4" />
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
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-background-dark transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading ? '#0dccf2aa' : 'linear-gradient(135deg, #0dccf2, #38ef7d)',
                  boxShadow: loading ? 'none' : '0 4px 24px rgba(13,204,242,0.3)',
                }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Create Account <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs text-slate-600 font-medium">or continue with</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Google Sign-In */}
          <GoogleSignInContainer onSuccess={(user) => { onSuccess(user); onClose(); }} />

          {/* Switch tab hint */}
          <p className="text-center text-xs text-slate-500 pt-1">
            {activeTab === 'login' ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => setActiveTab('register')} className="text-primary font-semibold hover:underline">
                  Register now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => setActiveTab('login')} className="text-primary font-semibold hover:underline">
                  Log in
                </button>
              </>
            )}
          </p>
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
