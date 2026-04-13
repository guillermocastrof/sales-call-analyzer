import { NextRequest, NextResponse } from 'next/server';
import { getCallById, updateCallStatus, updateCallAnalysis, initDb } from '@/lib/db';
import { analyzeTranscript } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Call ID required' }, { status: 400 });

    const call = await getCallById(id) as Record<string, unknown> | null;
    if (!call) return NextResponse.json({ error: 'Call not found' }, { status: 404 });

    // Mark as processing
    await updateCallStatus(id, 'processing');

    // Run analysis asynchronously (fire and forget)
    analyzeTranscript(call.transcript as string)
      .then(async (analysis) => {
        await updateCallAnalysis(id, JSON.stringify(analysis), analysis.talk_ratio_guillermo);
      })
      .catch(async (err) => {
        console.error('Analysis failed:', err);
        await updateCallStatus(id, 'error');
      });

    return NextResponse.json({ message: 'Analysis started', id });
  } catch (error) {
    console.error('POST /api/analyze error:', error);
    return NextResponse.json({ error: 'Failed to start analysis' }, { status: 500 });
  }
}
