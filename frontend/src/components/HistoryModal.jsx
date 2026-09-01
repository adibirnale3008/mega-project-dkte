import React from 'react';
import { X, CheckCircle2, AlertTriangle, ExternalLink, Shield, Tag, Calendar, Cpu } from 'lucide-react';

export default function HistoryModal({ item, onClose }) {
  if (!item) return null;

  const isFake = item.prediction === 'Fake';
  const confidencePct = (item.confidence * 100).toFixed(1) + '%';
  const credVal = item.credibility_score || 50;

  let credColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  let credLabel = 'High Credibility';
  if (credVal < 45) {
    credColor = 'text-red-400 bg-red-500/10 border-red-500/30';
    credLabel = 'Low Credibility';
  } else if (credVal < 75) {
    credColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    credLabel = 'Moderate Credibility';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-2xl w-full rounded-2xl p-6 relative border border-glass-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-glass-border">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-white">Fact Check Record #{item.id}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="modal-body-scroll py-4 space-y-6 flex-1 pr-2">
          {/* Claim Text */}
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1 block">
              Analyzed Text / Claim
            </label>
            <p className="text-sm md:text-base text-slate-200 bg-background-dark/60 p-4 rounded-xl border border-glass-border italic leading-relaxed">
              "{item.news_text}"
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Prediction */}
            <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center ${
              isFake ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <div className="flex items-center gap-1 font-black text-sm uppercase">
                {isFake ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {isFake ? 'FAKE' : 'REAL'}
              </div>
              <span className="text-[10px] uppercase text-slate-400 font-bold mt-1">Verdict</span>
            </div>

            {/* Confidence */}
            <div className="p-3 rounded-xl border border-glass-border bg-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-black text-white">{confidencePct}</span>
              <span className="text-[10px] uppercase text-slate-400 font-bold mt-1">AI Confidence</span>
            </div>

            {/* Credibility Score */}
            <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center ${credColor}`}>
              <span className="text-lg font-black">{credVal}/100</span>
              <span className="text-[10px] uppercase font-bold mt-1">{credLabel}</span>
            </div>

            {/* Category */}
            <div className="p-3 rounded-xl border border-glass-border bg-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-bold text-primary truncate max-w-[100px]">
                {item.claim_category || 'Other'}
              </span>
              <span className="text-[10px] uppercase text-slate-400 font-bold mt-1">Category</span>
            </div>
          </div>

          {/* AI Summary */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-primary" />
              <h4 className="text-xs uppercase tracking-wider text-slate-300 font-bold">
                AI Fact-Check Reasoning
              </h4>
            </div>
            <div className="text-sm text-slate-300 bg-background-dark/40 p-4 rounded-xl border border-glass-border whitespace-pre-wrap leading-relaxed">
              {item.ai_summary || "No detailed summary generated."}
            </div>
          </div>

          {/* Verification Status & Date */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-glass-border text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary" />
              <span>Status: <strong className="text-slate-200">{item.api_verification}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(item.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-glass-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
