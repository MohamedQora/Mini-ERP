-- 06: Suppliers, purchase orders, receipts, couriers and shipments
CREATE TABLE suppliers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id),
 name text NOT NULL,
 supplier_type text,
 tax_number text,
 phone text,
 email text,
 address text,
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
 notes text,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,id)
);
CREATE TABLE supplier_contacts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 supplier_id uuid NOT NULL,
 name text NOT NULL,
 role text,
 phone text,
 email text,
 FOREIGN KEY(tenant_id,supplier_id) REFERENCES suppliers(tenant_id,id) ON DELETE CASCADE
);
CREATE TABLE purchase_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id),
 po_number text NOT NULL,
 supplier_id uuid NOT NULL,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','approved','ordered','partially_received','received','cancelled')),
 currency_code text NOT NULL DEFAULT 'EGP' REFERENCES currencies(code),
 order_date date NOT NULL DEFAULT CURRENT_DATE,
 expected_date date,
 subtotal numeric(14,2) NOT NULL DEFAULT 0,
 extra_costs numeric(14,2) NOT NULL DEFAULT 0,
 total numeric(14,2) NOT NULL DEFAULT 0,
 payment_terms text,
 notes text,
 created_by uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,id), UNIQUE(tenant_id,po_number),
 FOREIGN KEY(tenant_id,supplier_id) REFERENCES suppliers(tenant_id,id)
);
CREATE TABLE purchase_order_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 purchase_order_id uuid NOT NULL,
 variant_id uuid NOT NULL,
 ordered_quantity integer NOT NULL CHECK(ordered_quantity > 0),
 received_quantity integer NOT NULL DEFAULT 0 CHECK(received_quantity >= 0),
 unit_cost numeric(14,4) NOT NULL CHECK(unit_cost >= 0),
 tax_rate numeric(7,4) NOT NULL DEFAULT 0 CHECK(tax_rate >= 0),
 line_total numeric(14,2) NOT NULL CHECK(line_total >= 0),
 UNIQUE(tenant_id,id),
 FOREIGN KEY(tenant_id,purchase_order_id) REFERENCES purchase_orders(tenant_id,id) ON DELETE CASCADE,
 FOREIGN KEY(tenant_id,variant_id) REFERENCES product_variants(tenant_id,id)
);
CREATE TABLE goods_receipts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id),
 receipt_number text NOT NULL,
 purchase_order_id uuid NOT NULL,
 warehouse_id uuid NOT NULL,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','posted','cancelled')),
 received_at timestamptz,
 received_by uuid,
 landed_cost_total numeric(14,2) NOT NULL DEFAULT 0 CHECK(landed_cost_total >= 0),
 notes text,
 UNIQUE(tenant_id,id), UNIQUE(tenant_id,receipt_number),
 FOREIGN KEY(tenant_id,purchase_order_id) REFERENCES purchase_orders(tenant_id,id),
 FOREIGN KEY(tenant_id,warehouse_id) REFERENCES warehouses(tenant_id,id)
);
CREATE TABLE goods_receipt_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 goods_receipt_id uuid NOT NULL,
 purchase_order_item_id uuid NOT NULL,
 quantity_received integer NOT NULL CHECK(quantity_received > 0),
 unit_cost numeric(14,4) NOT NULL CHECK(unit_cost >= 0),
 allocated_landed_cost numeric(14,2) NOT NULL DEFAULT 0 CHECK(allocated_landed_cost >= 0),
 FOREIGN KEY(tenant_id,goods_receipt_id) REFERENCES goods_receipts(tenant_id,id) ON DELETE CASCADE,
 FOREIGN KEY(tenant_id,purchase_order_item_id) REFERENCES purchase_order_items(tenant_id,id)
);
CREATE TABLE couriers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id),
 name text NOT NULL,
 code text NOT NULL,
 integration_config jsonb NOT NULL DEFAULT '{}',
 sla_hours integer,
 is_active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,id), UNIQUE(tenant_id,code)
);
CREATE TABLE courier_service_areas (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 courier_id uuid NOT NULL,
 governorate text NOT NULL,
 zone_code text,
 is_active boolean NOT NULL DEFAULT true,
 cod_available boolean NOT NULL DEFAULT true,
 UNIQUE(tenant_id,courier_id,governorate,zone_code),
 FOREIGN KEY(tenant_id,courier_id) REFERENCES couriers(tenant_id,id) ON DELETE CASCADE
);
CREATE TABLE courier_pricing_rules (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 courier_id uuid NOT NULL,
 zone_code text,
 min_weight_grams integer NOT NULL DEFAULT 0 CHECK(min_weight_grams >= 0),
 max_weight_grams integer,
 base_fee numeric(14,2) NOT NULL CHECK(base_fee >= 0),
 extra_kg_fee numeric(14,2) NOT NULL DEFAULT 0 CHECK(extra_kg_fee >= 0),
 cod_fee numeric(14,2) NOT NULL DEFAULT 0 CHECK(cod_fee >= 0),
 return_fee numeric(14,2) NOT NULL DEFAULT 0 CHECK(return_fee >= 0),
 effective_from date NOT NULL DEFAULT CURRENT_DATE,
 effective_to date,
 FOREIGN KEY(tenant_id,courier_id) REFERENCES couriers(tenant_id,id),
 CHECK(max_weight_grams IS NULL OR max_weight_grams >= min_weight_grams)
);
CREATE TABLE shipments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 fulfillment_id uuid NOT NULL,
 courier_id uuid NOT NULL,
 tracking_number text,
 waybill_number text,
 status text NOT NULL DEFAULT 'created' CHECK(status IN ('created','picked_up','in_transit','out_for_delivery','delivered','refused','failed','returned')),
 shipping_cost numeric(14,2) NOT NULL DEFAULT 0 CHECK(shipping_cost >= 0),
 cod_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(cod_amount >= 0),
 booked_at timestamptz,
 delivered_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,id),
 FOREIGN KEY(tenant_id,fulfillment_id) REFERENCES order_fulfillments(tenant_id,id),
 FOREIGN KEY(tenant_id,courier_id) REFERENCES couriers(tenant_id,id)
);
-- Ensure the composite key required by tenant-safe shipment item references exists.
-- This is a compatibility guard if File 5 was applied before its constraint fix.
DO $$
BEGIN
 IF NOT EXISTS (
   SELECT 1
   FROM pg_constraint c
   JOIN pg_class t ON t.oid = c.conrelid
   JOIN pg_namespace n ON n.oid = t.relnamespace
   JOIN pg_attribute a1 ON a1.attrelid = t.oid AND a1.attname = 'tenant_id' AND NOT a1.attisdropped
   JOIN pg_attribute a2 ON a2.attrelid = t.oid AND a2.attname = 'id' AND NOT a2.attisdropped
   WHERE n.nspname = 'public'
     AND t.relname = 'order_fulfillment_items'
     AND c.contype = 'u'
     AND c.conkey = ARRAY[a1.attnum, a2.attnum]::smallint[]
 ) THEN
   ALTER TABLE public.order_fulfillment_items
     ADD CONSTRAINT uq_order_fulfillment_items_tenant_id UNIQUE (tenant_id, id);
 END IF;
END $$;

CREATE TABLE shipment_items (
 tenant_id uuid NOT NULL,
 shipment_id uuid NOT NULL,
 fulfillment_item_id uuid NOT NULL,
 quantity integer NOT NULL CHECK(quantity > 0),
 PRIMARY KEY(tenant_id,shipment_id,fulfillment_item_id),
 FOREIGN KEY(tenant_id,shipment_id) REFERENCES shipments(tenant_id,id) ON DELETE CASCADE,
 FOREIGN KEY(tenant_id,fulfillment_item_id) REFERENCES order_fulfillment_items(tenant_id,id)
);
CREATE TABLE shipment_tracking_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 shipment_id uuid NOT NULL,
 event_code text NOT NULL,
 event_description text,
 location text,
 event_at timestamptz NOT NULL,
 raw_payload jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,shipment_id) REFERENCES shipments(tenant_id,id)
);
