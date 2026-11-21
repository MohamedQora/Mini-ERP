-- 04: Warehouses, ledger/balances, reservations, transfers and customers
CREATE TABLE warehouses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
 code text NOT NULL,
 name text NOT NULL,
 warehouse_type text NOT NULL DEFAULT 'physical' CHECK(warehouse_type IN ('physical','virtual','outlet','quarantine','scrap')),
 governorate text,
 address text,
 is_active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,id), UNIQUE(tenant_id,code)
);
CREATE TABLE inventory_levels (
 tenant_id uuid NOT NULL,
 warehouse_id uuid NOT NULL,
 variant_id uuid NOT NULL,
 on_hand integer NOT NULL DEFAULT 0 CHECK(on_hand >= 0),
 reserved integer NOT NULL DEFAULT 0 CHECK(reserved >= 0 AND reserved <= on_hand),
 damaged integer NOT NULL DEFAULT 0 CHECK(damaged >= 0 AND damaged <= on_hand),
 updated_at timestamptz NOT NULL DEFAULT now(),
 available integer GENERATED ALWAYS AS (on_hand-reserved) STORED,
 PRIMARY KEY(tenant_id,warehouse_id,variant_id),
 FOREIGN KEY(tenant_id,warehouse_id) REFERENCES warehouses(tenant_id,id),
 FOREIGN KEY(tenant_id,variant_id) REFERENCES product_variants(tenant_id,id)
);
CREATE TABLE inventory_transactions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 warehouse_id uuid NOT NULL,
 variant_id uuid NOT NULL,
 transaction_type text NOT NULL CHECK(transaction_type IN ('receipt','reserve','release','dispatch','adjustment','transfer_out','transfer_in','return_restock','damage','writeoff')),
 quantity integer NOT NULL CHECK(quantity > 0),
 reference_type text,
 reference_id uuid,
 unit_cost numeric(14,4),
 notes text,
 created_by uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,warehouse_id) REFERENCES warehouses(tenant_id,id),
 FOREIGN KEY(tenant_id,variant_id) REFERENCES product_variants(tenant_id,id)
);
CREATE TABLE inventory_reservations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 warehouse_id uuid NOT NULL,
 variant_id uuid NOT NULL,
 order_id uuid,
 quantity integer NOT NULL CHECK(quantity > 0),
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','released','fulfilled','cancelled')),
 created_at timestamptz NOT NULL DEFAULT now(),
 released_at timestamptz,
 FOREIGN KEY(tenant_id,warehouse_id) REFERENCES warehouses(tenant_id,id),
 FOREIGN KEY(tenant_id,variant_id) REFERENCES product_variants(tenant_id,id)
);
CREATE TABLE warehouse_transfers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id),
 transfer_number text NOT NULL,
 from_warehouse_id uuid NOT NULL,
 to_warehouse_id uuid NOT NULL,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','approved','in_transit','received','cancelled')),
 requested_at timestamptz NOT NULL DEFAULT now(),
 shipped_at timestamptz,
 received_at timestamptz,
 created_by uuid,
 UNIQUE(tenant_id,id), UNIQUE(tenant_id,transfer_number),
 CHECK(from_warehouse_id <> to_warehouse_id),
 FOREIGN KEY(tenant_id,from_warehouse_id) REFERENCES warehouses(tenant_id,id),
 FOREIGN KEY(tenant_id,to_warehouse_id) REFERENCES warehouses(tenant_id,id)
);
CREATE TABLE warehouse_transfer_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 transfer_id uuid NOT NULL,
 variant_id uuid NOT NULL,
 quantity integer NOT NULL CHECK(quantity > 0),
 received_quantity integer NOT NULL DEFAULT 0 CHECK(received_quantity >= 0 AND received_quantity <= quantity),
 FOREIGN KEY(tenant_id,transfer_id) REFERENCES warehouse_transfers(tenant_id,id) ON DELETE CASCADE,
 FOREIGN KEY(tenant_id,variant_id) REFERENCES product_variants(tenant_id,id),
 UNIQUE(tenant_id,id)
);
CREATE TABLE customers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
 full_name text NOT NULL,
 notes text,
 verified boolean NOT NULL DEFAULT false,
 lifetime_value numeric(14,2) NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,id)
);
CREATE TABLE customer_identifiers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 customer_id uuid NOT NULL,
 identifier_type text NOT NULL CHECK(identifier_type IN ('phone','email')),
 identifier_value text NOT NULL,
 normalized_value text NOT NULL,
 is_verified boolean NOT NULL DEFAULT false,
 is_primary boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,identifier_type,normalized_value),
 FOREIGN KEY(tenant_id,customer_id) REFERENCES customers(tenant_id,id) ON DELETE CASCADE
);
CREATE TABLE customer_addresses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 customer_id uuid NOT NULL,
 label text,
 governorate text NOT NULL,
 city_district text,
 street text,
 building text,
 apartment text,
 landmark text,
 postal_code text,
 recipient_name text,
 recipient_phone text,
 is_default boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,customer_id) REFERENCES customers(tenant_id,id) ON DELETE CASCADE,
 UNIQUE(tenant_id,id)
);
