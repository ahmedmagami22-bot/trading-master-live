# Trading Master Live V2.4.1 Setup

This version combines:
- Supabase email/password login
- Twelve Data paid-plan friendly polling
- All timeframes refreshed together every 5 seconds
- Multi-timeframe table updated every 5 seconds
- Central real PIPS saved in Supabase via trade_events
- Backend memory cache for Twelve Data to reduce duplicate requests

## 1) Supabase SQL

Run this in Supabase > SQL Editor > New query:

```sql
create table if not exists public.trade_events (
  event_key text primary key,
  tf text not null,
  signal_key text not null,
  event_type text not null,
  sig text,
  pips integer not null default 0,
  day text not null,
  month text not null,
  source_email text,
  created_at timestamptz not null default now()
);

create index if not exists trade_events_day_idx on public.trade_events(day);
create index if not exists trade_events_month_idx on public.trade_events(month);
create index if not exists trade_events_tf_idx on public.trade_events(tf);

alter table public.trade_events enable row level security;
```

## 2) Vercel Environment Variables

Keep:
- TWELVE_DATA_API_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY

Add:
- SUPABASE_SERVICE_ROLE_KEY
- TWELVE_CACHE_MS = 3000

Do not share SUPABASE_SERVICE_ROLE_KEY publicly.

## 3) Upload files to GitHub

Upload:
- api/check-auth.js
- api/login.js
- api/logout.js
- api/trade-events.js
- api/twelvedata.js
- public/index.html
- public/login.html
- package.json
- README_DEPLOY.md
- vercel.json
- SETUP_V241.md

Do not upload middleware.js.
