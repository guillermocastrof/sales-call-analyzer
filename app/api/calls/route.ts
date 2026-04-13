import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { estimateTalkRatio } from '@/lib/analyze';

export async function GET() {
  try {
    const db = getDb();
    const calls = db.prepare('SELECT * FROM calls ORDER BY created_at DESC').all();
    return NextResponse.json(calls);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_name, client_company, call_date, duration_minutes, outcome, transcript } = body;

    const id = uuidv4();
    const talkRatio = estimateTalkRatio(transcript || '');
    const wordCount = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;

    const db = getDb();
    db.prepare(`
      INSERT INTO calls (id, client_name, client_company, call_date, duration_minutes, outcome, transcript, analysis_status, talk_ratio_guillermo, word_count_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).run(id, client_name, client_company, call_date, duration_minutes, outcome || 'Unclear', transcript, talkRatio, wordCount);

    const call = db.prepare('SELECT * FROM calls WHERE id = ?').get(id);
    return NextResponse.json(call, { status: 201 });
  } catch (error) {
    console.error('Error creating call:', error);
    return NextResponse.json({ error: 'Failed to create call' }, { status: 500 });
  }
}
