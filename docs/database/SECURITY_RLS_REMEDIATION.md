# إصلاح الأمان وRLS — الترحيل 08

## التغييرات المنفذة

- `public.current_tenant_id()` يقرأ `app_metadata.tenant_id` من JWT، بدلاً من اعتبار GUC يحدده العميل مصدراً للهوية.
- `public.user_has_permission(tenant_id, code)` يتحقق من المستأجر النشط والعضوية النشطة وربط الدور بالصلاحية.
- تستبدل سياسات القراءة العامة بسياسات صلاحيات حسب الوحدة. لا توجد سياسات كتابة مباشرة للمستخدم `authenticated` على جداول الأعمال حتى تُنفذ عمليات خادمية لكل سير عمل.
- جداول `integration_credentials` و`tenant_invitations` server-only. حُجبت `current_cost` و`unit_cogs_snapshot` و`shipments.shipping_cost`، وأضيف `product_variants.current_cost` كحقل تكلفة داخلي.
- أضيفت رموز أدوار أولية: owner، operations_manager، warehouse_dispatcher، accountant.
- سحب EXECUTE لدوال الحجز وتخصيص أرقام الطلب من `PUBLIC` و`anon` و`authenticated` ومنحها لـ `service_role`.

## حدود الإصلاح

- قائمة الأدوار والصلاحيات ابتدائية وليست مصفوفة معتمدة من مالك المنتج.
- صلاحيات المخازن والدعوات وsupport grants غير مكتملة.
- الاعتماد على `service_role` يتجاوز RLS؛ يجب لكل route خادمي التحقق من هوية المستخدم والعضوية والصلاحية قبل استدعاء أي وظيفة.
- الاختبارات الحالية اجتازت على PostgreSQL 17 محلياً، وليس 16، ولا تغطي جلسات متزامنة أو كل مسارات التصعيد.
