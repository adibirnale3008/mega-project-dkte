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
        res = await fetch('/api/history', { credentials: 'include' });
      } else {
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
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-violet-700" />
            <span>Fact Check History &amp; Analytics</span>
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Track and audit your previous AI fake news detection queries
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-violet-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search claims..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-violet-200 focus:border-violet-600 focus:ring-2 focus:ring-violet-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Analytics Dashboard Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-violet-600 flex flex-col justify-between space-y-2 bg-white/90 shadow-card-soft">
            <div className="flex justify-between items-start text-slate-500">
              <span className="text-xs uppercase font-extrabold tracking-wider">Total Checked</span>
              <Activity className="w-5 h-5 text-violet-600" />
            </div>
            <p className="text-3xl font-black text-slate-900">{analytics.total_claims}</p>
            <p className="text-xs text-violet-700 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> All time queries
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-rose-500 flex flex-col justify-between space-y-2 bg-white/90 shadow-card-soft">
            <div className="flex justify-between items-start text-slate-500">
              <span className="text-xs uppercase font-extrabold tracking-wider">Fake Detected</span>
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <p className="text-3xl font-black text-slate-900">{analytics.fake_news}</p>
            <p className="text-xs text-rose-600 font-bold">Identified Misinformation</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-emerald-500 flex flex-col justify-between space-y-2 bg-white/90 shadow-card-soft">
            <div className="flex justify-between items-start text-slate-500">
              <span className="text-xs uppercase font-extrabold tracking-wider">Real Verified</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-slate-900">{analytics.real_news}</p>
            <p className="text-xs text-emerald-600 font-bold">Authentic News</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-amber-500 flex flex-col justify-between space-y-2 bg-white/90 shadow-card-soft">
            <div className="flex justify-between items-start text-slate-500">
              <span className="text-xs uppercase font-extrabold tracking-wider">Avg Credibility</span>
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-black text-slate-900">{analytics.avg_credibility}/100</p>
            <p className="text-xs text-amber-600 font-bold">Overall Index</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
          <p className="text-slate-600 text-sm font-semibold">Fetching history records...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between font-semibold">
          <span>{error}</span>
          <button onClick={fetchHistory} className="underline text-xs font-extrabold">Retry</button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredData.length === 0 && (
        <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-3 bg-white/90 border border-violet-100 shadow-card-soft">
          <HistoryIcon className="w-12 h-12 text-violet-400" />
          <h3 className="text-xl font-bold text-slate-900">No History Found</h3>
          <p className="text-sm text-slate-600 max-w-sm">
            {searchQuery ? 'No records match your search criteria.' : "You haven't analyzed any news articles yet."}
          </p>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && filteredData.length > 0 && (
        <div className="glass-card rounded-3xl overflow-hidden border border-violet-100 bg-white/95 shadow-card-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-violet-50/80 border-b border-violet-100 text-xs text-slate-700 uppercase tracking-wider font-extrabold">
                  <th className="px-6 py-4">Claim / Article Headline</th>
                  <th className="px-6 py-4">Verdict</th>
                  <th className="px-6 py-4 text-center">Confidence</th>
                  <th className="px-6 py-4">Source Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-100">
                {paginatedData.map((item) => {
                  const isFake = item.prediction === 'Fake';
                  const dateStr = new Date(item.created_at).toLocaleDateString();

                  return (
                    <tr key={item.id} className="hover:bg-violet-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs truncate" title={item.news_text}>
                        {item.news_text}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isFake ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {isFake ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {isFake ? 'FAKE' : 'REAL'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-800">
                        {(item.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                        <span className="truncate max-w-[140px] inline-block">
                          {item.api_verification}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-violet-500" />
                          {dateStr}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onSelectItem(item)}
                          className="btn-violet px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1 float-right"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
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
            <div className="px-6 py-4 bg-violet-50/50 border-t border-violet-100 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries</span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-xl bg-white border border-violet-200 text-slate-700 hover:bg-violet-50 disabled:opacity-40 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-800 px-2">Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-xl bg-white border border-violet-200 text-slate-700 hover:bg-violet-50 disabled:opacity-40 transition-colors shadow-sm"
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
