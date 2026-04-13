# Sales Call Analyzer

AI-powered sales call analysis using Claude. Paste or upload call transcripts and get instant coaching feedback: scores, sentiment, objections, strengths, weaknesses, and actionable tips.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set environment variables
```bash
export OPENCLAW_GATEWAY_TOKEN=your_token_here
```

Or create a `.env` file and source it (the app reads `process.env.OPENCLAW_GATEWAY_TOKEN`).

### 3. Run
```bash
npm start
# or
node server.js
```

App runs at **http://localhost:3335**

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENCLAW_GATEWAY_TOKEN` | Yes | Bearer token for the OpenClaw Claude gateway |
| `PORT` | No | Server port (default: 3335) |

---

## Circleback Webhook Integration

Point your Circleback webhook at:
```
POST http://your-server:3335/api/calls/webhook
```

The webhook accepts JSON with any of these fields:
- `title` — call title
- `transcript` — full transcript text (preferred)
- `summary` — used if `transcript` is missing
- `date` — ISO date string
- `participants` — ignored (for future use)

Example payload:
```json
{
  "title": "Acme Corp Discovery",
  "transcript": "Salesperson: Hello...\nClient: Hi...",
  "date": "2024-01-15"
}
```

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/calls` | Submit transcript as JSON |
| `POST` | `/api/calls/upload` | Upload .txt file (multipart) |
| `POST` | `/api/calls/webhook` | Circleback webhook endpoint |
| `GET` | `/api/calls` | List all calls |
| `GET` | `/api/calls/:id` | Get single call with analysis |
| `DELETE` | `/api/calls/:id` | Delete a call |
| `GET` | `/api/stats` | Aggregate stats across all calls |

---

## Analysis Fields

Each call is analyzed for:
- **Overall Score** (0-100)
- **Close Probability** (0-100%)
- **Sentiment** (positive / neutral / negative)
- **Client Sentiment**
- **Talk Ratio** (% salesperson spoke)
- **Summary**, **Strengths**, **Weaknesses**
- **Objections Raised**, **Client Pain Points**
- **Next Steps**, **Coaching Tips**, **Key Topics**
