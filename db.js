const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'calls.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    transcript TEXT,
    date TEXT,
    created_at TEXT,
    analyzed_at TEXT,
    analysis TEXT,
    status TEXT DEFAULT 'pending'
  )
`);

function createCall({ title, transcript, date }) {
  const now = new Date().toISOString();
  const stmt = db.prepare(
    `INSERT INTO calls (title, transcript, date, created_at, status)
     VALUES (?, ?, ?, ?, 'pending')`
  );
  const result = stmt.run(title, transcript, date || now.split('T')[0]);
  return getCall(result.lastInsertRowid);
}

function getCall(id) {
  const row = db.prepare('SELECT * FROM calls WHERE id = ?').get(id);
  if (!row) return null;
  if (row.analysis) {
    try { row.analysis = JSON.parse(row.analysis); } catch (e) { /* keep as string */ }
  }
  return row;
}

function getAllCalls() {
  const rows = db.prepare('SELECT * FROM calls ORDER BY created_at DESC').all();
  return rows.map(row => {
    if (row.analysis) {
      try { row.analysis = JSON.parse(row.analysis); } catch (e) { /* keep as string */ }
    }
    return row;
  });
}

function updateCallStatus(id, status) {
  db.prepare('UPDATE calls SET status = ? WHERE id = ?').run(status, id);
}

function updateCallAnalysis(id, analysis) {
  const now = new Date().toISOString();
  db.prepare(
    'UPDATE calls SET analysis = ?, analyzed_at = ?, status = ? WHERE id = ?'
  ).run(JSON.stringify(analysis), now, 'done', id);
}

function updateCallError(id, msg) {
  db.prepare("UPDATE calls SET status = 'error', analysis = ? WHERE id = ?")
    .run(JSON.stringify({ error: msg }), id);
}

function deleteCall(id) {
  db.prepare('DELETE FROM calls WHERE id = ?').run(id);
}

function getStats() {
  const calls = getAllCalls();
  const analyzed = calls.filter(c => c.status === 'done' && c.analysis && !c.analysis.error);

  const total_calls = calls.length;
  const avg_score = analyzed.length
    ? Math.round(analyzed.reduce((s, c) => s + (c.analysis.overall_score || 0), 0) / analyzed.length)
    : 0;
  const avg_talk_ratio = analyzed.length
    ? Math.round(analyzed.reduce((s, c) => s + (c.analysis.talk_ratio || 0), 0) / analyzed.length)
    : 0;
  const avg_close_probability = analyzed.length
    ? Math.round(analyzed.reduce((s, c) => s + (c.analysis.close_probability || 0), 0) / analyzed.length)
    : 0;

  const sentiment_breakdown = { positive: 0, neutral: 0, negative: 0 };
  analyzed.forEach(c => {
    const s = c.analysis.sentiment;
    if (s in sentiment_breakdown) sentiment_breakdown[s]++;
  });

  const objectionMap = {};
  const weaknessMap = {};
  const strengthMap = {};

  analyzed.forEach(c => {
    (c.analysis.objections_raised || []).forEach(o => {
      objectionMap[o] = (objectionMap[o] || 0) + 1;
    });
    (c.analysis.weaknesses || []).forEach(w => {
      weaknessMap[w] = (weaknessMap[w] || 0) + 1;
    });
    (c.analysis.strengths || []).forEach(s => {
      strengthMap[s] = (strengthMap[s] || 0) + 1;
    });
  });

  const top5 = obj => Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k);

  return {
    total_calls,
    avg_score,
    avg_talk_ratio,
    avg_close_probability,
    sentiment_breakdown,
    top_objections: top5(objectionMap),
    common_weaknesses: top5(weaknessMap),
    common_strengths: top5(strengthMap),
  };
}

module.exports = {
  createCall,
  getCall,
  getAllCalls,
  updateCallStatus,
  updateCallAnalysis,
  updateCallError,
  deleteCall,
  getStats,
};
