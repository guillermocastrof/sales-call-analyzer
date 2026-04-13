import Link from 'next/link';
import StatCard from '@/components/StatCard';
import CallCard from '@/components/CallCard';
import DashboardCharts from '@/components/DashboardCharts';

async function getCalls() {
  try {
    const res = await fetch('http://localhost:3335/api/calls', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Dashboard() {
  const calls = await getCalls();

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const callsThisWeek = calls.filter((c: Record<string, unknown>) => new Date(c.call_date as string) >= oneWeekAgo).length;
  const callsThisMonth = calls.filter((c: Record<string, unknown>) => new Date(c.call_date as string) >= oneMonthAgo).length;
  const wonCalls = calls.filter((c: Record<string, unknown>) => c.outcome === 'Won').length;
  const closedCalls = calls.filter((c: Record<string, unknown>) => c.outcome === 'Won' || c.outcome === 'Lost').length;
  const closeRate = closedCalls > 0 ? Math.round((wonCalls / closedCalls) * 100) : 0;

  const avgTalkRatio = calls.length > 0
    ? Math.round(calls.reduce((sum: number, c: Record<string, unknown>) => sum + ((c.talk_ratio_guillermo as number) || 50), 0) / calls.length)
    : 0;

  const recentCalls = calls.slice(0, 10);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-[#A0A0A0] text-sm mt-1">Your sales performance overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Calls" value={calls.length} />
        <StatCard label="Avg Talk Ratio" value={`${avgTalkRatio}%`} sub="Guillermo speaking" />
        <StatCard label="Close Rate" value={`${closeRate}%`} sub={`${wonCalls} won / ${closedCalls} closed`} />
        <StatCard label="This Week" value={callsThisWeek} sub={`${callsThisMonth} this month`} />
      </div>

      {calls.length > 0 && <DashboardCharts calls={calls} />}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Calls</h2>
          <Link href="/calls" className="text-[#7C3AED] text-sm hover:text-violet-400">View all →</Link>
        </div>
        {recentCalls.length === 0 ? (
          <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-12 text-center">
            <p className="text-[#A0A0A0] mb-4">No calls yet. Upload your first sales call to get started.</p>
            <Link href="/upload" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-2 rounded-lg text-sm transition-colors inline-block">
              Upload First Call
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {recentCalls.map((call: any) => (
              <CallCard key={call.id} call={call} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
