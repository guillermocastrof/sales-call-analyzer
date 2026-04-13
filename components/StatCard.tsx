export default function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-6">
      <p className="text-[#A0A0A0] text-sm mb-1">{label}</p>
      <p className="text-white text-3xl font-bold">{value}</p>
      {sub && <p className="text-[#A0A0A0] text-xs mt-1">{sub}</p>}
    </div>
  );
}
