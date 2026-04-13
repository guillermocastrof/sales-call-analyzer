import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const call = db.prepare('SELECT * FROM calls WHERE id = ?').get(params.id);
    if (!call) return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    return NextResponse.json(call);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch call' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const db = getDb();

    const allowedFields = ['outcome', 'client_name', 'client_company', 'call_date', 'duration_minutes'];
    const updates: string[] = [];
    const values: unknown[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });

    values.push(params.id);
    db.prepare(`UPDATE calls SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const call = db.prepare('SELECT * FROM calls WHERE id = ?').get(params.id);
    return NextResponse.json(call);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update call' }, { status: 500 });
  }
}
