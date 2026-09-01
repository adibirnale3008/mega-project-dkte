import React from 'react';
import { 
  ShieldCheck, Sparkles, Wand2, Search, ArrowRight, Zap, CheckCircle2, 
  ScanText, BarChart3, Lock, Globe, Cpu, UserPlus, LogIn, FileImage, ShieldAlert
} from 'lucide-react';

export default function LandingPage({ onNavigateDetector, onOpenAuthModal, user }) {
  return (
    <div className="space-y-16 pb-12">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-6 pb-12 overflow-hidden text-center max-w-4xl mx-auto px-4">
        {/* Soft Background Orbs */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-300/30 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100/80 border border-violet-200 text-violet-800 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
          <span>VerifiAI 2.0 — Powered by Machine Learning &amp; Groq AI LLMs</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
          Verify News Credibility &amp; <br className="hidden sm:inline" />
          <span className="text-gradient">Stop Misinformation</span> with AI
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Instantly analyze news articles, physical newspaper clippings, and viral headlines. 
          Combines <strong className="text-violet-700 font-semibold">Python Scikit-Learn ML</strong>, 
          <strong className="text-violet-700 font-semibold"> Groq AI reasoning</strong>, and 
          <strong className="text-violet-700 font-semibold"> NewsAPI cross-referencing</strong>.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onNavigateDetector}
            className="btn-violet w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 shadow-violet-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Wand2 className="w-5 h-5" />
            <span>Analyze News Article Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!user ? (
            <button
              onClick={() => onOpenAuthModal('register')}
              className="btn-violet-outline w-full sm:w-auto px-7 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 hover:shadow-card-soft"
            >
              <UserPlus className="w-5 h-5 text-violet-600" />
              <span>Create Free Account</span>
            </button>
          ) : (
            <button
              onClick={onNavigateDetector}
              className="btn-violet-outline w-full sm:w-auto px-7 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:shadow-card-soft"
            >
              <CheckCircle2 className="w-5 h-5 text-violet-600" />
              <span>Welcome Back, {user.name.split(' ')[0]}</span>
            </button>
          )}
        </div>

        {/* Small Trust Badges */}
        <div className="mt-8 pt-6 border-t border-violet-100 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Instant Inference (&lt; 2s)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Newspaper OCR Scan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Source Citations Included</span>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Prediction Model', val: 'Scikit-Learn', sub: 'TF-IDF Vectorization' },
          { label: 'LLM Verification', val: 'Groq AI', sub: 'High-speed reasoning' },
          { label: 'Domain Coverage', val: '100+ Outlets', sub: 'Reuters, BBC, HT, TOI' },
          { label: 'Credibility Rating', val: '0 — 100 Index', sub: 'Multi-factor score' },
        ].map((stat, i) => (
          <div key={i} className="glass-card glass-card-hover p-6 rounded-2xl text-center border border-violet-100/80 bg-white/90">
            <div className="text-xl sm:text-2xl font-black text-violet-700 mb-1">{stat.val}</div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">{stat.label}</div>
            <div className="text-[11px] text-slate-500 mt-1">{stat.sub}</div>
          </div>
        ))}
      </section>

      {/* --- CORE FEATURES GRID --- */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Verification <span className="text-gradient">Engine</span>
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Everything you need to distinguish authentic journalistic reporting from viral clickbait and fake news claims.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card glass-card-hover p-8 rounded-2xl border border-violet-100 bg-white/90 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Machine Learning NLP</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Trained Scikit-Learn Logistic Regression model analyzing ngram lexical patterns and TF-IDF feature vectors to output immediate probabilities.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card glass-card-hover p-8 rounded-2xl border border-violet-100 bg-white/90 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Groq AI Fact-Checking</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              High-speed LLMs evaluate claim logic, extract verified quotes, generate concise summaries, and provide direct news source citations.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card glass-card-hover p-8 rounded-2xl border border-violet-100 bg-white/90 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ScanText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Newspaper OCR Reader</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload physical newspaper clippings or screenshot images. Tesseract OCR and AI Vision extract printed article headlines automatically.
            </p>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (STEP BY STEP) --- */}
      <section className="glass-card p-8 sm:p-12 rounded-3xl border border-violet-200/80 bg-gradient-to-br from-white via-violet-50/40 to-indigo-50/30 relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-100 px-3 py-1 rounded-full">
              4-Step Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">How VerifiAI Detects Fake News</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                step: '01',
                title: 'Submit Claim or Upload Image',
                desc: 'Paste a news headline, full article text, or upload a newspaper clipping image file.'
              },
              {
                step: '02',
                title: 'NLP & ML Classification',
                desc: 'Text is tokenized, stripped of stopwords, and passed through TF-IDF Logistic Regression.'
              },
              {
                step: '03',
                title: 'Live NewsAPI & Groq Analysis',
                desc: 'Cross-checks trusted domains (BBC, Reuters, HT) and runs LLM reasoning with citations.'
              },
              {
                step: '04',
                title: 'Credibility Score & Report',
                desc: 'Outputs a 0-100 Credibility Score, Manipulation Risk level, and detailed AI explanation.'
              }
            ].map((s, idx) => (
              <div key={idx} className="bg-white/90 p-6 rounded-2xl border border-violet-100 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-violet-sm">
                  {s.step}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{s.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="glass-card p-10 rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white text-center shadow-violet-glow relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Ready to Fact-Check Any News Story?
          </h2>
          <p className="text-violet-100 text-sm sm:text-base leading-relaxed">
            Get instant authenticity ratings, detailed reasoning summaries, and multi-source credibility scores.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onNavigateDetector}
              className="bg-white text-violet-800 hover:bg-violet-50 font-extrabold px-8 py-4 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Wand2 className="w-5 h-5 text-violet-700" />
              <span>Launch Detector Now</span>
            </button>
            {!user && (
              <button
                onClick={() => onOpenAuthModal('register')}
                className="bg-violet-800/60 hover:bg-violet-800 text-white border border-violet-300/40 font-bold px-7 py-4 rounded-xl transition-all"
              >
                Create Account
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
