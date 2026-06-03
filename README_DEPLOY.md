# Trading Master Live Dashboard V2

نسخة V2 التجريبية من داشبورد XAU/USD.

## الجديد في V2
- إضافة فريم M5.
- تحديث تلقائي كل دقيقة.
- نقل TradingView تحت الشارت الرئيسي.
- تحويل مكان TradingView القديم إلى جدول متابعة متعدد الفريمات.
- إزالة Volume وإضافة BOS وWave Number.
- إضافة TP1 / TP2 / TP3.
- إضافة FVG+ / FVG-.
- إضافة Elliott Wave داخل SMC/Confirmation.
- تضييق Entry Zone حسب الفريم: M5=3$، M15=5$، H1=8$، H4=12$، D1=15$.

## Environment Variable
على Vercel أضف:

```
TWELVE_DATA_API_KEY=your_key_here
```

## ملاحظات مهمة
التحديث كل دقيقة على 5 فريمات يستهلك طلبات كثيرة من Twelve Data، لذلك يفضل استخدام خطة مناسبة قبل الإطلاق للعملاء.


## V2.2 Optimized API Usage
- Active timeframe refresh: every 60 seconds.
- Multi-timeframe table refresh: every 15 minutes.
- Backend cache: 60 seconds with stale-while-revalidate to reduce Twelve Data credit usage.
- Frontend session cache: prevents duplicate requests inside the same minute.
- TradingView remains live for visual monitoring.


## V2.3 Secure Login + UI
Required Vercel Environment Variables:
- TWELVE_DATA_API_KEY
- DASHBOARD_USER
- DASHBOARD_PASS
- DASHBOARD_AUTH_TOKEN

This version adds:
- Login page before opening the dashboard.
- Protected dashboard with Vercel Middleware.
- Protected Twelve Data backend endpoint.
- Improved performance table, summary strip, and trade lifecycle rows.


## V2.3.1 Login Build Fix
- Removed Vercel Middleware because this project is deployed as a static/API setup and middleware caused a build error.
- Added `/api/check-auth` for login verification.
- Dashboard redirects to `/login.html` if not logged in.
- Twelve Data API remains protected server-side by the auth cookie.
- Added Logout button.


## V2.3.2 Layout Fix
- Moved the Multi-Timeframe Signal Table to full-width below the main dashboard grid.
- Enlarged the performance table and summary cards.
- Moved chart labels to the right side for better readability.
- Improved spacing and responsive layout.
- Login system remains active.


## V2.3.3 Refinements
- Moved logout button to bottom-left so it no longer distracts from the header.
- Enlarged the left signal panel to visually balance the TradingView area.
- Added Current Trade Snapshot under TradingView.
- Centered metric labels in the first column of the multi-timeframe table.
- Removed unnecessary "Moved under chart" label.


## V2.3.4 Clean Layout
- Converted logout button to icon-only with hover label.
- Reduced the empty space on the left side by compacting the signal panel.
- Reduced TradingView height and compacted Current Trade Snapshot.
- Kept the full-width multi-timeframe table.


## V2.3.5 Full-width TradingView
- Removed Current Trade Snapshot block.
- Moved TradingView to a full-width section under the main chart/grid.
- Reduced empty space on the left by separating TradingView from the side panel.
- Changed logout to a fixed user-icon button with hover label.


## V2.3.6 Supabase Auth
This version replaces the single shared username/password login with Supabase email/password authentication.

### Vercel Environment Variables
Keep:
- TWELVE_DATA_API_KEY

Add:
- SUPABASE_URL = https://boofaksowdohnzapcwhr.supabase.co
- SUPABASE_ANON_KEY = sb_publishable_JdMEz9pwOafCtTUz6PBS0A_eEAQS5qA

You can remove later if unused:
- DASHBOARD_USER
- DASHBOARD_PASS
- DASHBOARD_AUTH_TOKEN

### Supabase
Create users manually from Authentication → Users.
Sign up is not exposed in the dashboard login page.


## V2.3.7 Supabase Loop Fix
- Removed the old `/api/check-auth` page guard that was conflicting with Supabase Auth.
- Stabilized Supabase session persistence using localStorage, autoRefreshToken and detectSessionInUrl.
- Fixed redirect loop between `/` and `/login.html`.


## V2.3.8 Table Sync Fix
- Fixed table mismatch between devices.
- Removed localStorage dependency for tradeState, which was causing each device to calculate different table results.
- Demo data is now deterministic across devices.
- Clears old local trade state once on first load.
- Note: Daily/Monthly PIPS are currently calculated from the current signal only. For real account-wide daily/monthly history, the next step is central storage in Supabase.


## V2.3.9 Real Central PIPS via Supabase

### Supabase SQL
Run this in Supabase SQL Editor:

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

### Vercel Secret
Add:
- SUPABASE_SERVICE_ROLE_KEY

Keep it server-side only. Never expose it publicly.


## V2.4.0 Live All Frames
- All timeframes update together every 5 seconds.
- The table updates every 5 seconds from the same data snapshot.
- Active chart updates from the refreshed timeframe set.
- Backend memory cache defaults to 3 seconds via `TWELVE_CACHE_MS` to reduce duplicate upstream calls when multiple clients open the dashboard.
- Because Twelve Data REST candle data typically updates around minute-level, this is near-live polling. True tick-by-tick streaming requires WebSocket integration.


## V2.4.1 Live All Frames + Real Supabase PIPS
This is the recommended base version:
- All timeframes update together every 5 seconds.
- Multi-timeframe table updates every 5 seconds.
- Central real PIPS stored in Supabase `trade_events`.
- Duplicate TP/SL events are prevented by `event_key`.
- Backend Twelve Data memory cache defaults to 3 seconds via `TWELVE_CACHE_MS`.

Required before production use:
1. Create `trade_events` table in Supabase using SETUP_V241.md.
2. Add `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
3. Add optional `TWELVE_CACHE_MS=3000` in Vercel.


## V2.4.2 Force Live All Frames
- Removed old UI warning text that still said active frame every 1 minute and table every 15 minutes.
- Forced one unified loop: `refreshAllLive()` every 5 seconds.
- Added cache-buster query param from browser while keeping backend memory cache.
- Browser fetch uses `cache: no-store`.
- API response has no-cache headers to avoid stale browser/CDN behavior.


## V2.4.3 Reset From Now
- Prevents historical candles from immediately re-creating TP/SL events after `truncate trade_events`.
- After reset, the table starts from live/current data only.
- This helps validate the dashboard from a clean zero state.

## V2.4.4 Real Market No Demo
- Disabled Demo Mode fallback to prevent fake/non-market prices.
- Added Twelve Data `price` endpoint for the live current price.
- Merges live price into the latest candle for every timeframe.
- Refreshes all timeframes every 5 seconds, not just missing/active frames.
- If Twelve Data fails, dashboard shows API Error instead of fake values.

## V2.4.5 Real Price Fallback
- Fixes API Error when Twelve Data `/price` endpoint rejects XAU/USD.
- `/api/twelvedata?endpoint=price` now tries:
  1. Twelve Data `/price`
  2. Fallback to latest `1min` time_series close
- Demo Mode remains disabled.
- Dashboard will not display fake prices.
