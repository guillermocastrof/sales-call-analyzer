import { NextRequest, NextResponse } from 'next/server';
import { getAllCalls, insertCall, initDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { estimateTalkRatio } from '@/lib/analyze';

export async function GET() {
  try {
    await initDb();
    const calls = await getAllCalls();
    return NextResponse.json(calls);
  } catch (error) {
    console.error('GET /api/calls error:', error);
    return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();
    const { client_name, client_company, call_date, duration_minutes, outcome, transcript } = body;

    const id = uuidv4();
    const talkRatio = estimateTalkRatio(transcript || '');
    const wordCount = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;

    const call = await insertCall({
      id,
      client_name: client_name || '',
      client_company: client_company || '',
      call_date: call_date || new Date().toISOString().split('T')[0],
      duration_minutes: duration_minutes || 0,
      outcome: outcome || 'Unclear',
      transcript: transcript || '',
      analysis_status: 'pending',
      talk_ratio_guillermo: talkRatio,
      word_count_total: wordCount,
    });

    return NextResponse.json(call, { status: 201 });
  } catch (error) {
    console.error('POST /api/calls error:', error);
    return NextResponse.json({ error: 'Failed to create call' }, { status: 500 });
  }
}
