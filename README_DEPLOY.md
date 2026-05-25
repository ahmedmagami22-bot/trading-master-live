# Trading Master — Vercel POC

نسخة تجريبية آمنة: الواجهة لا تحتوي على API Key. المفتاح يتحط في Vercel Environment Variables باسم:

`TWELVE_DATA_API_KEY`

## خطوات الرفع السريعة

1. ادخل على https://vercel.com وسجل دخول.
2. اعمل New Project.
3. ارفع فولدر المشروع أو ارفعه على GitHub واستورده.
4. من Settings > Environment Variables أضف:
   - Name: `TWELVE_DATA_API_KEY`
   - Value: مفتاح Twelve Data الخاص بك
5. اعمل Deploy.
6. افتح الرابط وجرب التحديث.

## ملاحظات

- التحديث في الواجهة كل 3 دقائق.
- السيرفر يستخدم Cache لمدة 120 ثانية لتقليل استهلاك credits.
- هذه نسخة داخلية للعرض على الشركة، وليست إطلاق عملاء نهائي.
- قبل إطلاق العملاء أضف Login وحماية وصول ومراقبة للاستهلاك.
