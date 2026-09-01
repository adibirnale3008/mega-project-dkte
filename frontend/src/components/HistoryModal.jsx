import React from 'react';
import { X, CheckCircle2, AlertTriangle, Shield, Tag, Calendar, Cpu } from 'lucide-react';

export default function HistoryModal({ item, onClose }) {
  if (!item) return null;

  const isFake = item.prediction === 'Fake';
  const confidencePct = (item.confidence * 100).toFixed(1) + '%';
  const credVal = item.credibility_score || 50;

  let credColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
  let credLabel = 'High Credibility';
  if (credVal < 45) {
    credColor = 'text-rose-800 bg-rose-50 border-rose-200';
    credLabel = 'Low Credibility';
  } else if (credVal < 75) {
    credColor = 'text-amber-800 bg-amber-50 border-amber-200';
    credLabel = 'Moderate Credibility';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-2xl w-full rounded-3xl p-6 md:p-8 relative border border-violet-200 bg-white/95 shadow-violet-glow-lg flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-violet-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-100 text-violet-700">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Fact Check Record #{item.id}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-violet-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="modal-body-scroll py-4 space-y-6 flex-1 pr-2">
          {/* Claim Text */}
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-500 font-extrabold mb-1.5 block">
              Analyzed Text / Claim
            </label>
            <p className="text-sm md:text-base text-slate-900 bg-violet-50/50 p-4 rounded-2xl border border-violet-100 italic leading-relaxed font-medium">
              "{item.news_text}"
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Prediction */}
            <div className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center ${
              isFake ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <div className="flex items-center gap-1 font-black text-sm uppercase">
                {isFake ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {isFake ? 'FAKE' : 'REAL'}
              </div>
              <span className="text-[10px] uppercase text-slate-500 font-extrabold mt-1">Verdict</span>
            </div>

            {/* Confidence */}
            <div className="p-3.5 rounded-2xl border border-violet-100 bg-violet-50/40 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-black text-slate-900">{confidencePct}</span>
              <span className="text-[10px] uppercase text-slate-500 font-extrabold mt-1">AI Confidence</span>
            </div>

            {/* Credibility Score */}
            <div className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center ${credColor}`}>
              <span className="text-lg font-black">{credVal}/100</span>
              <span className="text-[10px] uppercase font-extrabold mt-1">{credLabel}</span>
            </div>

            {/* Category */}
            <div className="p-3.5 rounded-2xl border border-violet-100 bg-violet-50/40 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-extrabold text-violet-700 truncate max-w-[100px]">
                {item.claim_category || 'Other'}
              </span>
              <span className="text-[10px] uppercase text-slate-500 font-extrabold mt-1">Category</span>
            </div>
          </div>

          {/* AI Summary */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-violet-600" />
              <h4 className="text-xs uppercase tracking-wider text-slate-600 font-extrabold">
                AI Fact-Check Reasoning
              </h4>
            </div>
            <div className="text-sm text-slate-700 bg-violet-50/50 p-4 rounded-2xl border border-violet-100 whitespace-pre-wrap leading-relaxed font-medium">
              {item.ai_summary || "No detailed summary generated."}
            </div>
          </div>

          {/* Verification Status & Date */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-violet-100 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-violet-600" />
              <span>Status: <strong className="text-slate-900">{item.api_verification}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-violet-500" />
              <span>{new Date(item.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-violet-100 flex justify-end">
          <button
            onClick={onClose}
            className="btn-violet px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
