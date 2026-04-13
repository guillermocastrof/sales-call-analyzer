const { updateCallStatus, updateCallAnalysis, updateCallError } = require('./db');

const GATEWAY_URL = 'http://127.0.0.1:18789/v1/chat/completions';

async function analyzeCall(callId, transcript) {
  const token = process.env.OPENCLAW_GATEWAY_TOKEN;
  if (!token) {
    console.warn('[analyzer] OPENCLAW_GATEWAY_TOKEN not set — skipping analysis');
    updateCallError(callId, 'OPENCLAW_GATEWAY_TOKEN not configured');
    return;
  }

  updateCallStatus(callId, 'analyzing');

  const prompt = `You are a sales coach analyzing a sales call transcript. Extract insights in JSON format.

Transcript:
${transcript}

Return ONLY valid JSON with this exact structure:
{
  "overall_score": <0-100, overall call quality>,
  "close_probability": <0-100, likelihood client will close>,
  "sentiment": "<positive|neutral|negative>",
  "client_sentiment": "<positive|neutral|negative>",
  "summary": "<2-3 sentence summary>",
  "strengths": ["<what salesperson did well>", ...],
  "weaknesses": ["<what salesperson did wrong or could improve>", ...],
  "objections_raised": ["<objection 1>", ...],
  "next_steps": ["<recommended next step>", ...],
  "talk_ratio": <0-100, estimated % salesperson talked>,
  "key_topics": ["<topic>", ...],
  "coaching_tips": ["<specific actionable tip>", ...],
  "client_pain_points": ["<identified pain point>", ...]
}`;

  try {
    const response = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const analysis = JSON.parse(jsonMatch[0]);
    updateCallAnalysis(callId, analysis);
    console.log(`[analyzer] Call ${callId} analyzed successfully`);
  } catch (err) {
    console.error(`[analyzer] Error analyzing call ${callId}:`, err.message);
    updateCallError(callId, err.message);
  }
}

module.exports = { analyzeCall };
