import React, { useState, useRef } from 'react';
import { 
  Wand2, Loader2, CheckCircle2, AlertTriangle, RefreshCw, Zap, 
  ShieldAlert, ShieldCheck, Quote, Link as LinkIcon, BookOpen, Sparkles,
  FileText, Image as ImageIcon, Upload, FileImage, ScanText, X, Edit3
} from 'lucide-react';
import { createWorker } from 'tesseract.js';

export default function Detector({ user, onRequestGuestModal }) {
  const [activeMode, setActiveMode] = useState('text'); // 'text' | 'image'
  const [text, setText] = useState('');
  
  // Image Upload & OCR States
  const [selectedImage, setSelectedImage] = useState(null); // File object
  const [imagePreview, setImagePreview] = useState(null); // base64 / blob URL
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [ocrEngineUsed, setOcrEngineUsed] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Analysis States
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // --- Image Handling & OCR Text Extraction ---
  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size exceeds 10MB limit.');
      return;
    }

    setError(null);
    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target.result;
      setImagePreview(base64Url);
      extractTextFromImage(base64Url, file);
    };
    reader.readAsDataURL(file);
  };

  const cleanExtractedText = (rawText) => {
    if (!rawText) return '';
    let cleaned = rawText.trim();
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
    if (cleaned.toLowerCase().includes('<think>')) {
      cleaned = cleaned.replace(/<think>[\s\S]*?(?=(?:\d+\.\s*\*\*|\*\*(?:Headline|Title|Body)|\"[A-Z]|[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4}:))/gi, '');
      cleaned = cleaned.replace(/^<think>[\s\S]*?(?="|[A-Z][a-z]+\s+(?:Was|Is|Are|Were|Announced|Launches|Reports|Claims))/gi, '');
      cleaned = cleaned.replace(/^<think>[\s\S]*?\n\n?/gi, '');
      cleaned = cleaned.replace(/^<think>[\s\S]*?:/gi, '');
      cleaned = cleaned.replace(/^<think>/gi, '');
    }
    cleaned = cleaned.replace(/^\s*\d+\.\s*\*\*(?:Identify\s+the\s+)?[^*]+\*\*:?\s*/gmi, '');
    cleaned = cleaned.replace(/\s*\d+\.\s*\*\*(?:Identify\s+the\s+)?[^*]+\*\*:?\s*/gmi, ' ');
    cleaned = cleaned.replace(/\*\*(?:Headline|Body|Body Text|Title|Text)\*\*:?\s*/gmi, '');
    cleaned = cleaned.replace(/^(?:Transcribed text|Here is the text extracted|Extracted text|The user wants the text[^\n.]*[\n.]):?\s*/gmi, '');
    cleaned = cleaned.replace(/"\s*"/g, ' ');
    cleaned = cleaned.replace(/^["“](.*)["”]$/s, '$1');
    return cleaned.trim();
  };

  const extractTextFromImage = async (base64Url, file) => {
    setOcrLoading(true);
    setOcrProgress(10);
    setOcrStatusText('Analyzing image & checking AI Vision...');
    setOcrEngineUsed('');

    let backendVisionSuccess = false;

    // 1. Try Backend AI Vision Extraction First (Gemini / Groq Vision)
    try {
      const res = await fetch('/api/extract-image-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Url }),
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const visionData = await res.json();
          if (visionData.status === 'success' && visionData.text) {
            setText(cleanExtractedText(visionData.text));
            setOcrEngineUsed(visionData.source || 'AI Vision');
            setOcrProgress(100);
            setOcrLoading(false);
            backendVisionSuccess = true;
            return;
          }
        }
      }
    } catch (visionErr) {
      console.warn('Backend AI Vision API skipped, falling back to local OCR:', visionErr.message);
    }

    if (backendVisionSuccess) return;

    // 2. Fallback to Client-side Tesseract.js OCR Engine
    try {
      setOcrStatusText('Initializing Tesseract OCR engine...');
      setOcrProgress(25);

      const loggerFn = (m) => {
        if (m.status === 'recognizing text') {
          const p = Math.round((m.progress || 0) * 100);
          setOcrProgress(25 + Math.round(p * 0.7));
          setOcrStatusText(`Reading printed text... ${p}%`);
        } else if (m.status === 'loading tesseract core') {
          setOcrStatusText('Loading OCR neural networks...');
        }
      };

      let worker;
      try {
        worker = await createWorker('eng', 1, { logger: loggerFn });
      } catch (wErr) {
        worker = await createWorker('eng', { logger: loggerFn });
      }

      const ret = await worker.recognize(file);
      await worker.terminate();

      const extracted = cleanExtractedText(ret.data.text);
      if (extracted && extracted.length > 5) {
        setText(extracted);
        setOcrEngineUsed('Tesseract OCR');
      } else {
        setError('Could not extract clear text from the image. You can manually enter or copy-paste the headline and article text below.');
      }

    } catch (err) {
      console.error('OCR Error:', err);
      setError('Failed to extract text from image. You can manually enter or copy-paste the text below.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setOcrProgress(0);
    setOcrStatusText('');
    setOcrEngineUsed('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Main News Analysis Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/check-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: cleanText,
          source_type: activeMode === 'image' ? 'newspaper_image' : 'text'
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server error occurred during analysis');
      }

      setResult({
        ...data.data,
        image_preview: activeMode === 'image' ? imagePreview : null
      });

      // Save ID to local storage for guest history tracking
      if (!user && data.data?.id) {
        const guestHistory = JSON.parse(localStorage.getItem('guest_history_ids')) || [];
        if (!guestHistory.includes(data.data.id)) {
          guestHistory.unshift(data.data.id);
          localStorage.setItem('guest_history_ids', JSON.stringify(guestHistory));
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setText('');
    setResult(null);
    setError(null);
    handleRemoveImage();
  };

  // Helper to render dynamically highlighted snippet keywords
  const renderHighlightedSnippet = (description) => {
    if (!description) return null;
    const userWords = text.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 3);
    if (userWords.length === 0) return description;

    let regexPattern = userWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    if (!regexPattern) return description;

    const regex = new RegExp(`\\b(${regexPattern})\\b`, 'gi');
    const parts = description.split(regex);

    return parts.map((part, idx) => {
      if (userWords.some(w => w.toLowerCase() === part.toLowerCase())) {
        return (
          <mark key={idx} className="bg-yellow-500/80 text-background-dark font-bold px-1 rounded-sm mx-0.5">
            <u>{part}</u>
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-3 py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          AI & Multimodal NLP Misinformation Detector
        </div>
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-gradient">
          Uncover the Truth
        </h2>
        <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto">
          Paste article text or upload a <strong>newspaper image clipping</strong> to instantly verify authenticity with real-time news sources and AI verification.
        </p>
      </section>

      {/* Input Form Module */}
      {!result && (
        <section className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
          
          {/* Mode Switcher Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-glass-border pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Article Analysis Engine</h3>
                <p className="text-xs text-slate-400">Choose your input mode below</p>
              </div>
            </div>

            <div className="flex bg-background-dark/80 p-1 rounded-xl border border-glass-border">
              <button
                type="button"
                onClick={() => { setActiveMode('text'); setError(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeMode === 'text'
                    ? 'bg-primary text-background-dark shadow-[0_0_15px_rgba(13,204,242,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Text Input
              </button>

              <button
                type="button"
                onClick={() => { setActiveMode('image'); setError(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeMode === 'image'
                    ? 'bg-primary text-background-dark shadow-[0_0_15px_rgba(13,204,242,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileImage className="w-4 h-4" />
                Newspaper Image Upload
              </button>
            </div>
          </div>

          {/* NEWSPAPER IMAGE UPLOAD SECTION */}
          {activeMode === 'image' && (
            <div className="space-y-4">
              {!imagePreview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
                    isDragOver 
                      ? 'border-primary bg-primary/10 scale-[1.01]' 
                      : 'border-glass-border hover:border-primary/50 bg-background-dark/40 hover:bg-background-dark/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleImageFile(e.target.files[0])}
                  />

                  <div className="p-4 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Upload className="w-8 h-8 animate-bounce-slow" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-white font-bold text-base">
                      Drag & Drop Newspaper Image or Clipping
                    </p>
                    <p className="text-slate-400 text-xs">
                      Supports PNG, JPG, JPEG, WEBP photos up to 10MB
                    </p>
                  </div>

                  <span className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary font-semibold text-xs uppercase tracking-wider">
                    Browse File
                  </span>
                </div>
              ) : (
                <div className="glass-card rounded-xl p-4 border border-glass-border flex flex-col md:flex-row items-center gap-4 relative">
                  {/* Image Thumbnail */}
                  <div className="relative group shrink-0">
                    <img 
                      src={imagePreview} 
                      alt="Newspaper Clipping" 
                      className="w-32 h-32 object-cover rounded-xl border border-glass-border shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ScanText className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Details & Status */}
                  <div className="flex-1 space-y-2 text-center md:text-left w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary/20 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-primary/30 uppercase">
                          📰 Newspaper Image
                        </span>
                        {ocrEngineUsed && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            ✓ {ocrEngineUsed}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-slate-400 hover:text-red-400 p-1 transition-colors"
                        title="Remove Image"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-slate-200 text-xs font-semibold truncate">
                      File: {selectedImage?.name || 'newspaper_article.jpg'} ({(selectedImage?.size / 1024).toFixed(1)} KB)
                    </p>

                    {/* OCR Progress Bar */}
                    {ocrLoading ? (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] text-slate-300 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                            {ocrStatusText}
                          </span>
                          <span>{ocrProgress}%</span>
                        </div>
                        <div className="w-full bg-background-dark h-2 rounded-full overflow-hidden border border-glass-border">
                          <div 
                            className="bg-primary h-full transition-all duration-300 shadow-[0_0_10px_rgba(13,204,242,0.8)]"
                            style={{ width: `${ocrProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        Text extracted below. You can edit or refine the text if needed before running analysis.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* News Text Area */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-300 text-sm font-medium flex items-center gap-2">
                  <span>
                    {activeMode === 'image' ? 'Extracted Newspaper Headline & Article Text' : 'News Headline or Full Content'}
                  </span>
                  {activeMode === 'image' && text && (
                    <span className="text-[11px] text-primary flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> Editable
                    </span>
                  )}
                </label>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={loading || ocrLoading}
                rows={activeMode === 'image' ? 6 : 7}
                required
                placeholder={
                  activeMode === 'image'
                    ? 'Extracted text from your newspaper clipping will automatically appear here...'
                    : 'Paste the news text or headline here for deep fact checking...'
                }
                className="w-full rounded-xl bg-background-dark/60 border border-glass-border focus:border-primary focus:ring-1 focus:ring-primary text-slate-100 placeholder:text-slate-500 p-4 transition-all text-sm leading-relaxed outline-none"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!loading ? (
              <button
                type="submit"
                disabled={ocrLoading || !text.trim()}
                className="w-full flex items-center justify-center gap-2 bg-primary text-background-dark font-bold text-lg h-14 rounded-xl hover:brightness-110 shadow-[0_0_25px_rgba(13,204,242,0.35)] transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-5 h-5" />
                {activeMode === 'image' ? 'Analyze Newspaper News with AI' : 'Analyze with AI'}
              </button>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 space-y-3 bg-background-dark/40 rounded-xl border border-glass-border">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-300 text-sm font-medium animate-pulse">
                  Verifying newspaper claim against live news feeds & AI models...
                </p>
              </div>
            )}
          </form>
        </section>
      )}

      {/* Results Module */}
      {result && (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-white">Verification Dashboard</h3>
              
              {result.source_type === 'newspaper_image' && (
                <span className="flex items-center gap-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold px-2.5 py-1 rounded-full border border-cyan-500/30">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Newspaper Upload
                </span>
              )}

              {result.is_cached && (
                <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
                  <Zap className="w-3.5 h-3.5" />
                  Lightning Cache
                </span>
              )}
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Analyze Another Article
            </button>
          </div>

          {/* If Newspaper Image was uploaded, show side-by-side snippet */}
          {result.image_preview && (
            <div className="glass-card rounded-2xl p-4 border border-cyan-500/30 bg-cyan-500/5 flex items-center gap-4">
              <img 
                src={result.image_preview} 
                alt="Uploaded Newspaper Clipping" 
                className="w-20 h-20 object-cover rounded-xl border border-glass-border shadow-md shrink-0"
              />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <ScanText className="w-3.5 h-3.5" /> Newspaper OCR Source Verified
                </span>
                <p className="text-slate-300 line-clamp-2 italic">
                  "{result.text}"
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Primary Verdict & Glow */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden">
              <div className="relative flex items-center justify-center">
                <div
                  className={`absolute w-36 h-36 rounded-full blur-3xl ${
                    result.prediction === 'Fake' ? 'bg-red-500/30' : 'bg-emerald-500/30'
                  }`}
                />
                {result.prediction === 'Fake' ? (
                  <AlertTriangle className="w-24 h-24 text-red-500 relative z-10 animate-pulse-slow" />
                ) : (
                  <CheckCircle2 className="w-24 h-24 text-emerald-500 relative z-10 animate-pulse-slow" />
                )}
              </div>

              <div className="space-y-1 z-10">
                <h4 className={`text-4xl font-black ${
                  result.prediction === 'Fake' ? 'text-red-500' : 'text-emerald-400'
                }`}>
                  {result.prediction === 'Fake' ? 'LIKELY FAKE' : 'LIKELY REAL'}
                </h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  AI Verdict
                </p>
              </div>

              <div className="flex w-full divide-x divide-glass-border pt-4 border-t border-glass-border z-10">
                <div className="flex-1 text-center">
                  <p className="text-2xl font-black text-white">{result.credibility_score}/100</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Credibility</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-2xl font-black text-white">{(result.confidence * 100).toFixed(1)}%</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">AI Confidence</p>
                </div>
              </div>
            </div>

            {/* Column 2: Context & Manipulation Risk */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between gap-6">
              <div className="space-y-3">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Classification & Metadata
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30 uppercase tracking-wider">
                    {result.category || 'Other'}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
                    result.credibility_score > 75
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : result.credibility_score > 45
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    Verification Risk: {result.credibility_score > 75 ? 'Low' : result.credibility_score > 45 ? 'Moderate' : 'High'}
                  </span>
                </div>
              </div>

              {/* Manipulation Risk Box */}
              <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                result.manipulation_risk === 'HIGH'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                <div className="p-2 rounded-lg bg-white/10 shrink-0">
                  {result.manipulation_risk === 'HIGH' ? (
                    <ShieldAlert className="w-6 h-6 text-red-400" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      Sensationalism Risk: {result.manipulation_risk}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {result.manipulation_risk === 'HIGH'
                      ? 'Loaded words or clickbait syntax detected.'
                      : 'Language appears neutral and objective.'}
                  </p>
                </div>
              </div>

              {/* Live Search Verification Pill */}
              <div className="p-3 rounded-xl bg-background-dark/40 border border-glass-border text-xs text-slate-300 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  result.api_verification.includes('High') ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`} />
                <span className="truncate">{result.api_verification}</span>
              </div>
            </div>

            {/* Column 3: AI Reasoning & Sources */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  AI Fact-Check Explanation
                </p>
                <div className="text-xs text-slate-200 bg-background-dark/50 p-4 rounded-xl border border-glass-border leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {result.ai_summary || "No explanation provided."}
                </div>
              </div>

              {/* Matched Sources */}
              {result.matched_sources && result.matched_sources.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400 uppercase font-bold">
                    Cited Sources Found
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matched_sources.map((src, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        {src.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scraped Evidence Snippets */}
          {result.matched_sources && result.matched_sources.some(s => s.description) && (
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Quote className="w-4 h-4" />
                Verified News Snippets & Keyword Matching
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.matched_sources.map((src, i) => src.description && (
                  <div key={i} className="p-4 rounded-xl bg-background-dark/50 border border-glass-border space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 font-bold">
                      <span className="text-primary">{src.name}</span>
                      <span>Score: {Math.round(src.score * 100)}%</span>
                    </div>
                    <p className="text-slate-300 italic leading-relaxed">
                      "{renderHighlightedSnippet(src.description)}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

