import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = process.env.DATA_DIR || './data';

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'calls.db');

// Use global to survive hot reloads in development
const globalForDb = global as unknown as { db: Database.Database };

function getDb(): Database.Database {
  if (!globalForDb.db) {
    globalForDb.db = new Database(DB_PATH);
    globalForDb.db.pragma('journal_mode = WAL');
    globalForDb.db.exec(`
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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return globalForDb.db;
}

export default getDb;
