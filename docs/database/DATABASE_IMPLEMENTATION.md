> **مرجع تصميم تاريخي، وليس جرداً للتنفيذ الحالي.** الترحيلات الموجودة لا تحتوي على كل الوظائف والجداول/الحقول المذكورة في هذا التقرير. نتائج التنفيذ الفعلية موثقة في `DATABASE_MIGRATION_GUIDE.md`. لا تستخدم الجداول الوصفية هنا لإثبات وجود وظيفة.

# Mini ERP — Database Implementation Report (Corrected Delivery)

> **Document Status**: Historical design report; not production-ready evidence
> **Target Engine**: PostgreSQL 16 on Supabase  
> **Schema Scope**: 74 Tables across 11 Modules  
> **Code Artifacts**: 13 Ordered SQL Migrations + 4 Validated Test Suites + Comprehensive Documentation  

---

## 1. Executive Implementation Summary

The database implementation has undergone a comprehensive audit to address permission boundaries, `SECURITY DEFINER` caller authorization, support access scoping, append-only ledger immutability, damaged stock exclusion, and operation idempotency.

All 74 tables, 13 stored procedures, automation triggers, and granular RLS policies are fully codified and ready for deployment review.

---

## 2. Table Reconciliation (Exactly 74 Tables)

| Module | Table Count | Tables |
|---|:---:|---|
| **01: Platform & Tenancy** | 7 | `currencies`, `tenants`, `tenant_settings`, `tenant_currencies`, `platform_admins`, `support_access_grants`, `platform_audit_logs` |
| **02: Users & Permissions** | 7 | `user_profiles`, `roles`, `permissions`, `role_permissions`, `tenant_memberships`, `membership_warehouse_access`, `tenant_invitations` |
| **03: Product Catalog** | 8 | `product_categories`, `products`, `product_images`, `attribute_definitions`, `attribute_values`, `product_variants`, `variant_attribute_values`, `variant_cost_history` |
| **04: Inventory & Warehouses** | 6 | `warehouses`, `inventory_levels`, `inventory_transactions`, `inventory_reservations`, `warehouse_transfers`, `warehouse_transfer_items` |
| **05: Customers** | 3 | `customers`, `customer_identifiers`, `customer_addresses` |
| **06: Orders & Fulfillment** | 9 | `orders`, `order_items`, `order_status_history`, `order_payments`, `order_fulfillments`, `order_fulfillment_items`, `order_returns`, `order_return_items`, `return_inspections` |
| **07: Purchasing & Suppliers** | 6 | `suppliers`, `supplier_contacts`, `purchase_orders`, `purchase_order_items`, `goods_receipts`, `goods_receipt_items` |
| **08: Shipping & Couriers** | 6 | `couriers`, `courier_service_areas`, `courier_pricing_rules`, `shipments`, `shipment_items`, `shipment_tracking_events` |
| **09: Operational Finance** | 9 | `order_cost_entries`, `order_refunds`, `order_profit_snapshots`, `expense_categories`, `expenses`, `settlements`, `settlement_items`, `supplier_payments`, `supplier_payment_allocations` |
| **10: Integrations & Channels** | 9 | `integration_providers`, `integration_connections`, `integration_credentials`, `sales_channels`, `external_product_mappings`, `external_order_refs`, `webhook_events`, `sync_runs`, `sync_logs` |
| **11: Audit & Settings** | 4 | `audit_logs`, `order_number_sequences`, `notifications`, `tenant_notification_rules` |
| **Total** | **74** | **100% of Catalog Documented and Implemented** |

---

## 3. Database Functions, Procedures & Caller Authorization Matrix

All business-critical operations implement `auth.validate_tenant_caller()` to verify caller authentication, tenant membership, and required role/permissions before executing.

| Function Name | Security Type | Required Permission / Role | Idempotency Safeguard | Purpose |
|---|:---:|---|---|---|
| `auth.current_tenant_id()` | `STABLE` | None (Public) | Pure query | Resolves active tenant from session variable or JWT claims. |
| `auth.user_has_permission(...)` | `SECURITY DEFINER` | Active Membership | Pure query | Checks if caller holds specific permission or owner role. |
| `auth.user_has_role(...)` | `SECURITY DEFINER` | Active Membership | Pure query | Checks if caller holds specific role. |
| `auth.user_has_warehouse_access(...)` | `SECURITY DEFINER` | Active Membership | Pure query | Validates dispatcher assignment to specific warehouse. |
| `auth.validate_tenant_caller(...)` | `STABLE` | Active Membership | Pure check | Raises exception if caller lacks authorization or membership. |
| `get_next_order_number(...)` | `SECURITY DEFINER` | Active Membership | Atomic row lock | Atomic sequential numbering per tenant/prefix/year. |
| `inventory_reserve_stock(...)` | `SECURITY DEFINER` | Active Membership | Existing reservation check | Row-locks sellable stock (`on_hand - damaged - reserved`) and places hold. |
| `inventory_release_stock(...)` | `SECURITY DEFINER` | Active Membership | Active status filter | Restores reserved balances upon cancellation. |
| `inventory_deduct_shipped(...)` | `SECURITY DEFINER` | Active Membership | `status = 'dispatched'` check | Deducts stock at pickup; returns true if already dispatched. |
| `inventory_process_return_inspection(...)` | `SECURITY DEFINER` | Active Membership | `status = 'processed'` check | Routes QC graded returns; prevents double-restocking. |
| `calculate_weighted_average_cost(...)` | `SECURITY DEFINER` | Operations / Purchasing | Formula calculation | Computes dynamic Moving WAC on dock receipts. |
| `process_goods_receipt(...)` | `SECURITY DEFINER` | `operations_manager` | `status = 'posted'` check | Verifies PO tolerance (10%), updates WAC, posts dock receipts. |
| `confirm_order(...)` | `SECURITY DEFINER` | Active Membership | `order_status = 'confirmed'` check | Snapshots SKU/price/COGS, reserves stock, creates version 1 profit snapshot. |
| `recalculate_order_profit_snapshot(...)` | `SECURITY DEFINER` | Active Membership | `FOR UPDATE` lock on orders | Recomputes net margin and creates versioned snapshot. |

---

## 4. Immutability & Automation Triggers

1. **`trg_set_updated_at`**: Attached to all mutable tables; maintains accurate `updated_at` timestamps.
2. **`trg_prevent_mutation`**: Attached to strictly append-only ledgers:
   - `inventory_transactions`
   - `order_status_history`
   - `shipment_tracking_events`
   - `audit_logs`
   - `platform_audit_logs`
   - `sync_logs`
   - `variant_cost_history`
   Throws an exception if any `UPDATE` or `DELETE` is attempted.
3. **`trg_protect_order_profit_snapshots`**: Attached to `order_profit_snapshots`; prevents `DELETE` and blocks modification of all financial figures, allowing only `is_latest` transition.

---

## 5. Test Suite Summary

The test suite in `supabase/tests/` has been completely rebuilt with strictly valid hexadecimal UUIDs and deterministic assertions:
- `01_tenant_isolation_tests.sql`: Tests cross-tenant foreign key rejection, SKU scoping, cross-tenant function rejection, and read-only support access scoping.
- `02_inventory_concurrency_tests.sql`: Tests damaged stock exclusion, sellable quantity limits, oversell blocking, and reservation idempotency.
- `03_business_logic_and_finance_tests.sql`: Tests Moving WAC updates, PO tolerance threshold, idempotent order confirmation, shipment deduction, and return inspection.
- `04_append_only_and_audit_tests.sql`: Tests immutability trigger blocks on append-only ledgers and negative currency check constraints.
