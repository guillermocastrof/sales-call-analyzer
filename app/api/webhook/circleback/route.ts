import { NextRequest, NextResponse } from 'next/server';
import { insertCall, initDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { estimateTalkRatio } from '@/lib/analyze';

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();

    // Parse Circleback webhook payload
    const transcript = body.transcript || body.summary || body.content || '';
    const clientName = body.attendees?.filter((a: { is_host: boolean }) => !a.is_host)?.[0]?.name || body.client_name || 'Unknown';
    const clientCompany = body.attendees?.filter((a: { is_host: boolean }) => !a.is_host)?.[0]?.company || body.company || '';
    const callDate = body.date || body.meeting_date || new Date().toISOString().split('T')[0];
    const duration = body.duration_minutes || body.duration || 0;

    const id = uuidv4();
    const talkRatio = estimateTalkRatio(transcript);
    const wordCount = transcript.split(/\s+/).filter(Boolean).length;

    await insertCall({
      id,
      client_name: clientName,
      client_company: clientCompany,
      call_date: callDate,
      duration_minutes: duration,
      outcome: 'Unclear',
      transcript,
      analysis_status: 'pending',
      talk_ratio_guillermo: talkRatio,
      word_count_total: wordCount,
    });

    // Trigger analysis
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3335';
    fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(console.error);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
