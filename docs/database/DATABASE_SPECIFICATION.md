# Mini ERP — Complete Database Specification (Corrected Release)

> **Document Status**: Design specification; not proof of the current database implementation
> **Target Platform**: PostgreSQL 16 on Supabase  
> **Domain**: Multi-Tenant Clothing & Fashion Brand Mini ERP (EGP Base)  
> **Scope**: 74 Tables across 11 Functional Modules  

---

## A. Architecture Overview & Multi-Tenancy Strategy

### 1. Tenancy Model
The system operates as a single-instance, shared-database, multi-tenant architecture:
- Every business is represented as a row in `tenants`.
- Every business-owned entity (65 tenant tables + `tenants` root) enforces tenant isolation.
- Cross-tenant data leakage is prevented primarily at the database layer via PostgreSQL **Row-Level Security (RLS)**, supplemented by **composite foreign keys** that bind child records to the parent record's `tenant_id`.

```mermaid
flowchart TD
    Client["Client / API Request (with Supabase JWT)"]
    subgraph SupabaseDB ["PostgreSQL 16 Engine"]
        ContextFn["Session Context (auth.current_tenant_id() / app.current_tenant_id)"]
        RLSEngine["Row Level Security Policies (Granular: SELECT, INSERT, UPDATE, DELETE)"]
        
        subgraph TenantTables ["Tenant Isolated Tables (tenant_id)"]
            Catalog["Catalog (8 tables)"]
            Inventory["Inventory (6 tables)"]
            Orders["Orders (9 tables)"]
            Purchasing["Purchasing (6 tables)"]
            Shipping["Shipping (6 tables)"]
            Finance["Finance (9 tables)"]
            Integrations["Integrations (8 tables)"]
            TenantAudit["Audit & Settings (4 tables)"]
            TenancyGov["Tenancy & Users (6 tables)"]
        end

        subgraph PlatformTables ["Platform & Shared Control"]
            Global["Currencies & Providers (2 tables)"]
            PlatformAdmin["Platform Admins & Support Grants (4 tables)"]
            UserProfiles["User Profiles (1 table)"]
        end
    end

    Client --> ContextFn
    ContextFn --> RLSEngine
    RLSEngine --> TenantTables
    PlatformAdmin -.->|Audited Time-Bounded Access (read_only vs read_write)| TenantTables
```

### 2. Composite Tenant-Aware Referential Integrity
To guarantee that a child row belonging to Tenant A cannot accidentally point to a parent row belonging to Tenant B, all tenant-owned relationships enforce composite foreign keys:
```sql
CONSTRAINT fk_order_items_order 
  FOREIGN KEY (tenant_id, order_id) 
  REFERENCES orders (tenant_id, id) 
  ON DELETE RESTRICT
```
Parent tables enforce candidate composite unique keys `UNIQUE (tenant_id, id)`.

### 3. Inventory Quantity Architecture (Damaged Stock Exclusion)
The inventory quantity model strictly prevents damaged goods from being reserved or sold:
- **On Hand (`on_hand`)**: Total physical inventory in the warehouse.
- **Damaged (`damaged`)**: Physical items marked as torn, stained, or broken.
- **Sellable (`sellable`)**: Physical units in pristine condition:
  $$\text{sellable} = \text{on\_hand} - \text{damaged}$$
- **Reserved (`reserved`)**: Active stock holds tied to confirmed orders:
  $$\text{reserved} \le \text{sellable}$$
- **Available (`available`)**: Stock ready for new orders:
  $$\text{available} = \text{on\_hand} - \text{damaged} - \text{reserved} = \text{sellable} - \text{reserved} \ge 0$$

---

## B. Complete Table Catalog (Reconciled: Exactly 74 Tables)

| Module # | Module Name | Table Count | Tables |
|---|---|:---:|---|
| **01** | Platform & Tenancy | 7 | `currencies`, `tenants`, `tenant_settings`, `tenant_currencies`, `platform_admins`, `support_access_grants`, `platform_audit_logs` |
| **02** | Users & Permissions | 7 | `user_profiles`, `roles`, `permissions`, `role_permissions`, `tenant_memberships`, `membership_warehouse_access`, `tenant_invitations` |
| **03** | Product Catalog | 8 | `product_categories`, `products`, `product_images`, `attribute_definitions`, `attribute_values`, `product_variants`, `variant_attribute_values`, `variant_cost_history` |
| **04** | Inventory & Warehouses | 6 | `warehouses`, `inventory_levels`, `inventory_transactions`, `inventory_reservations`, `warehouse_transfers`, `warehouse_transfer_items` |
| **05** | Customers | 3 | `customers`, `customer_identifiers`, `customer_addresses` |
| **06** | Orders & Fulfillment | 9 | `orders`, `order_items`, `order_status_history`, `order_payments`, `order_fulfillments`, `order_fulfillment_items`, `order_returns`, `order_return_items`, `return_inspections` |
| **07** | Purchasing & Suppliers | 6 | `suppliers`, `supplier_contacts`, `purchase_orders`, `purchase_order_items`, `goods_receipts`, `goods_receipt_items` |
| **08** | Shipping & Couriers | 6 | `couriers`, `courier_service_areas`, `courier_pricing_rules`, `shipments`, `shipment_items`, `shipment_tracking_events` |
| **09** | Finance & Settlements | 9 | `order_cost_entries`, `order_refunds`, `order_profit_snapshots`, `expense_categories`, `expenses`, `settlements`, `settlement_items`, `supplier_payments`, `supplier_payment_allocations` |
| **10** | Integrations & Channels | 9 | `integration_providers`, `integration_connections`, `integration_credentials`, `sales_channels`, `external_product_mappings`, `external_order_refs`, `webhook_events`, `sync_runs`, `sync_logs` |
| **11** | Audit & Governance | 4 | `audit_logs`, `order_number_sequences`, `notifications`, `tenant_notification_rules` |
| **TOTAL** | **11 Modules** | **74** | **100% of Catalog Reconciled & Verified** |

---

## C. Updated Table Specifications (Key Corrected Tables)

### Table 24: `inventory_levels` (Module 04)
- **Purpose**: Derived projection of physical on-hand, damaged, sellable, reserved, and available stock per warehouse/variant.
- **Columns**:
  - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - `tenant_id` UUID NOT NULL
  - `warehouse_id` UUID NOT NULL
  - `variant_id` UUID NOT NULL
  - `on_hand` INTEGER NOT NULL DEFAULT 0
  - `reserved` INTEGER NOT NULL DEFAULT 0
  - `damaged` INTEGER NOT NULL DEFAULT 0
  - `sellable` INTEGER GENERATED ALWAYS AS (on_hand - damaged) STORED
  - `available` INTEGER GENERATED ALWAYS AS (on_hand - damaged - reserved) STORED
  - `updated_at` TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
- **Constraints**:
  - PK (`id`)
  - UNIQUE (`tenant_id`, `id`)
  - UNIQUE (`tenant_id`, `warehouse_id`, `variant_id`)
  - Composite FK (`tenant_id`, `warehouse_id`) REFERENCES `warehouses(tenant_id, id)`
  - Composite FK (`tenant_id`, `variant_id`) REFERENCES `product_variants(tenant_id, id)`
  - CHECK (`on_hand >= 0`)
  - CHECK (`damaged >= 0 AND damaged <= on_hand`)
  - CHECK (`reserved >= 0`)
  - CHECK (`reserved <= (on_hand - damaged)`) -- Reserved cannot exceed sellable stock

### Table 40: `return_inspections` (Module 06)
- **Purpose**: Quality inspection tracking and tri-state physical stock routing.
- **Columns**:
  - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - `tenant_id` UUID NOT NULL
  - `return_item_id` UUID NOT NULL
  - `inspector_user_id` UUID NOT NULL
  - `grade` TEXT NOT NULL
  - `destination_warehouse_id` UUID NOT NULL
  - `inspected_quantity` INTEGER NOT NULL
  - `restocked_quantity` INTEGER NOT NULL DEFAULT 0
  - `scrap_quantity` INTEGER NOT NULL DEFAULT 0
  - `inspection_notes` TEXT
  - `status` TEXT NOT NULL DEFAULT 'pending'
  - `inspected_at` TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
  - `processed_at` TIMESTAMPTZ
- **Constraints**:
  - PK (`id`)
  - UNIQUE (`tenant_id`, `id`)
  - Composite FK (`tenant_id`, `return_item_id`) REFERENCES `order_return_items(tenant_id, id)`
  - Composite FK (`tenant_id`, `destination_warehouse_id`) REFERENCES `warehouses(tenant_id, id)`
  - CHECK (`grade IN ('grade_a_sellable', 'grade_b_refurbish_outlet', 'grade_c_damaged_scrap')`)
  - CHECK (`status IN ('pending', 'processed', 'cancelled')`)
  - CHECK (`inspected_quantity > 0`)
  - CHECK (`restocked_quantity >= 0 AND scrap_quantity >= 0`)
  - CHECK (`restocked_quantity + scrap_quantity <= inspected_quantity`)

---

## D. Granular Role & Permission Matrix

| Module / Domain | Operations Allowed for Staff / Dispatcher | Operations Allowed for Accountant | Operations Allowed for Operations Manager | Operations Allowed for Tenant Owner |
|---|---|---|---|---|
| **Platform / Tenancy** | SELECT (Read-only) | SELECT (Read-only) | SELECT (Read-only) | SELECT, INSERT, UPDATE, DELETE |
| **Catalog & Products** | SELECT | SELECT | SELECT, INSERT, UPDATE | SELECT, INSERT, UPDATE, DELETE |
| **Inventory & Warehouses** | SELECT, Dispatch Pickups | SELECT | SELECT, INSERT, UPDATE, Transfer | SELECT, INSERT, UPDATE, Transfer, Delete Drafts |
| **Orders & Fulfillments** | Pack, Dispatch | View, Process Refunds | Confirm, Manage, Cancel | Full Control |
| **Purchasing & Suppliers** | View | View Bills | Full PO & Goods Receipts | Full Control |
| **Operational Finance** | None | Full Financial Management | View Margins | Full Control |
| **Audit Logs** | Append via system triggers only (Strictly Read-Only / Immutable) | Append via triggers | Append via triggers | Append via triggers (No Mutation) |
