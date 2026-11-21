import type { DictKey, Locale } from "@/lib/i18n";

type L = Record<Locale, string[]>;
export type PlannedModule = { titleKey: DictKey; phase: Record<Locale, string>; pages: L; backend?: L };

const P3 = { en: "Phase 3", ar: "المرحلة 3" };
const P4 = { en: "Phase 4", ar: "المرحلة 4" };
const P5 = { en: "Phase 5", ar: "المرحلة 5" };

/** What each not-yet-built module will contain, and what the backend does / does not provide today. */
export const PLANNED: Record<string, PlannedModule> = {
  dashboard: { titleKey: "nav.dashboard", phase: P3,
    pages: { en: ["KPI cards: sales, orders, pending, delivered", "Revenue and sales trend", "Order status distribution", "Low-stock alerts and recent orders"], ar: ["مؤشرات: المبيعات والطلبات والمعلّقة والمُسلَّمة", "الإيرادات واتجاه المبيعات", "توزيع حالات الطلبات", "تنبيهات انخفاض المخزون وأحدث الطلبات"] },
    backend: { en: ["Read-only aggregates over orders, inventory and shipments. Demo data is shown only when the database is empty, and is labelled."], ar: ["تجميعات للقراءة فقط من الطلبات والمخزون والشحنات. تُعرض بيانات تجريبية موسومة فقط عند خلو قاعدة البيانات."] } },
  products: { titleKey: "nav.products", phase: P3,
    pages: { en: ["Products list, create, edit, details", "Categories and attributes", "Variants (size / colour / SKU / barcode / price)", "Images and variant cost history"], ar: ["قائمة المنتجات وإنشاء وتعديل وتفاصيل", "التصنيفات والخصائص", "المتغيّرات (المقاس / اللون / SKU / الباركود / السعر)", "الصور وسجل تكلفة المتغيّر"] },
    backend: { en: ["Variant cost columns are not readable by the browser; cost history needs the get_variant_cost function from a server route."], ar: ["أعمدة تكلفة المتغيّرات غير قابلة للقراءة من المتصفح؛ سجل التكلفة يحتاج دالة get_variant_cost عبر مسار خادم."] } },
  inventory: { titleKey: "nav.inventory", phase: P3,
    pages: { en: ["Inventory overview and stock levels", "Warehouses and inventory transactions", "Stock reservations", "Warehouse transfers and stock adjustments"], ar: ["نظرة عامة على المخزون ومستوياته", "المخازن وحركات المخزون", "حجوزات المخزون", "تحويلات المخازن وتسويات المخزون"] },
    backend: { en: ["Reservations and stock movements run through service-only functions, so each needs a server route that checks the exact permission first."], ar: ["الحجز وحركات المخزون تعمل عبر دوال للخادم فقط، لذا يلزم لكل منها مسار خادم يتحقق من الصلاحية أولًا."] } },
  orders: { titleKey: "nav.orders", phase: P3,
    pages: { en: ["All orders, create order, order details", "Status history, payments, fulfillments", "Returns and return inspections"], ar: ["كل الطلبات وإنشاء طلب وتفاصيل الطلب", "سجل الحالات والمدفوعات والتجهيز", "المرتجعات وفحص المرتجعات"] },
    backend: { en: ["Order, payment and fulfillment statuses stay independent. Confirming an order is a service-only function (confirm_order) and needs a server route."], ar: ["حالة الطلب والدفع والتجهيز تبقى منفصلة. تأكيد الطلب دالة للخادم فقط (confirm_order) وتحتاج مسار خادم."] } },
  customers: { titleKey: "nav.customers", phase: P3,
    pages: { en: ["Customer list, details, create, edit", "Addresses and identifiers", "Order history"], ar: ["قائمة العملاء والتفاصيل والإنشاء والتعديل", "العناوين والمعرّفات", "سجل الطلبات"] },
    backend: { en: ["Egyptian mobile numbers are normalized to +20 format in the UI helpers already."], ar: ["أرقام الموبايل المصرية تُوحَّد بصيغة ‎+20‎ في دوال الواجهة بالفعل."] } },
  purchasing: { titleKey: "nav.purchasing", phase: P4,
    pages: { en: ["Suppliers and contacts", "Purchase orders and creation", "Goods receipts and details"], ar: ["الموردون وجهات الاتصال", "أوامر الشراء وإنشاؤها", "إيصالات استلام البضائع وتفاصيلها"] },
    backend: { en: ["Processing a goods receipt is a service-only function (process_goods_receipt). Over-receiving tolerance and costing method still need owner sign-off."], ar: ["معالجة إيصال الاستلام دالة للخادم فقط (process_goods_receipt). نسبة الزيادة المسموحة وطريقة التكلفة تحتاجان اعتماد المالك."] } },
  shipping: { titleKey: "nav.shipping", phase: P4,
    pages: { en: ["Couriers, service areas, pricing rules", "Shipments and details", "Tracking events and COD amounts"], ar: ["شركات الشحن ومناطق الخدمة وقواعد التسعير", "الشحنات وتفاصيلها", "أحداث التتبع ومبالغ الدفع عند الاستلام"] },
    backend: { en: ["Courier cost fields are hidden from direct reads; finance views use get_shipment_costs."], ar: ["حقول تكلفة الشحن مخفية عن القراءة المباشرة؛ شاشات المالية تستخدم get_shipment_costs."] } },
  finance: { titleKey: "nav.finance", phase: P4,
    pages: { en: ["Financial overview and order costs", "Refunds, expenses and categories", "Profit snapshots", "Courier settlements and supplier payments"], ar: ["نظرة مالية عامة وتكاليف الطلبات", "المرتجعات النقدية والمصروفات وتصنيفاتها", "لقطات الربح", "تسويات شركات الشحن ومدفوعات الموردين"] },
    backend: { en: ["COGS is read through get_order_cogs / get_order_item_cogs only. Currency display follows the tenant's enabled currencies, EGP by default."], ar: ["تكلفة البضاعة تُقرأ عبر get_order_cogs / get_order_item_cogs فقط. عملة العرض حسب عملات العلامة المفعّلة، والجنيه المصري افتراضيًا."] } },
  integrations: { titleKey: "nav.integrations", phase: P5,
    pages: { en: ["Providers, connections, sales channels", "External product mappings and order references", "Webhook events, sync runs and sync logs"], ar: ["المزوّدون والاتصالات وقنوات البيع", "ربط المنتجات الخارجية ومراجع الطلبات", "أحداث الويب هوك وعمليات المزامنة وسجلاتها"] },
    backend: { en: ["Nothing is shown as connected unless a connection is actually configured."], ar: ["لن يظهر أي تكامل كمتصل ما لم يكن مُهيّأً فعليًا."] } },
  reports: { titleKey: "nav.reports", phase: P5,
    pages: { en: ["Sales, inventory, purchasing and finance reports", "Date-range filters and exports"], ar: ["تقارير المبيعات والمخزون والمشتريات والمالية", "فلاتر الفترة الزمنية والتصدير"] },
    backend: { en: ["Report definitions are not specified yet; they will be agreed with you before building."], ar: ["لم تُحدَّد تعريفات التقارير بعد؛ سيتم الاتفاق عليها معك قبل البناء."] } },
};
