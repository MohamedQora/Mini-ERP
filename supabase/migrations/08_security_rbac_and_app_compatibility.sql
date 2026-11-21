-- 08: إصلاح حد المستأجر في التطبيق وتأسيس قراءة مضبوطة حسب الأدوار.
-- تبقى كتابات المستأجر عبر مسارات خادمية موثوقة فقط.

ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS current_cost numeric(14,4) NOT NULL DEFAULT 0 CHECK (current_cost >= 0);
ALTER TABLE public.inventory_levels DROP COLUMN IF EXISTS available;
ALTER TABLE public.inventory_levels
  ADD COLUMN available integer GENERATED ALWAYS AS (on_hand-reserved-damaged) STORED;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.inventory_levels'::regclass AND conname='inventory_levels_stock_partition_ck') THEN
    ALTER TABLE public.inventory_levels ADD CONSTRAINT inventory_levels_stock_partition_ck CHECK (reserved + damaged <= on_hand);
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS inventory_active_reservation_idempotency_uq
  ON public.inventory_reservations(tenant_id,warehouse_id,variant_id,order_id)
  WHERE order_id IS NOT NULL AND status='active';
UPDATE public.roles
SET code = CASE
  WHEN lower(regexp_replace(name, '[^a-zA-Z0-9]+', '_', 'g')) ~ '^[a-z]'
    THEN trim(both '_' from lower(regexp_replace(name, '[^a-zA-Z0-9]+', '_', 'g')))
  ELSE 'custom_' || replace(id::text, '-', '')
END
WHERE code IS NULL;
ALTER TABLE public.roles ALTER COLUMN code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS roles_global_code_uq ON public.roles(code) WHERE tenant_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS roles_tenant_code_uq ON public.roles(tenant_id, code) WHERE tenant_id IS NOT NULL;

INSERT INTO public.roles(id, tenant_id, code, name, is_system_role) VALUES
 ('00000000-0000-0000-0000-000000000001', NULL, 'owner', 'Owner', true),
 ('00000000-0000-0000-0000-000000000002', NULL, 'operations_manager', 'Operations Manager', true),
 ('00000000-0000-0000-0000-000000000003', NULL, 'warehouse_dispatcher', 'Warehouse Dispatcher', true),
 ('00000000-0000-0000-0000-000000000004', NULL, 'accountant', 'Accountant', true)
ON CONFLICT (id) DO UPDATE SET code=EXCLUDED.code, name=EXCLUDED.name, is_system_role=true;

INSERT INTO public.permissions(code, description, module) VALUES
 ('products.view','View product catalog','products'), ('products.manage','Manage product catalog','products'),
 ('inventory.view','View inventory','inventory'), ('inventory.adjust','Adjust inventory','inventory'),
 ('orders.view','View orders','orders'), ('orders.manage','Manage orders','orders'),
 ('customers.view','View customers','customers'), ('customers.manage','Manage customers','customers'),
 ('purchasing.view','View purchasing','purchasing'), ('purchasing.manage','Manage purchasing','purchasing'),
 ('shipping.view','View shipping','shipping'), ('shipping.dispatch','Dispatch shipments','shipping'),
 ('finance.view','View finance','finance'), ('finance.manage','Manage finance','finance'),
 ('integrations.view','View integrations','integrations'), ('integrations.manage','Manage integrations','integrations'),
 ('users.manage','Manage users and roles','users'), ('settings.manage','Manage tenant settings','settings'),
 ('reports.view','View reports','reports')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.role_permissions(role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r CROSS JOIN public.permissions p
WHERE r.id='00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions(role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r JOIN public.permissions p ON p.code IN (
 'products.view','products.manage','inventory.view','inventory.adjust','orders.view','orders.manage',
 'customers.view','customers.manage','purchasing.view','purchasing.manage','shipping.view','shipping.dispatch',
 'finance.view','finance.manage','reports.view'
)
WHERE r.id='00000000-0000-0000-0000-000000000002'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions(role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p
ON p.code IN ('products.view','inventory.view','orders.view','shipping.view','shipping.dispatch')
WHERE r.id='00000000-0000-0000-0000-000000000003'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions(role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p
ON p.code IN ('orders.view','customers.view','finance.view','reports.view')
WHERE r.id='00000000-0000-0000-0000-000000000004'
ON CONFLICT DO NOTHING;

-- تضبط مطالبة app_metadata بواسطة مسار تبديل المستأجر الموثوق؛ تغيير
-- app.current_tenant_id وحده لا يمنح المستدعي صلاحية.
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid LANGUAGE sql STABLE
AS $$ SELECT NULLIF(auth.jwt() -> 'app_metadata' ->> 'tenant_id', '')::uuid $$;

CREATE OR REPLACE FUNCTION public.user_has_permission(p_tenant_id uuid, p_code text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth
AS $$
 SELECT public.current_tenant_id() = p_tenant_id
    AND public.is_tenant_member(p_tenant_id)
    AND EXISTS (
      SELECT 1 FROM public.tenant_memberships tm
      JOIN public.role_permissions rp ON rp.role_id=tm.role_id
      JOIN public.permissions p ON p.id=rp.permission_id
      WHERE tm.tenant_id=p_tenant_id AND tm.user_id=auth.uid()
        AND tm.status='active' AND p.code=p_code
    )
$$;

CREATE OR REPLACE FUNCTION public.get_next_order_number(p_tenant_id uuid, p_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth
AS $$
DECLARE v_next bigint; v_prefix text;
BEGIN
  IF public.current_tenant_id() IS DISTINCT FROM p_tenant_id OR NOT public.is_tenant_member(p_tenant_id) THEN
    RAISE EXCEPTION 'Tenant access denied';
  END IF;
  INSERT INTO public.order_number_sequences(tenant_id,sequence_year,prefix,last_value)
  VALUES(p_tenant_id,p_year,'ORD',1)
  ON CONFLICT(tenant_id,sequence_year) DO UPDATE
    SET last_value=order_number_sequences.last_value+1,updated_at=clock_timestamp()
  RETURNING last_value,prefix INTO v_next,v_prefix;
  RETURN v_prefix||'-'||p_year||'-'||lpad(v_next::text,6,'0');
END
$$;

CREATE OR REPLACE FUNCTION public.inventory_reserve_stock(
  p_tenant_id uuid, p_warehouse_id uuid, p_variant_id uuid, p_order_id uuid, p_quantity integer
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,auth
AS $$
DECLARE v_available integer; v_existing integer;
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 THEN RAISE EXCEPTION 'Quantity must be positive'; END IF;
  IF public.current_tenant_id() IS DISTINCT FROM p_tenant_id OR NOT public.is_tenant_member(p_tenant_id) THEN
    RAISE EXCEPTION 'Tenant access denied';
  END IF;
  SELECT available INTO v_available FROM public.inventory_levels
  WHERE tenant_id=p_tenant_id AND warehouse_id=p_warehouse_id AND variant_id=p_variant_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Inventory level not found'; END IF;

  SELECT quantity INTO v_existing FROM public.inventory_reservations
  WHERE tenant_id=p_tenant_id AND warehouse_id=p_warehouse_id AND variant_id=p_variant_id
    AND order_id=p_order_id AND status='active' FOR UPDATE;
  IF FOUND THEN
    IF v_existing=p_quantity THEN RETURN true; END IF;
    RAISE EXCEPTION 'Conflicting reservation retry for order %, variant %',p_order_id,p_variant_id;
  END IF;
  IF v_available < p_quantity THEN
    RAISE EXCEPTION 'Insufficient sellable inventory: requested %, available %',p_quantity,v_available;
  END IF;

  UPDATE public.inventory_levels SET reserved=reserved+p_quantity,updated_at=clock_timestamp()
  WHERE tenant_id=p_tenant_id AND warehouse_id=p_warehouse_id AND variant_id=p_variant_id;
  INSERT INTO public.inventory_reservations(tenant_id,warehouse_id,variant_id,order_id,quantity,status)
  VALUES(p_tenant_id,p_warehouse_id,p_variant_id,p_order_id,p_quantity,'active');
  INSERT INTO public.inventory_transactions(tenant_id,warehouse_id,variant_id,transaction_type,quantity,reference_type,reference_id)
  VALUES(p_tenant_id,p_warehouse_id,p_variant_id,'reserve',p_quantity,'order',p_order_id);
  RETURN true;
END
$$;

CREATE OR REPLACE FUNCTION public.prevent_ledger_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path=public
AS $$ BEGIN RAISE EXCEPTION '% is append-only; % is prohibited', TG_TABLE_NAME, TG_OP; END $$;
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['inventory_transactions','order_status_history','shipment_tracking_events','variant_cost_history','audit_logs','order_profit_snapshots'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS prevent_ledger_mutation ON public.%I',t);
    EXECUTE format('CREATE TRIGGER prevent_ledger_mutation BEFORE UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.prevent_ledger_mutation()',t);
  END LOOP;
END $$;

-- استبدال سياسات ALL العامة بسياسات SELECT مرتبطة بالصلاحية.
-- تُمنع الكتابة حتى توجد لها وظائف RPC محددة ومدققة.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_policies WHERE schemaname='public' AND policyname='tenant_member_all'
  LOOP
    EXECUTE format('DROP POLICY tenant_member_all ON public.%I', r.tablename);
  END LOOP;

  FOR r IN SELECT * FROM (VALUES
    ('tenant_settings','settings.manage'),('tenant_currencies','settings.manage'),('support_access_grants','settings.manage'),
    ('product_categories','products.view'),('products','products.view'),('product_images','products.view'),
    ('attribute_definitions','products.view'),('attribute_values','products.view'),('product_variants','products.view'),
    ('variant_attribute_values','products.view'),('variant_cost_history','finance.view'),
    ('warehouses','inventory.view'),('inventory_levels','inventory.view'),('inventory_transactions','inventory.view'),
    ('inventory_reservations','inventory.view'),('warehouse_transfers','inventory.view'),('warehouse_transfer_items','inventory.view'),
    ('customers','customers.view'),('customer_identifiers','customers.view'),('customer_addresses','customers.view'),
    ('orders','orders.view'),('order_items','orders.view'),('order_status_history','orders.view'),('order_payments','finance.view'),
    ('order_fulfillments','orders.view'),('order_fulfillment_items','orders.view'),('order_returns','orders.view'),
    ('order_return_items','orders.view'),('return_inspections','orders.view'),
    ('suppliers','purchasing.view'),('supplier_contacts','purchasing.view'),('purchase_orders','purchasing.view'),
    ('purchase_order_items','purchasing.view'),('goods_receipts','purchasing.view'),('goods_receipt_items','purchasing.view'),
    ('couriers','shipping.view'),('courier_service_areas','shipping.view'),('courier_pricing_rules','shipping.view'),
    ('shipments','shipping.view'),('shipment_items','shipping.view'),('shipment_tracking_events','shipping.view'),
    ('order_cost_entries','finance.view'),('order_refunds','finance.view'),('order_profit_snapshots','finance.view'),
    ('expense_categories','finance.view'),('expenses','finance.view'),('settlements','finance.view'),
    ('settlement_items','finance.view'),('supplier_payments','finance.view'),('supplier_payment_allocations','finance.view'),
    ('integration_connections','integrations.view'),('external_product_mappings','integrations.view'),
    ('external_order_refs','integrations.view'),('webhook_events','integrations.view'),('sync_runs','integrations.view'),
    ('sync_logs','integrations.view'),('audit_logs','settings.manage'),('order_number_sequences','orders.view'),
    ('notifications','reports.view'),('tenant_notification_rules','settings.manage')
  ) AS access(tablename, permission_code)
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS tenant_permission_read ON public.%I', r.tablename);
    EXECUTE format(
      'CREATE POLICY tenant_permission_read ON public.%I FOR SELECT TO authenticated USING (public.user_has_permission(tenant_id, %L))',
      r.tablename, r.permission_code
    );
  END LOOP;
END $$;

-- يحتاج المستخدم إلى عضوياته لاختيار مستأجر؛ اعرض صفوفه، واسمح لمدير
-- المستأجر النشط بقراءة عضوياته.
DROP POLICY IF EXISTS tenant_member_all ON public.tenant_memberships;
DROP POLICY IF EXISTS membership_self_or_admin_read ON public.tenant_memberships;
CREATE POLICY membership_self_or_admin_read ON public.tenant_memberships FOR SELECT TO authenticated
USING (user_id=auth.uid() OR public.user_has_permission(tenant_id,'users.manage'));

-- تظهر أدوار النظام العامة لعرض أسماء العضويات، ولا تظهر أدوار المستأجر
-- إلا لمن لديه users.manage.
DROP POLICY IF EXISTS roles_read_scope ON public.roles;
CREATE POLICY roles_read_scope ON public.roles FOR SELECT TO authenticated
USING (tenant_id IS NULL OR public.user_has_permission(tenant_id,'users.manage'));

DROP POLICY IF EXISTS tenant_member_all ON public.membership_warehouse_access;
DROP POLICY IF EXISTS warehouse_scope_self_read ON public.membership_warehouse_access;
CREATE POLICY warehouse_scope_self_read ON public.membership_warehouse_access FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.tenant_memberships m WHERE m.id=membership_id AND m.user_id=auth.uid()));

-- تظل الصفوف التي تحتوي أسراراً أو رموز دعوة خاصة بالخادم.
DROP POLICY IF EXISTS tenant_member_all ON public.integration_credentials;
DROP POLICY IF EXISTS tenant_member_all ON public.tenant_invitations;
REVOKE ALL ON public.integration_credentials, public.tenant_invitations FROM anon, authenticated;
REVOKE SELECT ON public.product_variants, public.order_items, public.shipments FROM authenticated;
GRANT SELECT (id,tenant_id,product_id,sku,barcode,variant_name,weight_grams,retail_price,status,created_at,updated_at)
  ON public.product_variants TO authenticated;
GRANT SELECT (id,tenant_id,order_id,variant_id,product_name_snapshot,variant_name_snapshot,sku_snapshot,quantity,unit_price,discount_amount,line_total)
  ON public.order_items TO authenticated;
GRANT SELECT (id,tenant_id,fulfillment_id,courier_id,tracking_number,waybill_number,status,cod_amount,booked_at,delivered_at,created_at)
  ON public.shipments TO authenticated;

-- لا تستدعى وظائف سير العمل ذات الامتيازات إلا من كود خادمي موثوق.
REVOKE ALL ON FUNCTION public.inventory_reserve_stock(uuid,uuid,uuid,uuid,integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_next_order_number(uuid,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.inventory_reserve_stock(uuid,uuid,uuid,uuid,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_next_order_number(uuid,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_has_permission(uuid,text) TO authenticated, service_role;
