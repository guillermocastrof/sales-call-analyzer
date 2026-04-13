import { NextRequest, NextResponse } from 'next/server';
import { getCallById, updateCallFields, initDb } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await initDb();
    const call = await getCallById(params.id);
    if (!call) return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    return NextResponse.json(call);
  } catch (error) {
    console.error('GET /api/calls/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch call' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await initDb();
    const body = await request.json();
    const call = await updateCallFields(params.id, body);
    if (!call) return NextResponse.json({ error: 'No valid fields to update or call not found' }, { status: 400 });
    return NextResponse.json(call);
  } catch (error) {
    console.error('PATCH /api/calls/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update call' }, { status: 500 });
  }
}
