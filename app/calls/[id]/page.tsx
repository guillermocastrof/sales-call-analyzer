'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import OutcomeBadge from '@/components/OutcomeBadge';
import AnalysisPanel from '@/components/AnalysisPanel';

interface Call {
  id: string;
  client_name: string;
  client_company: string;
  call_date: string;
  duration_minutes: number;
  outcome: string;
  transcript: string;
  analysis_json: string | null;
  analysis_status: string;
  talk_ratio_guillermo: number;
  word_count_total: number;
}

export default function CallDetailPage() {
  const { id } = useParams();
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingOutcome, setEditingOutcome] = useState(false);
  const [newOutcome, setNewOutcome] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);

  const fetchCall = useCallback(async () => {
    try {
      const res = await fetch(`/api/calls/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setCall(data);
      setNewOutcome(data.outcome);
    } catch {}
  }, [id]);

  useEffect(() => {
    fetchCall().then(() => setLoading(false));
  }, [fetchCall]);

  // Poll while analysis is pending/processing
  useEffect(() => {
    if (!call) return;
    if (call.analysis_status === 'done' || call.analysis_status === 'error') return;
    const interval = setInterval(fetchCall, 3000);
    return () => clearInterval(interval);
  }, [call, fetchCall]);

  async function saveOutcome() {
    await fetch(`/api/calls/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome: newOutcome }),
    });
    setCall(prev => prev ? { ...prev, outcome: newOutcome } : null);
    setEditingOutcome(false);
  }

  async function triggerAnalysis() {
    await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchCall();
  }

  if (loading) return <div className="text-[#A0A0A0] text-center py-12">Loading...</div>;
  if (!call) return <div className="text-[#A0A0A0] text-center py-12">Call not found</div>;

  const analysis = call.analysis_json ? JSON.parse(call.analysis_json) : null;

  return (
    <div>
      <div className="mb-6">
        <Link href="/calls" className="text-[#A0A0A0] text-sm hover:text-white">← All Calls</Link>
      </div>

      {/* Header */}
      <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{call.client_name}</h1>
            {call.client_company && <p className="text-[#A0A0A0] mt-1">{call.client_company}</p>}
          </div>
          <div className="flex items-center gap-3">
            {editingOutcome ? (
              <div className="flex items-center gap-2">
                <select
                  value={newOutcome}
                  onChange={e => setNewOutcome(e.target.value)}
                  className="bg-[#0C0C0C] border border-[#1E1E1E] rounded px-3 py-1 text-white text-sm"
                >
                  <option value="Unclear">Unclear</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
                <button onClick={saveOutcome} className="text-[#7C3AED] text-sm hover:text-violet-400">Save</button>
                <button onClick={() => setEditingOutcome(false)} className="text-[#A0A0A0] text-sm hover:text-white">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setEditingOutcome(true)} className="flex items-center gap-2">
                <OutcomeBadge outcome={call.outcome} />
                <span className="text-[#A0A0A0] text-xs hover:text-white">edit</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mt-4 text-sm text-[#A0A0A0]">
          <span>📅 {call.call_date}</span>
          <span>⏱ {call.duration_minutes} minutes</span>
          {call.talk_ratio_guillermo != null && (
            <span>🎤 Talk ratio: {Math.round(call.talk_ratio_guillermo)}% Guillermo</span>
          )}
          {call.word_count_total > 0 && (
            <span>📝 {call.word_count_total.toLocaleString()} words</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Analysis */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Analysis</h2>
          {call.analysis_status === 'done' && analysis ? (
            <AnalysisPanel analysis={analysis} />
          ) : call.analysis_status === 'processing' ? (
            <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-12 text-center">
              <div className="inline-block w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[#A0A0A0]">Analyzing your call...</p>
              <p className="text-[#606060] text-xs mt-1">This usually takes 10-20 seconds</p>
            </div>
          ) : call.analysis_status === 'error' ? (
            <div className="bg-[#141414] border border-red-900 rounded-lg p-12 text-center">
              <p className="text-red-400 mb-3">Analysis failed</p>
              <button onClick={triggerAnalysis} className="text-[#7C3AED] text-sm hover:text-violet-400">
                Retry Analysis
              </button>
            </div>
          ) : (
            <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-12 text-center">
              <p className="text-[#A0A0A0] mb-3">Analysis not started</p>
              <button onClick={triggerAnalysis} className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-2 rounded-lg text-sm transition-colors">
                Start Analysis
              </button>
            </div>
          )}
        </div>

        {/* Right: Transcript */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Transcript</h2>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-[#A0A0A0] text-sm hover:text-white"
            >
              {showTranscript ? 'Hide' : 'Show'}
            </button>
          </div>
          {showTranscript ? (
            <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-6 max-h-[600px] overflow-y-auto">
              <pre className="text-[#A0A0A0] text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {call.transcript}
              </pre>
            </div>
          ) : (
            <div
              className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-6 cursor-pointer hover:border-[#7C3AED]/30 transition-colors"
              onClick={() => setShowTranscript(true)}
            >
              <p className="text-[#606060] text-sm line-clamp-3">
                {call.transcript?.substring(0, 200)}...
              </p>
              <p className="text-[#7C3AED] text-xs mt-2">Click to expand</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
