# DESIGN.md — Tara: Finance Research Agent

## 1. Postgres Schema

### Tables

**transactions**
- id (TEXT, PRIMARY KEY)
- date (TIMESTAMPTZ)
- merchant (TEXT)
- category (TEXT)
- amount (NUMERIC)
- currency (TEXT)
- memo (TEXT)
- Indexes: date, category, merchant

**funds**
- id (TEXT, PRIMARY KEY)
- name (TEXT)
- category (TEXT)

**fund_nav**
- fund_id (TEXT, FK → funds.id)
- nav_date (DATE)
- nav (NUMERIC)
- PRIMARY KEY (fund_id, nav_date)
- Index: fund_id, nav_date

**holdings**
- id (TEXT, PRIMARY KEY)
- fund_id (TEXT, FK → funds.id)
- fund_name (TEXT)
- units (NUMERIC)
- purchase_date (DATE)
- purchase_nav (NUMERIC)

## 2. Tool Design

Three tools, each expressive and parameterized:

**query-transactions** — filters transactions by date, category, merchant. Returns total spend and count. Excludes transfers by default. Uses date::date casting to handle UTC offset.

**get-fund-return** — computes NAV-based period return for a fund between two dates. Returns startNav, endNav, returnPct.

**get-portfolio-value** — computes current value, invested amount, and profit across all holdings using latest NAV vs purchase NAV.

Fewer tools with parameters beats many narrow tools — reduces token cost and improves tool selection accuracy.

## 3. Grounding

Every number Tara returns comes from a tool query against Postgres. The agent instructions explicitly forbid guessing. Tool results are passed back to the LLM which then forms the natural language answer.

## 4. Formulas

- **Spend**: SUM(amount) WHERE amount > 0 AND category != 'transfer'
- **Net spend**: SUM(amount) including negative refunds
- **Merchant matching**: LOWER(merchant) LIKE %term%
- **Recurring detection**: merchants appearing 2+ times per month consistently
- **Fund period return**: ((endNAV - startNAV) / startNAV) * 100
- **Holding realised return**: (units * latestNAV) - (units * purchaseNAV)

## 5. Date Handling

Dates stored as TIMESTAMPTZ in UTC. Queries use date::date casting to compare in local date space. Relative dates like "January 2025" map to startDate 2025-01-01, endDate 2025-01-31.

## 6. Evals

12 questions covering: single lookup, date filtering, refunds, merchant aliases, transfers, category comparison, recurring subscriptions, no-data cases, fund period returns, realised returns on holdings. Script sends POST /ask and compares against expected answers.

## 7. Observability

Each request logs: question, tools called, tool inputs, rows returned, latency, success/failure. Logs visible in terminal and Mastra Studio traces.

## 8. Async Milestone

Not implemented. All tools run synchronously. With more time, BullMQ would handle slow portfolio computations asynchronously with job_id tracking.

## 9. Deployment

Deployed on Render with Neon hosted Postgres. DATABASE_URL and GOOGLE_GENERATIVE_AI_API_KEY set as environment variables on the platform.

## 10. Failure Modes

- LLM rate limits on free tier
- UTC timezone offset causing date boundary mismatches
- Merchant alias variations not caught by simple LIKE matching
- Non-deterministic tool selection by LLM on ambiguous questions