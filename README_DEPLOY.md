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
