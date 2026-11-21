-- 07: Finance, integrations, audit, sequences, notifications, helpers and RLS

-- Ensure the composite key required by order_refunds exists.
-- order_payments is created in migration 05 with id as its primary key,
-- but this tenant-scoped FK also needs (tenant_id, id) to be unique.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.order_payments'::regclass
      AND conname = 'uq_order_payments_tenant_id'
  ) THEN
    ALTER TABLE public.order_payments
      ADD CONSTRAINT uq_order_payments_tenant_id UNIQUE (tenant_id, id);
  END IF;
END
$$;
CREATE TABLE order_cost_entries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 order_id uuid NOT NULL,
 cost_type text NOT NULL,
 amount numeric(14,2) NOT NULL CHECK(amount >= 0),
 currency_code text NOT NULL DEFAULT 'EGP' REFERENCES currencies(code),
 reference_type text,
 reference_id uuid,
 notes text,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,order_id) REFERENCES orders(tenant_id,id)
);
CREATE TABLE order_refunds (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 order_id uuid NOT NULL,
 payment_id uuid,
 refund_method text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processed','failed','cancelled')),
 amount numeric(14,2) NOT NULL CHECK(amount > 0),
 reason text,
 refunded_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,order_id) REFERENCES orders(tenant_id,id),
 FOREIGN KEY(tenant_id,payment_id) REFERENCES order_payments(tenant_id,id)
);
CREATE TABLE order_profit_snapshots (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 order_id uuid NOT NULL,
 version integer NOT NULL,
 revenue numeric(14,2) NOT NULL DEFAULT 0,
 cogs numeric(14,2) NOT NULL DEFAULT 0,
 operational_costs numeric(14,2) NOT NULL DEFAULT 0,
 refunds numeric(14,2) NOT NULL DEFAULT 0,
 net_profit numeric(14,2) NOT NULL DEFAULT 0,
 calculated_at timestamptz NOT NULL DEFAULT now(),
 calculation_details jsonb NOT NULL DEFAULT '{}',
 UNIQUE(tenant_id,order_id,version),
 FOREIGN KEY(tenant_id,order_id) REFERENCES orders(tenant_id,id)
);
CREATE TABLE expense_categories (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id),
 name text NOT NULL,
 code text NOT NULL,
 is_active boolean NOT NULL DEFAULT true,
 UNIQUE(tenant_id,id), UNIQUE(tenant_id,code)
);
CREATE TABLE expenses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 category_id uuid NOT NULL,
 expense_number text NOT NULL,
 amount numeric(14,2) NOT NULL CHECK(amount > 0),
 currency_code text NOT NULL DEFAULT 'EGP' REFERENCES currencies(code),
 expense_date date NOT NULL DEFAULT CURRENT_DATE,
 status text NOT NULL DEFAULT 'posted' CHECK(status IN ('draft','posted','void')),
 description text,
 vendor_name text,
 created_by uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,id), UNIQUE(tenant_id,expense_number),
 FOREIGN KEY(tenant_id,category_id) REFERENCES expense_categories(tenant_id,id)
);
CREATE TABLE settlements (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id),
 courier_id uuid NOT NULL,
 settlement_number text NOT NULL,
 period_start date,
 period_end date,
 expected_amount numeric(14,2) NOT NULL DEFAULT 0,
 received_amount numeric(14,2) NOT NULL DEFAULT 0,
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','submitted','partially_reconciled','reconciled','disputed')),
 received_at timestamptz,
 notes text,
 UNIQUE(tenant_id,id), UNIQUE(tenant_id,settlement_number),
 FOREIGN KEY(tenant_id,courier_id) REFERENCES couriers(tenant_id,id)
);
CREATE TABLE settlement_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 settlement_id uuid NOT NULL,
 shipment_id uuid NOT NULL,
 expected_cod numeric(14,2) NOT NULL DEFAULT 0,
 remitted_cod numeric(14,2) NOT NULL DEFAULT 0,
 discrepancy numeric(14,2) GENERATED ALWAYS AS (remitted_cod-expected_cod) STORED,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','matched','short','over','disputed')),
 FOREIGN KEY(tenant_id,settlement_id) REFERENCES settlements(tenant_id,id) ON DELETE CASCADE,
 FOREIGN KEY(tenant_id,shipment_id) REFERENCES shipments(tenant_id,id),
 UNIQUE(tenant_id,settlement_id,shipment_id)
);
CREATE TABLE supplier_payments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id),
 supplier_id uuid NOT NULL,
 payment_number text NOT NULL,
 amount numeric(14,2) NOT NULL CHECK(amount > 0),
 currency_code text NOT NULL DEFAULT 'EGP' REFERENCES currencies(code),
 payment_method text NOT NULL,
 status text NOT NULL DEFAULT 'paid' CHECK(status IN ('draft','paid','void')),
 paid_at timestamptz,
 reference text,
 notes text,
 created_by uuid,
 UNIQUE(tenant_id,id), UNIQUE(tenant_id,payment_number),
 FOREIGN KEY(tenant_id,supplier_id) REFERENCES suppliers(tenant_id,id)
);
CREATE TABLE supplier_payment_allocations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 supplier_payment_id uuid NOT NULL,
 purchase_order_id uuid NOT NULL,
 allocated_amount numeric(14,2) NOT NULL CHECK(allocated_amount > 0),
 FOREIGN KEY(tenant_id,supplier_payment_id) REFERENCES supplier_payments(tenant_id,id) ON DELETE CASCADE,
 FOREIGN KEY(tenant_id,purchase_order_id) REFERENCES purchase_orders(tenant_id,id)
);
CREATE TABLE integration_providers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 code text NOT NULL UNIQUE,
 name text NOT NULL,
 provider_type text NOT NULL,
 is_active boolean NOT NULL DEFAULT true,
 capabilities jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE integration_connections (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id),
 provider_id uuid NOT NULL REFERENCES integration_providers(id),
 name text NOT NULL,
 status text NOT NULL DEFAULT 'disconnected' CHECK(status IN ('disconnected','connected','error','paused')),
 external_account_id text,
 config jsonb NOT NULL DEFAULT '{}',
 last_sync_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,id)
);
CREATE TABLE integration_credentials (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 connection_id uuid NOT NULL,
 credential_key text NOT NULL,
 encrypted_value text NOT NULL,
 encryption_key_version text,
 updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,connection_id) REFERENCES integration_connections(tenant_id,id) ON DELETE CASCADE,
 UNIQUE(tenant_id,connection_id,credential_key)
);
CREATE TABLE sales_channels (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id),
 connection_id uuid,
 name text NOT NULL,
 channel_type text NOT NULL,
 is_active boolean NOT NULL DEFAULT true,
 UNIQUE(tenant_id,id),
 FOREIGN KEY(tenant_id,connection_id) REFERENCES integration_connections(tenant_id,id)
);
ALTER TABLE orders ADD CONSTRAINT fk_orders_channel FOREIGN KEY(tenant_id,sales_channel_id) REFERENCES sales_channels(tenant_id,id);
CREATE TABLE external_product_mappings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 connection_id uuid NOT NULL,
 variant_id uuid NOT NULL,
 external_product_id text NOT NULL,
 external_variant_id text NOT NULL,
 last_synced_at timestamptz,
 UNIQUE(tenant_id,connection_id,external_variant_id),
 FOREIGN KEY(tenant_id,connection_id) REFERENCES integration_connections(tenant_id,id),
 FOREIGN KEY(tenant_id,variant_id) REFERENCES product_variants(tenant_id,id)
);
CREATE TABLE external_order_refs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 connection_id uuid NOT NULL,
 order_id uuid NOT NULL,
 external_order_id text NOT NULL,
 external_order_number text,
 received_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,connection_id,external_order_id),
 FOREIGN KEY(tenant_id,connection_id) REFERENCES integration_connections(tenant_id,id),
 FOREIGN KEY(tenant_id,order_id) REFERENCES orders(tenant_id,id)
);
CREATE TABLE webhook_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid REFERENCES tenants(id),
 connection_id uuid,
 provider_code text NOT NULL,
 external_event_id text,
 event_type text NOT NULL,
 payload jsonb NOT NULL,
 status text NOT NULL DEFAULT 'received' CHECK(status IN ('received','processing','processed','failed','ignored')),
 received_at timestamptz NOT NULL DEFAULT now(),
 processed_at timestamptz,
 expires_at timestamptz NOT NULL DEFAULT (now()+interval '90 days'),
 UNIQUE(provider_code,external_event_id),
 FOREIGN KEY(tenant_id,connection_id) REFERENCES integration_connections(tenant_id,id)
);
CREATE TABLE sync_runs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 connection_id uuid NOT NULL,
 sync_type text NOT NULL,
 status text NOT NULL DEFAULT 'running' CHECK(status IN ('running','completed','failed','cancelled')),
 started_at timestamptz NOT NULL DEFAULT now(),
 finished_at timestamptz,
 records_total integer NOT NULL DEFAULT 0,
 records_success integer NOT NULL DEFAULT 0,
 records_failed integer NOT NULL DEFAULT 0,
 details jsonb NOT NULL DEFAULT '{}',
 UNIQUE(tenant_id,id),
 FOREIGN KEY(tenant_id,connection_id) REFERENCES integration_connections(tenant_id,id)
);
CREATE TABLE sync_logs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL,
 sync_run_id uuid NOT NULL,
 level text NOT NULL DEFAULT 'info' CHECK(level IN ('debug','info','warning','error')),
 message text NOT NULL,
 context jsonb NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(tenant_id,sync_run_id) REFERENCES sync_runs(tenant_id,id) ON DELETE CASCADE
);
CREATE TABLE audit_logs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id),
 actor_user_id uuid,
 action text NOT NULL,
 entity_type text NOT NULL,
 entity_id uuid,
 old_values jsonb,
 new_values jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE order_number_sequences (
 tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
 sequence_year integer NOT NULL,
 prefix text NOT NULL DEFAULT 'ORD',
 last_value bigint NOT NULL DEFAULT 0 CHECK(last_value >= 0),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,sequence_year)
);
CREATE TABLE notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id),
 user_id uuid,
 notification_type text NOT NULL,
 title text NOT NULL,
 body text,
 payload jsonb NOT NULL DEFAULT '{}',
 read_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE tenant_notification_rules (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id),
 rule_code text NOT NULL,
 is_enabled boolean NOT NULL DEFAULT true,
 channels text[] NOT NULL DEFAULT ARRAY['in_app'],
 config jsonb NOT NULL DEFAULT '{}',
 UNIQUE(tenant_id,rule_code)
);

-- Tenant context helper: create in public (Supabase-managed auth schema is not writable by app migrations). Set by trusted server/session middleware.
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid LANGUAGE sql STABLE
AS $$ SELECT NULLIF(current_setting('app.current_tenant_id',true),'')::uuid $$;

-- Membership-based tenant access; no platform-admin implicit bypass.
CREATE OR REPLACE FUNCTION public.is_tenant_member(p_tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth
AS $$ SELECT EXISTS (
 SELECT 1 FROM public.tenant_memberships tm
 WHERE tm.tenant_id=p_tenant_id AND tm.user_id=auth.uid() AND tm.status='active'
) $$;

-- Atomic stock reservation with row locking. Prevents overselling under concurrent requests.
CREATE OR REPLACE FUNCTION public.inventory_reserve_stock(
 p_tenant_id uuid,p_warehouse_id uuid,p_variant_id uuid,p_order_id uuid,p_quantity integer
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth
AS $$
DECLARE v_available integer;
BEGIN
 IF p_quantity <= 0 THEN RAISE EXCEPTION 'Quantity must be positive'; END IF;
 IF NOT public.is_tenant_member(p_tenant_id) THEN RAISE EXCEPTION 'Tenant access denied'; END IF;
 SELECT available INTO v_available FROM public.inventory_levels
 WHERE tenant_id=p_tenant_id AND warehouse_id=p_warehouse_id AND variant_id=p_variant_id
 FOR UPDATE;
 IF NOT FOUND OR v_available < p_quantity THEN
   RAISE EXCEPTION 'Insufficient stock: requested %, available %',p_quantity,COALESCE(v_available,0);
 END IF;
 UPDATE public.inventory_levels SET reserved=reserved+p_quantity,updated_at=clock_timestamp()
 WHERE tenant_id=p_tenant_id AND warehouse_id=p_warehouse_id AND variant_id=p_variant_id;
 INSERT INTO public.inventory_reservations(tenant_id,warehouse_id,variant_id,order_id,quantity,status)
 VALUES(p_tenant_id,p_warehouse_id,p_variant_id,p_order_id,p_quantity,'active');
 INSERT INTO public.inventory_transactions(tenant_id,warehouse_id,variant_id,transaction_type,quantity,reference_type,reference_id)
 VALUES(p_tenant_id,p_warehouse_id,p_variant_id,'reserve',p_quantity,'order',p_order_id);
 RETURN true;
END $$;

-- Atomic sequence allocator. Caller must be a member of tenant.
CREATE OR REPLACE FUNCTION public.get_next_order_number(p_tenant_id uuid, p_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth
AS $$
DECLARE v_next bigint; v_prefix text;
BEGIN
 IF NOT public.is_tenant_member(p_tenant_id) THEN RAISE EXCEPTION 'Tenant access denied'; END IF;
 INSERT INTO public.order_number_sequences(tenant_id,sequence_year,prefix,last_value)
 VALUES(p_tenant_id,p_year,'ORD',1)
 ON CONFLICT(tenant_id,sequence_year) DO UPDATE SET last_value=order_number_sequences.last_value+1,updated_at=now()
 RETURNING last_value,prefix INTO v_next,v_prefix;
 RETURN v_prefix||'-'||p_year||'-'||lpad(v_next::text,6,'0');
END $$;

-- RLS: enabled for every tenant-owned table. Membership is enforced in policies.
DO $$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY[
 'tenant_settings','tenant_currencies','support_access_grants',
 'roles','tenant_memberships','membership_warehouse_access','tenant_invitations',
 'product_categories','products','product_images','attribute_definitions','attribute_values','product_variants','variant_attribute_values','variant_cost_history',
 'warehouses','inventory_levels','inventory_transactions','inventory_reservations','warehouse_transfers','warehouse_transfer_items',
 'customers','customer_identifiers','customer_addresses',
 'orders','order_items','order_status_history','order_payments','order_fulfillments','order_fulfillment_items','order_returns','order_return_items','return_inspections',
 'suppliers','supplier_contacts','purchase_orders','purchase_order_items','goods_receipts','goods_receipt_items',
 'couriers','courier_service_areas','courier_pricing_rules','shipments','shipment_items','shipment_tracking_events',
 'order_cost_entries','order_refunds','order_profit_snapshots','expense_categories','expenses','settlements','settlement_items','supplier_payments','supplier_payment_allocations',
 'integration_connections','integration_credentials','sales_channels','external_product_mappings','external_order_refs','webhook_events','sync_runs','sync_logs',
 'audit_logs','order_number_sequences','notifications','tenant_notification_rules'
 ]
 LOOP
   EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
   EXECUTE format('CREATE POLICY tenant_member_all ON public.%I FOR ALL USING (tenant_id = public.current_tenant_id() OR public.is_tenant_member(tenant_id)) WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_tenant_member(tenant_id))',t);
 END LOOP;
END $$;

-- Role-permission mappings are visible only for global roles or tenant roles
-- the current user belongs to. Mutations should be performed by trusted backend code.
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY role_permissions_read_scope ON role_permissions FOR SELECT TO authenticated
 USING (EXISTS (
   SELECT 1 FROM roles r WHERE r.id=role_permissions.role_id
   AND (r.tenant_id IS NULL OR public.is_tenant_member(r.tenant_id))
 ));
-- Global tables have no tenant scope; restrict access to authenticated/platform roles.
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY currencies_read_authenticated ON currencies FOR SELECT TO authenticated USING(true);
CREATE POLICY permissions_read_authenticated ON permissions FOR SELECT TO authenticated USING(true);
CREATE POLICY providers_read_authenticated ON integration_providers FOR SELECT TO authenticated USING(is_active=true);
CREATE POLICY tenant_self_member_read ON tenants FOR SELECT TO authenticated USING(public.is_tenant_member(id));
CREATE POLICY profile_self_access ON user_profiles FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE POLICY platform_admin_self_read ON platform_admins FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY platform_audit_admin_read ON platform_audit_logs FOR SELECT TO authenticated USING(actor_user_id=auth.uid() AND EXISTS(SELECT 1 FROM platform_admins pa WHERE pa.user_id=auth.uid() AND pa.is_active));
