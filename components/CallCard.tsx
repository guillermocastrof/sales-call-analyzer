import Link from 'next/link';
import OutcomeBadge from './OutcomeBadge';

interface Call {
  id: string;
  client_name: string;
  client_company: string;
  call_date: string;
  duration_minutes: number;
  outcome: string;
  analysis_status: string;
  talk_ratio_guillermo: number;
}

export default function CallCard({ call }: { call: Call }) {
  return (
    <Link href={`/calls/${call.id}`}>
      <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-4 hover:border-[#7C3AED]/50 transition-colors cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white font-medium">{call.client_name}</p>
            {call.client_company && <p className="text-[#A0A0A0] text-sm">{call.client_company}</p>}
          </div>
          <OutcomeBadge outcome={call.outcome} />
        </div>
        <div className="flex items-center gap-4 mt-3 text-[#A0A0A0] text-sm">
          <span>{call.call_date}</span>
          <span>{call.duration_minutes}min</span>
          {call.talk_ratio_guillermo != null && (
            <span>Talk: {Math.round(call.talk_ratio_guillermo)}%</span>
          )}
          <span className={`ml-auto text-xs ${
            call.analysis_status === 'done' ? 'text-green-400' :
            call.analysis_status === 'processing' ? 'text-yellow-400' :
            call.analysis_status === 'error' ? 'text-red-400' :
            'text-gray-500'
          }`}>
            {call.analysis_status === 'done' ? '✓ Analyzed' :
             call.analysis_status === 'processing' ? '⟳ Analyzing...' :
             call.analysis_status === 'error' ? '✗ Error' :
             '○ Pending'}
          </span>
        </div>
      </div>
    </Link>
  );
}
