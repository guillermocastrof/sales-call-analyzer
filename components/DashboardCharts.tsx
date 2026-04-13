'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Call {
  call_date: string;
  outcome: string;
}

function groupByWeek(calls: Call[]) {
  const groups: Record<string, { total: number; won: number }> = {};
  calls.forEach(call => {
    const date = new Date(call.call_date);
    const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
    if (!groups[week]) groups[week] = { total: 0, won: 0 };
    groups[week].total++;
    if (call.outcome === 'Won') groups[week].won++;
  });
  return Object.entries(groups).slice(-8).map(([week, data]) => ({
    week,
    calls: data.total,
    closeRate: data.total > 0 ? Math.round((data.won / data.total) * 100) : 0,
  }));
}

export default function DashboardCharts({ calls }: { calls: Call[] }) {
  const weeklyData = groupByWeek(calls);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-6">
        <h3 className="text-white font-medium mb-4">Calls Over Time</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="week" stroke="#A0A0A0" tick={{ fontSize: 11 }} />
            <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#141414', border: '1px solid #1E1E1E', borderRadius: 8 }} />
            <Bar dataKey="calls" fill="#7C3AED" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-6">
        <h3 className="text-white font-medium mb-4">Close Rate Trend (%)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={weeklyData}>
            <XAxis dataKey="week" stroke="#A0A0A0" tick={{ fontSize: 11 }} />
            <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: '#141414', border: '1px solid #1E1E1E', borderRadius: 8 }} />
            <Line type="monotone" dataKey="closeRate" stroke="#7C3AED" strokeWidth={2} dot={{ fill: '#7C3AED' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
