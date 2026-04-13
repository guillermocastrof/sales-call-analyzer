'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OutcomeBadge from '@/components/OutcomeBadge';

interface Call {
  id: string;
  client_name: string;
  client_company: string;
  call_date: string;
  duration_minutes: number;
  outcome: string;
  analysis_status: string;
  talk_ratio_guillermo: number;
  word_count_total: number;
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/calls')
      .then(r => r.json())
      .then(data => { setCalls(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const outcomes = ['All', 'Won', 'Lost', 'Follow-up', 'Unclear'];
  const filtered = filter === 'All' ? calls : calls.filter(c => c.outcome === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">All Calls</h1>
          <p className="text-[#A0A0A0] text-sm mt-1">{calls.length} total calls</p>
        </div>
        <Link href="/upload" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm px-4 py-2 rounded-lg transition-colors">
          + Upload Call
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {outcomes.map(o => (
          <button
            key={o}
            onClick={() => setFilter(o)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              filter === o
                ? 'bg-[#7C3AED] text-white'
                : 'bg-[#141414] border border-[#1E1E1E] text-[#A0A0A0] hover:text-white'
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-[#A0A0A0] text-center py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-12 text-center">
          <p className="text-[#A0A0A0]">No calls found</p>
        </div>
      ) : (
        <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E1E1E]">
                <th className="text-left text-[#A0A0A0] text-xs uppercase tracking-wider px-6 py-3">Client</th>
                <th className="text-left text-[#A0A0A0] text-xs uppercase tracking-wider px-6 py-3">Date</th>
                <th className="text-left text-[#A0A0A0] text-xs uppercase tracking-wider px-6 py-3">Duration</th>
                <th className="text-left text-[#A0A0A0] text-xs uppercase tracking-wider px-6 py-3">Talk Ratio</th>
                <th className="text-left text-[#A0A0A0] text-xs uppercase tracking-wider px-6 py-3">Outcome</th>
                <th className="text-left text-[#A0A0A0] text-xs uppercase tracking-wider px-6 py-3">Analysis</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(call => (
                <tr key={call.id} className="border-b border-[#1E1E1E] hover:bg-[#1A1A1A] transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <Link href={`/calls/${call.id}`} className="block">
                      <p className="text-white text-sm font-medium">{call.client_name}</p>
                      {call.client_company && <p className="text-[#A0A0A0] text-xs">{call.client_company}</p>}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-[#A0A0A0] text-sm">{call.call_date}</td>
                  <td className="px-6 py-4 text-[#A0A0A0] text-sm">{call.duration_minutes}min</td>
                  <td className="px-6 py-4 text-[#A0A0A0] text-sm">
                    {call.talk_ratio_guillermo != null ? `${Math.round(call.talk_ratio_guillermo)}%` : '—'}
                  </td>
                  <td className="px-6 py-4"><OutcomeBadge outcome={call.outcome} /></td>
                  <td className="px-6 py-4">
                    <span className={`text-xs ${
                      call.analysis_status === 'done' ? 'text-green-400' :
                      call.analysis_status === 'processing' ? 'text-yellow-400' :
                      call.analysis_status === 'error' ? 'text-red-400' :
                      'text-gray-500'
                    }`}>
                      {call.analysis_status === 'done' ? '✓ Done' :
                       call.analysis_status === 'processing' ? '⟳ Processing' :
                       call.analysis_status === 'error' ? '✗ Error' : '○ Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
