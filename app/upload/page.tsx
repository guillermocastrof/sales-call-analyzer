'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'paste' | 'file'>('paste');
  const [transcript, setTranscript] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    client_name: '',
    client_company: '',
    call_date: new Date().toISOString().split('T')[0],
    duration_minutes: '',
    outcome: 'Unclear',
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    if (file.name.endsWith('.txt')) {
      const text = await file.text();
      setTranscript(text);
    } else if (file.name.endsWith('.docx')) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/parse-docx', { method: 'POST', body: formData });
      const data = await res.json();
      setTranscript(data.text || '');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!transcript.trim()) { setError('Please provide a transcript'); return; }
    if (!form.client_name.trim()) { setError('Client name is required'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, duration_minutes: parseInt(form.duration_minutes) || 0, transcript }),
      });

      if (!res.ok) throw new Error('Failed to save call');
      const call = await res.json();

      // Trigger analysis
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: call.id }),
      }).catch(console.error);

      router.push(`/calls/${call.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Upload Sales Call</h1>
        <p className="text-[#A0A0A0] text-sm mt-1">Paste a transcript or upload a file to analyze</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mode Toggle */}
        <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-1 flex">
          <button
            type="button"
            onClick={() => setMode('paste')}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${mode === 'paste' ? 'bg-[#7C3AED] text-white' : 'text-[#A0A0A0] hover:text-white'}`}
          >
            Paste Transcript
          </button>
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${mode === 'file' ? 'bg-[#7C3AED] text-white' : 'text-[#A0A0A0] hover:text-white'}`}
          >
            Upload File
          </button>
        </div>

        {/* Transcript Input */}
        {mode === 'paste' ? (
          <div>
            <label className="block text-sm text-[#A0A0A0] mb-2">Transcript</label>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              className="w-full h-48 bg-[#141414] border border-[#1E1E1E] rounded-lg p-4 text-white text-sm resize-none focus:outline-none focus:border-[#7C3AED] placeholder-[#404040]"
              placeholder="Paste your call transcript here... (supports G:/Client: speaker labels)"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm text-[#A0A0A0] mb-2">Upload File (.txt or .docx)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full h-32 bg-[#141414] border border-dashed border-[#1E1E1E] rounded-lg flex items-center justify-center cursor-pointer hover:border-[#7C3AED]/50 transition-colors"
            >
              {fileName ? (
                <div className="text-center">
                  <p className="text-white text-sm">{fileName}</p>
                  <p className="text-[#A0A0A0] text-xs mt-1">
                    {transcript ? `${transcript.split(/\s+/).length} words loaded` : 'Processing...'}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-[#A0A0A0] text-sm">Click to upload .txt or .docx</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".txt,.docx" className="hidden" onChange={handleFileChange} />
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#A0A0A0] mb-2">Client Name *</label>
            <input
              type="text"
              value={form.client_name}
              onChange={e => setForm({ ...form, client_name: e.target.value })}
              className="w-full bg-[#141414] border border-[#1E1E1E] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="block text-sm text-[#A0A0A0] mb-2">Company</label>
            <input
              type="text"
              value={form.client_company}
              onChange={e => setForm({ ...form, client_company: e.target.value })}
              className="w-full bg-[#141414] border border-[#1E1E1E] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="block text-sm text-[#A0A0A0] mb-2">Call Date</label>
            <input
              type="date"
              value={form.call_date}
              onChange={e => setForm({ ...form, call_date: e.target.value })}
              className="w-full bg-[#141414] border border-[#1E1E1E] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#A0A0A0] mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={form.duration_minutes}
              onChange={e => setForm({ ...form, duration_minutes: e.target.value })}
              className="w-full bg-[#141414] border border-[#1E1E1E] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
              placeholder="45"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#A0A0A0] mb-2">Outcome</label>
          <select
            value={form.outcome}
            onChange={e => setForm({ ...form, outcome: e.target.value })}
            className="w-full bg-[#141414] border border-[#1E1E1E] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
          >
            <option value="Unclear">Unclear</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
            <option value="Follow-up">Follow-up</option>
          </select>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Saving...' : 'Save & Analyze Call'}
        </button>
      </form>
    </div>
  );
}
