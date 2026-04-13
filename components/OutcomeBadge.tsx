type Outcome = 'Won' | 'Lost' | 'Follow-up' | 'Unclear';

const colors: Record<Outcome, string> = {
  Won: 'bg-green-900/50 text-green-400 border border-green-700',
  Lost: 'bg-red-900/50 text-red-400 border border-red-700',
  'Follow-up': 'bg-yellow-900/50 text-yellow-400 border border-yellow-700',
  Unclear: 'bg-gray-900/50 text-gray-400 border border-gray-700',
};

export default function OutcomeBadge({ outcome }: { outcome: string }) {
  const color = colors[outcome as Outcome] || colors.Unclear;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {outcome}
    </span>
  );
}
