import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { analyzeTranscript } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Call ID required' }, { status: 400 });

    const db = getDb();
    const call = db.prepare('SELECT * FROM calls WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!call) return NextResponse.json({ error: 'Call not found' }, { status: 404 });

    // Mark as processing
    db.prepare("UPDATE calls SET analysis_status = 'processing' WHERE id = ?").run(id);

    // Run analysis asynchronously
    analyzeTranscript(call.transcript as string)
      .then((analysis) => {
        const db2 = getDb();
        db2.prepare(`
          UPDATE calls SET
            analysis_json = ?,
            analysis_status = 'done',
            talk_ratio_guillermo = ?
          WHERE id = ?
        `).run(JSON.stringify(analysis), analysis.talk_ratio_guillermo, id);
      })
      .catch((err) => {
        console.error('Analysis failed:', err);
        const db2 = getDb();
        db2.prepare("UPDATE calls SET analysis_status = 'error' WHERE id = ?").run(id);
      });

    return NextResponse.json({ message: 'Analysis started', id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start analysis' }, { status: 500 });
  }
}
