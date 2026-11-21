-- 03: Catalog, attributes, variants and cost history
CREATE TABLE product_categories (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
 parent_id uuid,
 name text NOT NULL,
 slug text NOT NULL,
 description text,
 sort_order integer NOT NULL DEFAULT 0,
 is_active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,id),
 UNIQUE(tenant_id,slug),
 FOREIGN KEY(tenant_id,parent_id) REFERENCES product_categories(tenant_id,id)
);
CREATE TABLE products (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
 category_id uuid,
 name text NOT NULL,
 description text,
 brand text,
 season text,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','active','archived')),
 metadata jsonb NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,id),
 FOREIGN KEY(tenant_id,category_id) REFERENCES product_categories(tenant_id,id)
);
CREATE TABLE attribute_definitions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
 name text NOT NULL,
 code text NOT NULL,
 data_type text NOT NULL DEFAULT 'text' CHECK(data_type IN ('text','number','boolean')),
 is_variant_attribute boolean NOT NULL DEFAULT true,
 UNIQUE(tenant_id,id), UNIQUE(tenant_id,code)
);
CREATE TABLE attribute_values (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 attribute_id uuid NOT NULL,
 value text NOT NULL,
 normalized_value text NOT NULL,
 sort_order integer NOT NULL DEFAULT 0,
 UNIQUE(tenant_id,id),
 UNIQUE(tenant_id,attribute_id,normalized_value),
 FOREIGN KEY(tenant_id,attribute_id) REFERENCES attribute_definitions(tenant_id,id) ON DELETE CASCADE
);
CREATE TABLE product_variants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 product_id uuid NOT NULL,
 sku text NOT NULL,
 barcode text,
 variant_name text NOT NULL,
 weight_grams integer CHECK(weight_grams IS NULL OR weight_grams >= 0),
 retail_price numeric(14,2) NOT NULL DEFAULT 0 CHECK(retail_price >= 0),
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive','discontinued')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,id), UNIQUE(tenant_id,sku), UNIQUE(tenant_id,barcode),
 FOREIGN KEY(tenant_id,product_id) REFERENCES products(tenant_id,id) ON DELETE RESTRICT
);
CREATE TABLE product_images (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 product_id uuid NOT NULL,
 variant_id uuid,
 image_url text NOT NULL,
 alt_text text,
 display_order integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,product_id) REFERENCES products(tenant_id,id) ON DELETE CASCADE,
 FOREIGN KEY(tenant_id,variant_id) REFERENCES product_variants(tenant_id,id)
);
CREATE TABLE variant_attribute_values (
 tenant_id uuid NOT NULL,
 variant_id uuid NOT NULL,
 attribute_id uuid NOT NULL,
 attribute_value_id uuid NOT NULL,
 PRIMARY KEY(tenant_id,variant_id,attribute_id),
 FOREIGN KEY(tenant_id,variant_id) REFERENCES product_variants(tenant_id,id) ON DELETE CASCADE,
 FOREIGN KEY(tenant_id,attribute_id) REFERENCES attribute_definitions(tenant_id,id),
 FOREIGN KEY(tenant_id,attribute_value_id) REFERENCES attribute_values(tenant_id,id)
);
CREATE TABLE variant_cost_history (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 variant_id uuid NOT NULL,
 cost_type text NOT NULL CHECK(cost_type IN ('standard','estimated','wac')),
 unit_cost numeric(14,4) NOT NULL CHECK(unit_cost >= 0),
 effective_at timestamptz NOT NULL DEFAULT now(),
 source_type text,
 source_id uuid,
 created_by uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,variant_id) REFERENCES product_variants(tenant_id,id)
);
