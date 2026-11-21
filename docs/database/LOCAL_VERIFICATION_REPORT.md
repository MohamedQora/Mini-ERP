# تقرير التحقق المحلي

**التاريخ:** 2026-11-21 (Africa/Cairo)  
**الهدف:** Supabase / PostgreSQL 16  
**البيئة التي اختُبرت فعلياً:** Supabase CLI 3.2.0، PostgreSQL 17.12 محلي عبر Docker  
**الحكم:** اجتاز التحقق المحلي المحدود؛ PostgreSQL 16 والإنتاج غير معتمدين.

## تشغيل قاعدة البيانات

أعيد إنشاء قاعدة Docker المحلية عبر `supabase db reset`، ثم طُبقت الملفات التالية بالترتيب دون خطأ:

1. `01_platform_tenancy.sql`
2. `02_users_permissions.sql`
3. `03_product_catalog.sql`
4. `04_inventory_customers.sql`
5. `05_orders_fulfillment.sql`
6. `06_purchasing_shipping.sql`
7. `07_finance_integrations_audit_rls.sql`
8. `08_security_rbac_and_app_compatibility.sql`

احتاج CLI إلى `SUPABASE_DB_MAJOR_VERSION=17` في جلسة PowerShell؛ إذ يرفض `db.major_version=16`. بقي ملف الإعداد المستهدف على 16.

## فحوص الكتالوج

| الفحص | النتيجة |
|---|---:|
| نسخة PostgreSQL | 17.12 |
| جداول `public` الأساسية | 74 |
| جداول تحمل `tenant_id` | 67 |
| جداول المستأجر دون RLS | 0 |
| سياسات `public` | 71 |

## نتائج التنفيذ

- `01_tenant_isolation_tests.sql` — ناجح.
- `02_inventory_concurrency_tests.sql` — ناجح؛ اختبار تتابعي، وليس اختبار سباق متعدد الاتصالات.
- `03_business_logic_and_finance_tests.sql` — ناجح.
- `04_append_only_and_audit_tests.sql` — ناجح.
- `05_security_rls_hardening_tests.sql` — ناجح.
- `06_runtime_rls_and_privilege_tests.sql` — ناجح.
- مشغل PowerShell ومشغل Bash لمجموعات SQL الست — ناجحان. فحص `bash -n` للسكربتات الأربعة — ناجح.
- `npm run typecheck` و`npm run build` داخل `frontend/` — ناجحان.
- تشغيل HTTP محلي على `http://127.0.0.1:3001`: `/login` أعاد 200 مع نموذج كلمة مرور؛ `POST /api/tenant/switch` دون جلسة أعاد 401.
- فُحصت ملفات JavaScript المبنية: لا تحتوي عنوان Supabase السحابي المحدد في `.env.local`، وتحتوي عنوان API المحلي.

## حدود مهمة

- جرى الاختبار على PostgreSQL 17.12 فقط؛ لم يُختبر PostgreSQL 16.
- لم تُختبر جلسات متزامنة حقيقية أو دورة الشراء والشحن والمرتجعات والتسويات كاملة.
- لا يغطي الاختبار مصفوفة الأدوار والمستودعات كاملة، وكتابة جداول الأعمال عبر `authenticated` معطلة حتى تنفيذ مسارات خادمية آمنة.
- لم يُتصل بمشروع Supabase السحابي ولم تُطبق عليه تغييرات. خادم الواجهة المحلي يستخدم عنوان ومفاتيح Supabase المحلية عبر متغيرات العملية؛ لم يتغير `frontend/.env.local`.
