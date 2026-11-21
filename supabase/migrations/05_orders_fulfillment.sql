-- 05: Orders, payments, fulfillment, returns and inspections
CREATE TABLE orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id),
 order_number text NOT NULL,
 customer_id uuid,
 sales_channel_id uuid,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','confirmed','processing','completed','cancelled')),
 payment_status text NOT NULL DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid','partial','paid','refunded','partially_refunded')),
 fulfillment_status text NOT NULL DEFAULT 'unfulfilled' CHECK(fulfillment_status IN ('unfulfilled','partial','fulfilled','returned')),
 currency_code text NOT NULL DEFAULT 'EGP' REFERENCES currencies(code),
 subtotal numeric(14,2) NOT NULL DEFAULT 0 CHECK(subtotal >= 0),
 discount_total numeric(14,2) NOT NULL DEFAULT 0 CHECK(discount_total >= 0),
 shipping_total numeric(14,2) NOT NULL DEFAULT 0 CHECK(shipping_total >= 0),
 tax_total numeric(14,2) NOT NULL DEFAULT 0 CHECK(tax_total >= 0),
 grand_total numeric(14,2) NOT NULL DEFAULT 0 CHECK(grand_total >= 0),
 shipping_address_snapshot jsonb,
 customer_snapshot jsonb,
 notes text,
 confirmed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,id), UNIQUE(tenant_id,order_number),
 FOREIGN KEY(tenant_id,customer_id) REFERENCES customers(tenant_id,id)
);
CREATE TABLE order_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 order_id uuid NOT NULL,
 variant_id uuid,
 product_name_snapshot text NOT NULL,
 variant_name_snapshot text,
 sku_snapshot text,
 quantity integer NOT NULL CHECK(quantity > 0),
 unit_price numeric(14,2) NOT NULL CHECK(unit_price >= 0),
 unit_cogs_snapshot numeric(14,4) NOT NULL DEFAULT 0 CHECK(unit_cogs_snapshot >= 0),
 discount_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(discount_amount >= 0),
 line_total numeric(14,2) NOT NULL CHECK(line_total >= 0),
 FOREIGN KEY(tenant_id,order_id) REFERENCES orders(tenant_id,id) ON DELETE RESTRICT,
 FOREIGN KEY(tenant_id,variant_id) REFERENCES product_variants(tenant_id,id),
 UNIQUE(tenant_id,id)
);
CREATE TABLE order_status_history (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 order_id uuid NOT NULL,
 old_status text,
 new_status text NOT NULL,
 reason text,
 changed_by uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,order_id) REFERENCES orders(tenant_id,id)
);
CREATE TABLE order_payments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 order_id uuid NOT NULL,
 payment_method text NOT NULL CHECK(payment_method IN ('cod','card','gateway','instapay','bank_transfer','cash','store_credit','other')),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','authorized','captured','failed','cancelled','refunded','partially_refunded')),
 amount numeric(14,2) NOT NULL CHECK(amount >= 0),
 currency_code text NOT NULL DEFAULT 'EGP' REFERENCES currencies(code),
 provider_reference text,
 paid_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,order_id) REFERENCES orders(tenant_id,id)
);
CREATE TABLE order_fulfillments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 order_id uuid NOT NULL,
 fulfillment_number text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','packed','shipped','delivered','failed','cancelled')),
 warehouse_id uuid,
 packed_at timestamptz,
 shipped_at timestamptz,
 delivered_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,id), UNIQUE(tenant_id,fulfillment_number),
 FOREIGN KEY(tenant_id,order_id) REFERENCES orders(tenant_id,id),
 FOREIGN KEY(tenant_id,warehouse_id) REFERENCES warehouses(tenant_id,id)
);
CREATE TABLE order_fulfillment_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 fulfillment_id uuid NOT NULL,
 order_item_id uuid NOT NULL,
 quantity integer NOT NULL CHECK(quantity > 0),
 UNIQUE(tenant_id,id),
 FOREIGN KEY(tenant_id,fulfillment_id) REFERENCES order_fulfillments(tenant_id,id) ON DELETE CASCADE,
 FOREIGN KEY(tenant_id,order_item_id) REFERENCES order_items(tenant_id,id)
);
CREATE TABLE order_returns (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 order_id uuid NOT NULL,
 return_number text NOT NULL,
 return_type text NOT NULL DEFAULT 'return' CHECK(return_type IN ('return','exchange','courier_refusal')),
 status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','approved','received','inspected','completed','rejected','cancelled')),
 reason text,
 requested_at timestamptz NOT NULL DEFAULT now(),
 received_at timestamptz,
 completed_at timestamptz,
 UNIQUE(tenant_id,id), UNIQUE(tenant_id,return_number),
 FOREIGN KEY(tenant_id,order_id) REFERENCES orders(tenant_id,id)
);
CREATE TABLE order_return_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 return_id uuid NOT NULL,
 order_item_id uuid NOT NULL,
 quantity integer NOT NULL CHECK(quantity > 0),
 reason_code text,
 notes text,
 UNIQUE(tenant_id,id),
 FOREIGN KEY(tenant_id,return_id) REFERENCES order_returns(tenant_id,id) ON DELETE CASCADE,
 FOREIGN KEY(tenant_id,order_item_id) REFERENCES order_items(tenant_id,id)
);
CREATE TABLE return_inspections (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 return_item_id uuid NOT NULL,
 inspected_by uuid,
 grade text NOT NULL CHECK(grade IN ('A','B','C')),
 disposition text NOT NULL CHECK(disposition IN ('restock','outlet','quarantine','scrap')),
 warehouse_id uuid,
 quantity integer NOT NULL CHECK(quantity > 0),
 notes text,
 inspected_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,return_item_id) REFERENCES order_return_items(tenant_id,id),
 FOREIGN KEY(tenant_id,warehouse_id) REFERENCES warehouses(tenant_id,id)
);

ALTER TABLE inventory_reservations ADD CONSTRAINT fk_inventory_reservations_order FOREIGN KEY(tenant_id,order_id) REFERENCES orders(tenant_id,id);
