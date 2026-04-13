import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { estimateTalkRatio } from '@/lib/analyze';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Parse Circleback webhook payload
    // Circleback typically sends: meeting_title, attendees, transcript, date, duration
    const transcript = body.transcript || body.summary || body.content || '';
    const clientName = body.attendees?.filter((a: { is_host: boolean }) => !a.is_host)?.[0]?.name || body.client_name || 'Unknown';
    const clientCompany = body.attendees?.filter((a: { is_host: boolean }) => !a.is_host)?.[0]?.company || body.company || '';
    const callDate = body.date || body.meeting_date || new Date().toISOString().split('T')[0];
    const duration = body.duration_minutes || body.duration || 0;

    const id = uuidv4();
    const talkRatio = estimateTalkRatio(transcript);
    const wordCount = transcript.split(/\s+/).filter(Boolean).length;

    const db = getDb();
    db.prepare(`
      INSERT INTO calls (id, client_name, client_company, call_date, duration_minutes, outcome, transcript, analysis_status, talk_ratio_guillermo, word_count_total)
      VALUES (?, ?, ?, ?, ?, 'Unclear', ?, 'pending', ?, ?)
    `).run(id, clientName, clientCompany, callDate, duration, transcript, talkRatio, wordCount);

    // Trigger analysis
    fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3335'}/api/analyze`, {
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
