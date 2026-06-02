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
