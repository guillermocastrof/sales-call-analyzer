// ── Utilities ───────────────────────────────────────────────────────────────

function scoreClass(s) {
  if (s >= 80) return 'score-green';
  if (s >= 50) return 'score-yellow';
  return 'score-red';
}

function scoreColor(s) {
  if (s >= 80) return 'var(--green)';
  if (s >= 50) return 'var(--yellow)';
  return 'var(--red)';
}

function sentimentClass(s) {
  if (s === 'positive') return 'badge-positive';
  if (s === 'negative') return 'badge-negative';
  return 'badge-neutral';
}

function statusClass(s) {
  if (s === 'done') return 'badge-done';
  if (s === 'analyzing') return 'badge-analyzing';
  if (s === 'error') return 'badge-error';
  return 'badge-pending';
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => { t.className = 'toast'; }, 2500);
}

function fmtDate(d) {
  if (!d) return '—';
  return d.split('T')[0];
}

// ── Upload Panel ─────────────────────────────────────────────────────────────

function toggleUpload() {
  const body = document.getElementById('upload-body');
  const chevron = document.getElementById('upload-chevron');
  const isOpen = body.classList.toggle('open');
  chevron.classList.toggle('open', isOpen);
}

function switchTab(tab, el) {
  document.querySelectorAll('.upload-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tab-paste').style.display = tab === 'paste' ? '' : 'none';
  document.getElementById('tab-file').style.display = tab === 'file' ? '' : 'none';
}

function setUploadStatus(msg, type = 'info') {
  const el = document.getElementById('upload-status');
  el.textContent = msg;
  el.className = `upload-status show ${type}`;
  if (!msg) el.className = 'upload-status';
}

async function submitPaste() {
  const title = document.getElementById('paste-title').value.trim() || 'Untitled Call';
  const transcript = document.getElementById('paste-transcript').value.trim();
  const date = document.getElementById('paste-date').value;

  if (!transcript) { setUploadStatus('Please paste a transcript.', 'error'); return; }

  setUploadStatus('Submitting for analysis…', 'info');

  try {
    const res = await fetch('/api/calls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, transcript, date }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');

    setUploadStatus(`✓ Submitted "${data.title}". Analyzing…`, 'info');
    document.getElementById('paste-transcript').value = '';
    document.getElementById('paste-title').value = '';
    loadCalls();
  } catch (e) {
    setUploadStatus(e.message, 'error');
  }
}

async function submitFile() {
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];
  if (!file) { setUploadStatus('Please select a .txt file.', 'error'); return; }

  const formData = new FormData();
  formData.append('file', file);
  const title = document.getElementById('file-title').value.trim();
  const date = document.getElementById('file-date').value;
  if (title) formData.append('title', title);
  if (date) formData.append('date', date);

  setUploadStatus('Uploading…', 'info');

  try {
    const res = await fetch('/api/calls/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');

    setUploadStatus(`✓ Uploaded "${data.title}". Analyzing…`, 'info');
    fileInput.value = '';
    loadCalls();
  } catch (e) {
    setUploadStatus(e.message, 'error');
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

async function deleteCall(id, title) {
  if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
  try {
    await fetch(`/api/calls/${id}`, { method: 'DELETE' });
    showToast('Call deleted');
    loadCalls();
    loadStats();
  } catch (e) {
    showToast('Delete failed', 'error');
  }
}

// ── Render calls table ────────────────────────────────────────────────────────

let pollTimer = null;

function renderCalls(calls) {
  const tbody = document.getElementById('calls-tbody');
  const notice = document.getElementById('analyzing-notice');

  const hasAnalyzing = calls.some(c => c.status === 'analyzing' || c.status === 'pending');
  notice.classList.toggle('show', hasAnalyzing);

  if (!calls.length) {
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <div class="empty-icon">📞</div>
          <div class="empty-text">No calls yet</div>
          <div>Upload a transcript above to get started</div>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = calls.map(call => {
    const a = call.analysis || {};
    const score = a.overall_score ?? null;
    const sentiment = a.sentiment || null;
    const closeProb = a.close_probability ?? null;

    return `
      <tr>
        <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          <a href="/call.html?id=${call.id}">${esc(call.title)}</a>
        </td>
        <td style="color:var(--muted)">${fmtDate(call.date)}</td>
        <td>${score !== null
          ? `<span class="score-pill ${scoreClass(score)}">${score}</span>`
          : '<span style="color:var(--muted)">—</span>'}</td>
        <td>${sentiment
          ? `<span class="badge ${sentimentClass(sentiment)}">${sentiment}</span>`
          : '<span style="color:var(--muted)">—</span>'}</td>
        <td>${closeProb !== null
          ? `<span style="color:${scoreColor(closeProb)};font-weight:600">${closeProb}%</span>`
          : '<span style="color:var(--muted)">—</span>'}</td>
        <td><span class="badge ${statusClass(call.status)}">${call.status}</span></td>
        <td>
          <div style="display:flex;gap:6px;align-items:center">
            <a href="/call.html?id=${call.id}" class="btn btn-ghost btn-sm">View</a>
            <button class="btn btn-icon btn-sm" onclick="deleteCall(${call.id}, '${esc(call.title).replace(/'/g,"\\'")}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadCalls() {
  try {
    const res = await fetch('/api/calls');
    const calls = await res.json();
    renderCalls(calls);

    // Auto-poll if any call is pending/analyzing
    const needsPoll = calls.some(c => c.status === 'analyzing' || c.status === 'pending');
    if (needsPoll) {
      clearTimeout(pollTimer);
      pollTimer = setTimeout(() => { loadCalls(); loadStats(); }, 5000);
    } else {
      clearTimeout(pollTimer);
    }
  } catch (e) {
    document.getElementById('calls-tbody').innerHTML =
      `<tr><td colspan="7" style="color:var(--red);padding:20px">Error loading calls: ${esc(e.message)}</td></tr>`;
  }
}

// ── Stats ─────────────────────────────────────────────────────────────────────

function renderStats(s) {
  document.getElementById('stat-total').textContent = s.total_calls ?? '—';

  const scoreEl = document.getElementById('stat-score');
  if (s.avg_score != null) {
    scoreEl.innerHTML = `<span class="score-pill ${scoreClass(s.avg_score)}">${s.avg_score}</span>`;
  } else {
    scoreEl.textContent = '—';
  }

  document.getElementById('stat-talk').textContent =
    s.avg_talk_ratio != null ? `${s.avg_talk_ratio}%` : '—';

  document.getElementById('stat-close').textContent =
    s.avg_close_probability != null ? `${s.avg_close_probability}%` : '—';

  const sb = s.sentiment_breakdown || {};
  document.getElementById('stat-sentiment').innerHTML = `
    <span class="badge badge-positive">${sb.positive ?? 0} positive</span>
    <span class="badge badge-neutral">${sb.neutral ?? 0} neutral</span>
    <span class="badge badge-negative">${sb.negative ?? 0} negative</span>
  `;
}

async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const stats = await res.json();
    renderStats(stats);
  } catch (e) {
    console.warn('Failed to load stats', e);
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

// Set today's date as default for paste form
document.getElementById('paste-date').value = new Date().toISOString().split('T')[0];

loadCalls();
loadStats();
