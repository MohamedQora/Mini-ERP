-- فحوصات كتالوج RLS والحقول الحساسة وامتيازات RPC.
BEGIN;
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.columns
    WHERE table_schema='public' AND column_name='tenant_id' GROUP BY table_name
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
                   WHERE n.nspname='public' AND c.relname=t AND c.relrowsecurity) THEN
      RAISE EXCEPTION 'RLS disabled for tenant-owned table %',t;
    END IF;
  END LOOP;

  FOREACH t IN ARRAY ARRAY['inventory_transactions','order_status_history','shipment_tracking_events','variant_cost_history','audit_logs','order_profit_snapshots'] LOOP
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t
      AND cmd IN ('INSERT','UPDATE','DELETE','ALL') AND roles @> ARRAY['authenticated']::name[]) THEN
      RAISE EXCEPTION 'Authenticated write policy exists on append-only table %',t;
    END IF;
  END LOOP;

  IF has_column_privilege('authenticated','public.product_variants','current_cost','SELECT') THEN
    RAISE EXCEPTION 'Authenticated can read product variant cost';
  END IF;
  IF has_column_privilege('authenticated','public.order_items','unit_cogs_snapshot','SELECT') THEN
    RAISE EXCEPTION 'Authenticated can read item COGS';
  END IF;
  IF has_column_privilege('authenticated','public.shipments','shipping_cost','SELECT') THEN
    RAISE EXCEPTION 'Authenticated can read courier cost';
  END IF;
  IF has_table_privilege('authenticated','public.tenant_invitations','SELECT') OR
     has_table_privilege('authenticated','public.integration_credentials','SELECT') THEN
    RAISE EXCEPTION 'Authenticated can read token or credential tables';
  END IF;

  IF has_function_privilege('anon','public.inventory_reserve_stock(uuid,uuid,uuid,uuid,integer)','EXECUTE') OR
     has_function_privilege('authenticated','public.inventory_reserve_stock(uuid,uuid,uuid,uuid,integer)','EXECUTE') THEN
    RAISE EXCEPTION 'Untrusted role can execute inventory reservation';
  END IF;
  IF NOT has_function_privilege('service_role','public.inventory_reserve_stock(uuid,uuid,uuid,uuid,integer)','EXECUTE') THEN
    RAISE EXCEPTION 'Service role cannot execute inventory reservation';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.role_permissions rp
     JOIN public.roles r ON r.id=rp.role_id JOIN public.permissions p ON p.id=rp.permission_id
     WHERE r.code='owner' AND p.code='products.view') THEN
    RAISE EXCEPTION 'Owner role permission seed is missing';
  END IF;
END $$;
ROLLBACK;
