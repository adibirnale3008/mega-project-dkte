import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, Search, AlertTriangle, CheckCircle2, 
  TrendingUp, Activity, Eye, ChevronLeft, ChevronRight, Loader2, Calendar
} from 'lucide-react';

export default function History({ user, onSelectItem }) {
  const [historyData, setHistoryData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      let res;
      if (user) {
        // User logged in: fetch from /api/history
        res = await fetch('/api/history', { credentials: 'include' });
      } else {
        // Guest mode: fetch guest IDs from localStorage
        const guestIds = JSON.parse(localStorage.getItem('guest_history_ids')) || [];
        if (guestIds.length === 0) {
          setHistoryData([]);
          setAnalytics(null);
          setLoading(false);
          return;
        }

        res = await fetch('/api/history/guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: guestIds })
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to retrieve history');

      setHistoryData(data.data || []);
      setAnalytics(data.analytics || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter items by search query
  const filteredData = historyData.filter((item) =>
    item.news_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.claim_category && item.claim_category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-primary" />
            Fact Check History & Analytics
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Track and audit your previous AI fake news detection queries
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search claims..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background-dark/60 border border-glass-border focus:border-primary text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Analytics Dashboard Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-primary flex flex-col justify-between space-y-2">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs uppercase font-bold tracking-wider">Total Checked</span>
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-black text-white">{analytics.total_claims}</p>
            <p className="text-xs text-primary font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> All time queries
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-red-500 flex flex-col justify-between space-y-2">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs uppercase font-bold tracking-wider">Fake Detected</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-black text-white">{analytics.fake_news}</p>
            <p className="text-xs text-red-400 font-semibold">Identified Misinformation</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-emerald-500 flex flex-col justify-between space-y-2">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs uppercase font-bold tracking-wider">Real Verified</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-white">{analytics.real_news}</p>
            <p className="text-xs text-emerald-400 font-semibold">Authentic News</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-amber-500 flex flex-col justify-between space-y-2">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs uppercase font-bold tracking-wider">Avg Credibility</span>
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-black text-white">{analytics.avg_credibility}/100</p>
            <p className="text-xs text-amber-400 font-semibold">Overall Index</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Fetching history records...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchHistory} className="underline text-xs font-bold">Retry</button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredData.length === 0 && (
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-3">
          <HistoryIcon className="w-12 h-12 text-slate-500" />
          <h3 className="text-xl font-bold text-white">No History Found</h3>
          <p className="text-sm text-slate-400 max-w-sm">
            {searchQuery ? 'No records match your search criteria.' : "You haven't analyzed any news articles yet."}
          </p>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && filteredData.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden border border-glass-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-glass-border text-xs text-slate-400 uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Claim / Article Headline</th>
                  <th className="px-6 py-4">Verdict</th>
                  <th className="px-6 py-4 text-center">Confidence</th>
                  <th className="px-6 py-4">Source Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {paginatedData.map((item) => {
                  const isFake = item.prediction === 'Fake';
                  const dateStr = new Date(item.created_at).toLocaleDateString();

                  return (
                    <tr key={item.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-200 max-w-xs truncate" title={item.news_text}>
                        {item.news_text}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isFake ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {isFake ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {isFake ? 'FAKE' : 'REAL'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-300">
                        {(item.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        <span className="truncate max-w-[140px] inline-block">
                          {item.api_verification}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {dateStr}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onSelectItem(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-background-dark font-bold text-xs hover:brightness-110 shadow-sm transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-white/5 border-t border-glass-border flex items-center justify-between text-xs text-slate-400">
              <span>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries</span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg bg-background-dark border border-glass-border hover:text-white disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-200 px-2">Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-lg bg-background-dark border border-glass-border hover:text-white disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
