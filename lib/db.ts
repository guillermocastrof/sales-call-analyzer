import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY,
      client_name TEXT,
      client_company TEXT,
      call_date TEXT,
      duration_minutes INTEGER,
      outcome TEXT DEFAULT 'Unclear',
      transcript TEXT,
      analysis_json TEXT,
      analysis_status TEXT DEFAULT 'pending',
      talk_ratio_guillermo REAL,
      word_count_total INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function getAllCalls() {
  return sql`SELECT * FROM calls ORDER BY created_at DESC`;
}

export async function getCallById(id: string) {
  const rows = await sql`SELECT * FROM calls WHERE id = ${id}`;
  return rows[0] || null;
}

export async function insertCall(data: {
  id: string;
  client_name: string;
  client_company: string;
  call_date: string;
  duration_minutes: number;
  outcome: string;
  transcript: string;
  analysis_status: string;
  talk_ratio_guillermo: number;
  word_count_total: number;
}) {
  const rows = await sql`
    INSERT INTO calls (id, client_name, client_company, call_date, duration_minutes, outcome, transcript, analysis_status, talk_ratio_guillermo, word_count_total)
    VALUES (${data.id}, ${data.client_name}, ${data.client_company}, ${data.call_date}, ${data.duration_minutes}, ${data.outcome}, ${data.transcript}, ${data.analysis_status}, ${data.talk_ratio_guillermo}, ${data.word_count_total})
    RETURNING *
  `;
  return rows[0];
}

export async function updateCallStatus(id: string, status: string) {
  await sql`UPDATE calls SET analysis_status = ${status} WHERE id = ${id}`;
}

export async function updateCallAnalysis(id: string, analysisJson: string, talkRatio: number) {
  await sql`
    UPDATE calls SET
      analysis_json = ${analysisJson},
      analysis_status = 'done',
      talk_ratio_guillermo = ${talkRatio}
    WHERE id = ${id}
  `;
}

export async function updateCallFields(id: string, fields: Record<string, unknown>) {
  const allowed = ['outcome', 'client_name', 'client_company', 'call_date', 'duration_minutes'];
  const updates = Object.entries(fields).filter(([k]) => allowed.includes(k));
  if (!updates.length) return null;

  // Build query dynamically using tagged template for each field
  let q = sql`UPDATE calls SET `;
  for (let i = 0; i < updates.length; i++) {
    const [key, val] = updates[i];
    if (i === 0) {
      q = sql`UPDATE calls SET ${sql.unsafe(key)} = ${val as string}`;
    }
  }
  // For simplicity, handle field-by-field
  for (const [key, val] of updates) {
    if (key === 'outcome') await sql`UPDATE calls SET outcome = ${val as string} WHERE id = ${id}`;
    if (key === 'client_name') await sql`UPDATE calls SET client_name = ${val as string} WHERE id = ${id}`;
    if (key === 'client_company') await sql`UPDATE calls SET client_company = ${val as string} WHERE id = ${id}`;
    if (key === 'call_date') await sql`UPDATE calls SET call_date = ${val as string} WHERE id = ${id}`;
    if (key === 'duration_minutes') await sql`UPDATE calls SET duration_minutes = ${val as number} WHERE id = ${id}`;
  }
  return getCallById(id);
}

export default sql;
