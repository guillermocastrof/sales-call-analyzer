export default function WebhookPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Circleback Webhook Setup</h1>
        <p className="text-[#A0A0A0] text-sm mt-1">Automatically import calls from Circleback</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-6">
          <h2 className="text-white font-semibold mb-4">Setup Instructions</h2>
          <ol className="space-y-4 text-[#A0A0A0] text-sm">
            <li className="flex gap-3">
              <span className="text-[#7C3AED] font-bold">1.</span>
              <div>
                <p className="text-white mb-1">Expose your local server</p>
                <p>Use ngrok or similar to expose port 3335: <code className="bg-[#0C0C0C] px-2 py-0.5 rounded text-violet-300">ngrok http 3335</code></p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-[#7C3AED] font-bold">2.</span>
              <div>
                <p className="text-white mb-1">Configure Circleback</p>
                <p>In Circleback settings → Integrations → Webhooks, add your webhook URL:</p>
                <code className="block bg-[#0C0C0C] px-3 py-2 rounded mt-2 text-violet-300 break-all">
                  https://your-ngrok-url.ngrok.io/api/webhook/circleback
                </code>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-[#7C3AED] font-bold">3.</span>
              <div>
                <p className="text-white mb-1">Expected payload format</p>
                <pre className="bg-[#0C0C0C] px-3 py-2 rounded mt-2 text-violet-300 text-xs overflow-x-auto">{`{
  "transcript": "...",
  "date": "2024-01-15",
  "duration_minutes": 45,
  "attendees": [
    { "name": "John Smith", "company": "Acme", "is_host": false }
  ]
}`}</pre>
              </div>
            </li>
          </ol>
        </div>

        <div className="bg-[#141414] border border-[#1E1E1E] rounded-lg p-6">
          <h2 className="text-white font-semibold mb-2">Webhook Endpoint</h2>
          <code className="text-violet-300 text-sm">POST /api/webhook/circleback</code>
          <p className="text-[#A0A0A0] text-sm mt-2">
            Calls received via webhook are automatically analyzed and appear in your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
