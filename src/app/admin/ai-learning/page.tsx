'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Globe,
  MapPin,
  Clock,
  ArrowLeft,
  Settings,
  RefreshCw,
  Search,
  MessageSquare,
} from 'lucide-react';

export default function AdminAiLearningPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({ total: 0, helpful: 0, unhelpful: 0, satisfactionRate: 100 });
  const [interactions, setInteractions] = useState<any[]>([]);
  const [filterLang, setFilterLang] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ai-learning');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setInteractions(data.interactions || []);
      }
    } catch (e) {
      console.error('Failed to load AI interactions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredInteractions = interactions.filter((item) => {
    const matchesLang = filterLang === 'ALL' || item.language === filterLang;
    const matchesSearch =
      !searchQuery ||
      item.userMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.botResponse.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLang && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-brand-forest-950 text-white p-6 sm:p-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-forest-800">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-brand-forest-900 hover:bg-brand-forest-800 text-stone-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-forest border border-brand-gold/40 flex items-center justify-center text-brand-gold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-white">
                  Veda Mitra AI Learning & Insights
                </h1>
                <p className="text-xs text-stone-400">
                  Continuous customer interaction logs, language analytics & satisfaction feedback
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="px-3.5 py-2 rounded-xl bg-brand-forest-900 border border-brand-forest-800 hover:bg-brand-forest-800 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/settings"
            className="px-4 py-2 rounded-xl bg-brand-gold text-brand-forest-950 font-bold text-xs hover:bg-brand-gold-light transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>AI Bot Settings</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-brand-forest-900/80 p-5 rounded-2xl border border-brand-forest-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Total Queries</span>
            <MessageSquare className="w-4 h-4 text-brand-gold" />
          </div>
          <div className="text-2xl sm:text-3xl font-cinzel font-bold text-white">
            {stats.total}
          </div>
          <p className="text-[11px] text-stone-400">Customer botanical queries</p>
        </div>

        <div className="bg-brand-forest-900/80 p-5 rounded-2xl border border-brand-forest-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Satisfaction Rate</span>
            <Sparkles className="w-4 h-4 text-brand-gold" />
          </div>
          <div className="text-2xl sm:text-3xl font-cinzel font-bold text-emerald-400">
            {stats.satisfactionRate}%
          </div>
          <p className="text-[11px] text-stone-400">Positive seeker feedback</p>
        </div>

        <div className="bg-brand-forest-900/80 p-5 rounded-2xl border border-brand-forest-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Helpful Votes</span>
            <ThumbsUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-cinzel font-bold text-white">
            {stats.helpful}
          </div>
          <p className="text-[11px] text-stone-400">Satisfied guidance marks</p>
        </div>

        <div className="bg-brand-forest-900/80 p-5 rounded-2xl border border-brand-forest-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Needs Refinement</span>
            <ThumbsDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-cinzel font-bold text-rose-400">
            {stats.unhelpful}
          </div>
          <p className="text-[11px] text-stone-400">Queries to review & improve</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-brand-forest-900/60 p-4 rounded-2xl border border-brand-forest-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search queries or responses..."
            className="w-full bg-brand-forest-950 text-white placeholder:text-stone-500 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-brand-forest-800 focus:outline-none focus:border-brand-gold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-stone-400 whitespace-nowrap">Filter Language:</span>
          <select
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            className="bg-brand-forest-950 text-white text-xs px-3 py-2 rounded-xl border border-brand-forest-800 focus:outline-none focus:border-brand-gold cursor-pointer"
          >
            <option value="ALL">All Languages</option>
            <option value="en">English</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="te">Telugu (తెలుగు)</option>
            <option value="bn">Bengali (বাংলা)</option>
            <option value="mr">Marathi (मराठी)</option>
            <option value="gu">Gujarati (ગુજરાતી)</option>
            <option value="kn">Kannada (ಕನ್ನಡ)</option>
            <option value="ml">Malayalam (മലയാളം)</option>
            <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
          </select>
        </div>
      </div>

      {/* Interaction Logs Table */}
      <div className="bg-brand-forest-900/80 rounded-3xl border border-brand-forest-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-brand-forest-800 flex items-center justify-between">
          <h3 className="font-cinzel text-sm font-bold text-white">
            Customer Conversation Log ({filteredInteractions.length})
          </h3>
          <span className="text-[11px] text-brand-gold">
            Auto-learning active from customer feedback
          </span>
        </div>

        {filteredInteractions.length === 0 ? (
          <div className="p-12 text-center text-stone-400 space-y-2">
            <Bot className="w-10 h-10 text-stone-600 mx-auto" />
            <p className="text-xs">No customer interactions found matching your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-brand-forest-800/80">
            {filteredInteractions.map((item) => (
              <div key={item.id} className="p-5 space-y-2.5 hover:bg-brand-forest-900 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-forest-800 text-brand-gold border border-brand-forest-700">
                      {item.language}
                    </span>
                    <span className="text-stone-400 flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-stone-500" />
                      {item.location || 'India'}
                    </span>
                    <span className="text-stone-500 text-[11px]">
                      {new Date(item.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div>
                    {item.feedback === 'HELPFUL' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        <ThumbsUp className="w-3 h-3" />
                        Helpful
                      </span>
                    ) : item.feedback === 'UNHELPFUL' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                        <ThumbsDown className="w-3 h-3" />
                        Needs Work
                      </span>
                    ) : (
                      <span className="text-stone-500 text-[10px]">No feedback yet</span>
                    )}
                  </div>
                </div>

                <div className="bg-brand-forest-950/70 p-3 rounded-xl border border-brand-forest-800/80 text-xs">
                  <span className="font-semibold text-brand-gold block mb-1">
                    Customer: &quot;{item.userMessage}&quot;
                  </span>
                  <p className="text-stone-300 leading-relaxed whitespace-pre-wrap">
                    {item.botResponse}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
