const GATEWAY_URL = process.env.CLAUDE_GATEWAY_URL || 'http://127.0.0.1:18789/v1/chat/completions';
const GATEWAY_TOKEN = process.env.CLAUDE_GATEWAY_TOKEN || '2e1656ba4816d3df2e137e81c99705619596ce0922824c24';

export async function analyzeTranscript(transcript: string): Promise<{
  whats_good: string[];
  whats_wrong: string[];
  client_sentiment: 'Positive' | 'Neutral' | 'Negative';
  sentiment_moments: string[];
  objections: string[];
  buying_signals: string[];
  follow_up_actions: string[];
  talk_ratio_guillermo: number;
}> {
  const prompt = `You are an expert sales coach analyzing a sales call transcript for Guillermo, founder of a video production studio. Analyze this transcript and return a JSON object.

TRANSCRIPT:
${transcript}

Analyze the transcript and return ONLY valid JSON with these exact keys:
{
  "whats_good": ["bullet point 1", "bullet point 2", ...],
  "whats_wrong": ["bullet point 1", "bullet point 2", ...],
  "client_sentiment": "Positive" | "Neutral" | "Negative",
  "sentiment_moments": ["key emotional moment 1", "key emotional moment 2", ...],
  "objections": ["objection 1", "objection 2", ...],
  "buying_signals": ["signal 1", "signal 2", ...],
  "follow_up_actions": ["action 1", "action 2", ...],
  "talk_ratio_guillermo": <number 0-100 representing % of words Guillermo spoke>
}

For talk_ratio_guillermo:
- If transcript has "G:" / "Guillermo:" / "Interviewer:" prefixes, count words per speaker
- Otherwise estimate: questions typically come from Guillermo, answers from client
- Return a number between 0 and 100

Return ONLY the JSON object, no markdown, no explanation.`;

  const response = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GATEWAY_TOKEN}`,
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in Claude response');

  return JSON.parse(jsonMatch[0]);
}
