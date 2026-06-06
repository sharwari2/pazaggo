# Pazaggo — Tara Finance Research Agent

## What is this?
Tara is a personal finance research agent that answers natural language questions about spending and investments using real data from Postgres.

## Setup

### Prerequisites
- Node.js 18+
- Postgres 14+

### Install
```bash
npm install
```

### Environment Variables
Create a `.env` file:
GOOGLE_GENERATIVE_AI_API_KEY=your_key
DATABASE_URL=postgresql://user:password@host:5432/provue_tara
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=provue_tara

### Ingest Data
```bash
DATA_DIR=./data/sample_a npx tsx scripts/ingest.ts
```

### Run Locally
```bash
npx tsx server.js
```

### Run Evals
Make sure server is running, then:
```bash
node eval.js
```

## API

### POST /ask
Request:
```json
{ "question": "How much did I spend on food in January 2025?" }
```
Response:
```json
{ "answer": "You spent ₹X on food in January 2025." }
```

## Tech Stack
- Mastra SDK (TypeScript) — agent, tools, orchestration
- Postgres 14 — storage layer
- Google Gemini 2.5 Flash Lite — LLM
- Express — HTTP server

## Tools
- **query-transactions** — filters transactions by date, category, merchant
- **get-fund-return** — computes fund NAV-based period return
- **get-portfolio-value** — computes portfolio value and profit across holdings

## Deployed URL
https://pazaggo.onrender.com

## Model Provider
Google Gemini 2.5 Flash Lite via @ai-sdk/google

## Postgres
- Local: provue_tara on localhost:5432
- Deployed: Render Postgres

## Known Limitations
- Free tier LLM rate limit of 20 requests/day on Gemini
- Cold start latency on Render free tier (~30s first request)
- Merchant alias matching uses simple LIKE, may miss complex variants