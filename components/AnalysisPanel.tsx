'use client';

interface Analysis {
  whats_good: string[];
  whats_wrong: string[];
  client_sentiment: string;
  sentiment_moments: string[];
  objections: string[];
  buying_signals: string[];
  follow_up_actions: string[];
}

export default function AnalysisPanel({ analysis }: { analysis: Analysis }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span>✅</span> What Guillermo Did Well
        </h3>
        <ul className="space-y-2">
          {analysis.whats_good.map((item, i) => (
            <li key={i} className="text-[#A0A0A0] text-sm flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span> {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span>❌</span> Missed Opportunities
        </h3>
        <ul className="space-y-2">
          {analysis.whats_wrong.map((item, i) => (
            <li key={i} className="text-[#A0A0A0] text-sm flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span> {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span>💬</span> Client Sentiment
        </h3>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${
          analysis.client_sentiment === 'Positive' ? 'bg-green-900/50 text-green-400' :
          analysis.client_sentiment === 'Negative' ? 'bg-red-900/50 text-red-400' :
          'bg-gray-900/50 text-gray-400'
        }`}>
          {analysis.client_sentiment}
        </div>
        <ul className="space-y-2">
          {analysis.sentiment_moments.map((item, i) => (
            <li key={i} className="text-[#A0A0A0] text-sm flex items-start gap-2">
              <span className="text-violet-400 mt-0.5">•</span> {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span>🎯</span> Sales Insights
        </h3>
        {analysis.objections.length > 0 && (
          <div className="mb-4">
            <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2">Objections</p>
            <ul className="space-y-2">
              {analysis.objections.map((item, i) => (
                <li key={i} className="text-[#A0A0A0] text-sm flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {analysis.buying_signals.length > 0 && (
          <div>
            <p className="text-[#A0A0A0] text-xs uppercase tracking-wider mb-2">Buying Signals</p>
            <ul className="space-y-2">
              {analysis.buying_signals.map((item, i) => (
                <li key={i} className="text-[#A0A0A0] text-sm flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span>📋</span> Recommended Follow-up Actions
        </h3>
        <ul className="space-y-2">
          {analysis.follow_up_actions.map((item, i) => (
            <li key={i} className="text-[#A0A0A0] text-sm flex items-start gap-2">
              <span className="text-violet-400 mt-0.5">{i + 1}.</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
