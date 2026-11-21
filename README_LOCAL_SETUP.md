# إعداد Mini ERP محلياً

## المتطلبات

- Node.js وnpm لتشغيل واجهة Next.js.
- Docker Desktop يعمل.
- Supabase CLI.
- `psql` ضمن `PATH`.

## التشغيل اليومي من VS Code

افتح مجلد المشروع الرئيسي، ثم اختر **Terminal → Run Task → Mini ERP: تشغيل محلي**. أو استخدم `Ctrl+Shift+P` ثم **Tasks: Run Task** واختر المهمة نفسها. المهمة تبدأ Supabase المحلي، تمرر مفاتيحه للواجهة في بيئة العملية فقط، ثم تشغّل Next.js. لا تنفذ إعادة ضبط للقاعدة.

في أول تشغيل قد ينزل `npx` نسخة CLI المثبتة للمهمة، وقد يثبت السكربت اعتماديات الواجهة إذا لم تكن موجودة. يتطلب ذلك اتصالاً بالإنترنت في المرة الأولى. بعدها يكفي تشغيل المهمة، ثم فتح `http://localhost:3000`.

لإيقاف واجهة Next.js اضغط `Ctrl+C` في طرفية المهمة. تبقى قاعدة Docker المحلية محفوظة؛ لإيقاف خدمات Supabase يدوياً نفذ `npx --yes supabase@3.2.0 stop` من جذر المشروع.

## قاعدة Supabase المحلية

من جذر المشروع:

```powershell
supabase start
supabase db reset
```

يحذف `supabase db reset` بيانات قاعدة Docker المحلية ويعيد تطبيق ملفات `supabase/migrations/`. لا تستخدمه مع قاعدة بعيدة.

**قيد إصدار PostgreSQL:** المخطط يستهدف PostgreSQL 16، لكن Supabase CLI المتاح في بيئة الفحص يرفض `db.major_version = 16` ويدعم 15 و17 فقط. جرى التحقق مؤقتاً على 17 عبر متغير جلسة PowerShell، دون تغيير `supabase/config.toml`:

```powershell
$env:SUPABASE_DB_MAJOR_VERSION = '17'
supabase start
supabase db reset
```

هذا اختبار توافق على PostgreSQL 17 ولا يحل محل تحقق PostgreSQL 16. لا تغيّر إصدار قاعدة المشروع السحابية لهذا السبب.

## تشغيل مجموعات SQL على Windows

بعد بدء Supabase وتطبيق الترحيلات:

```powershell
./scripts/run_tests_local.ps1
```

لتطبيق ملفات SQL مباشرة بواسطة `psql` عند الحاجة:

```powershell
./scripts/apply_migrations_local.ps1
```

كلا السكربتين يرفضان أي `DATABASE_URL` لا يشير إلى `localhost` أو `127.0.0.1` على المنفذ `54322`. ملفات الاختبار تستخدم معاملات وتتراجع عن بياناتها، لكنها لا تختبر سباقات جلسات متزامنة.

## تشغيل الواجهة على Supabase المحلي

انسخ `frontend/.env.example` إلى `frontend/.env.local`، ثم استبدل القيم التجريبية بقيم Supabase المحلي. احتفظ بمفاتيح المشروع السحابي في مكان منفصل، ولا تستخدم مفتاح الخدمة في المتصفح.

```powershell
Set-Location frontend
npm ci
npm run dev
```

افتح `http://localhost:3000`. متغيرات البيئة الموجودة في `.env.local` خاصة بكل بيئة؛ راجع عنوان Supabase قبل بدء التشغيل حتى لا توجّه التطبيق إلى مشروع غير مقصود.

## البناء والتحقق السريع

```powershell
npm run typecheck
npm run build
```

نفّذ الأوامر من `frontend/`. تطبيق `my-next-app/` قالب Next.js منفصل غير موصول بقاعدة ERP؛ التطبيق المرتبط بالمخطط هو `frontend/`.
