# دليل ترحيل قاعدة البيانات والتحقق

**الهدف المعماري:** Supabase / PostgreSQL 16. **الحالة المسجلة:** bootstrap ومجموعات الاختبار الست اجتازت على Supabase محلي بإصدار PostgreSQL 17. لم يُتحقق من الإصدار 16 بعد.

تفاصيل نسخة CLI والكتالوج والاختبارات وطلب HTTP المحلي في [تقرير التحقق المحلي](LOCAL_VERIFICATION_REPORT.md).

## الملفات الموجودة

- 8 ملفات ترحيل فعلية: `01` إلى `08`، و74 جدولاً في جداول الأساس قبل الإضافات الأمنية.
- 6 ملفات SQL اختبارية، تعمل بترتيب الاسم وتتوقف عند أول خطأ.
- ملفا تشغيل PowerShell لـ Windows، إضافة إلى نسخ Bash.

## الحماية

استخدم قاعدة محلية مؤقتة فقط. لا تطبق السكربتات على إنتاج أو قاعدة مشتركة. لا تعدّل ترحيلاً سبق تطبيقه في بيئة دائمة؛ أنشئ ترحيلاً أمامياً جديداً.

## تحقق Supabase المحلي

```powershell
$env:SUPABASE_DB_MAJOR_VERSION = '17'
supabase start
supabase db reset
./scripts/run_tests_local.ps1
```

الإصدار 17 هنا تجاوز مؤقت لجلسة CLI؛ لا يغير `supabase/config.toml`. إصدار CLI الذي فُحص يقبل PostgreSQL 15 و17 ولا يقبل 16، لذا يلزم تحقق مستقل على PostgreSQL 16 قبل ادعاء مطابقة الإصدار المعماري.

لعرض معلومات الكتالوج بعد الترحيل:

```sql
SELECT version();
SELECT count(*) AS public_tables
FROM information_schema.tables
WHERE table_schema='public' AND table_type='BASE TABLE';
SELECT schemaname, tablename FROM pg_tables
WHERE schemaname='public' AND rowsecurity IS NOT TRUE;
SELECT policyname, tablename, cmd, roles, qual, with_check
FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname;
```

## ما تثبته الاختبارات وما لا تثبته

الاختبارات الستة تغطي عزل المستأجر ومفاتيح العلاقات المركبة، حجز المخزون بالتتابع وإعادة المحاولة، قيود الطلبات المالية، عدم قابلية دفاتر محددة للتعديل، امتيازات الكتالوج، وقراءة RLS تحت دور `authenticated`.

لا تثبت هذه الحزمة سباقات الجلسات المتزامنة أو دورة شراء/شحن/إرجاع/تسوية مكتملة. توجد وظائف تدفق عمل غير منفذة، منها خصم المخزون عند الاستلام من شركة الشحن، ومعالجة الاستلامات والمرتجعات، وإعادة احتساب الربح. لا تعتمد النظام للإنتاج قبل تنفيذ هذه التدفقات والتحقق منها.
