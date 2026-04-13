const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const db = require('./db');
const { analyzeCall } = require('./analyzer');

if (!process.env.OPENCLAW_GATEWAY_TOKEN) {
  console.warn('[server] WARNING: OPENCLAW_GATEWAY_TOKEN is not set. Analysis will fail.');
}

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/calls — create from JSON body
app.post('/api/calls', (req, res) => {
  const { title, transcript, date } = req.body;
  if (!transcript) return res.status(400).json({ error: 'transcript is required' });

  const call = db.createCall({
    title: title || 'Untitled Call',
    transcript,
    date: date || new Date().toISOString().split('T')[0],
  });

  analyzeCall(call.id, transcript).catch(console.error);

  res.json({ id: call.id, title: call.title, status: call.status });
});

// POST /api/calls/upload — multipart file upload
app.post('/api/calls/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file is required' });

  const transcript = fs.readFileSync(req.file.path, 'utf-8');
  fs.unlinkSync(req.file.path);

  const title = req.body.title || path.basename(req.file.originalname, '.txt') || 'Uploaded Call';
  const date = req.body.date || new Date().toISOString().split('T')[0];

  const call = db.createCall({ title, transcript, date });
  analyzeCall(call.id, transcript).catch(console.error);

  res.json({ id: call.id, title: call.title, status: call.status });
});

// POST /api/calls/webhook — Circleback webhook
app.post('/api/calls/webhook', (req, res) => {
  const body = req.body || {};
  const transcript = body.transcript || body.summary || '';
  if (!transcript) return res.status(400).json({ error: 'no transcript or summary in payload' });

  const title = body.title || 'Webhook Call';
  const date = body.date
    ? new Date(body.date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const call = db.createCall({ title, transcript, date });
  analyzeCall(call.id, transcript).catch(console.error);

  res.json({ id: call.id, title: call.title, status: call.status });
});

// GET /api/calls
app.get('/api/calls', (req, res) => {
  res.json(db.getAllCalls());
});

// GET /api/calls/:id
app.get('/api/calls/:id', (req, res) => {
  const call = db.getCall(parseInt(req.params.id));
  if (!call) return res.status(404).json({ error: 'not found' });
  res.json(call);
});

// DELETE /api/calls/:id
app.delete('/api/calls/:id', (req, res) => {
  db.deleteCall(parseInt(req.params.id));
  res.json({ ok: true });
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  res.json(db.getStats());
});

const PORT = process.env.PORT || 3335;
app.listen(PORT, () => {
  console.log(`[server] Sales Call Analyzer running at http://localhost:${PORT}`);
});
