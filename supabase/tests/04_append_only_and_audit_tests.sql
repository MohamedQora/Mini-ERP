-- اختبار ثبات الدفاتر وتسلسل أرقام الطلبات لكل مستأجر.
BEGIN;
INSERT INTO public.tenants(id,name,slug) VALUES ('a3000000-0000-0000-0000-000000000001','Zeta','zeta');
INSERT INTO auth.users(id,aud,role,email,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) VALUES
 ('c3000000-0000-0000-0000-000000000001','authenticated','authenticated','zeta@example.test','{}','{}',now(),now());
INSERT INTO public.tenant_memberships(tenant_id,user_id,role_id,status)
VALUES ('a3000000-0000-0000-0000-000000000001','c3000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','active');
INSERT INTO public.warehouses(id,tenant_id,code,name) VALUES
 ('b3000000-0000-0000-0000-000000000001','a3000000-0000-0000-0000-000000000001','DEPOT','Depot');
INSERT INTO public.products(id,tenant_id,name) VALUES
 ('e3000000-0000-0000-0000-000000000001','a3000000-0000-0000-0000-000000000001','Test product');
INSERT INTO public.product_variants(id,tenant_id,product_id,sku,variant_name)
VALUES ('f3000000-0000-0000-0000-000000000001','a3000000-0000-0000-0000-000000000001',
 'e3000000-0000-0000-0000-000000000001','TEST-01','Default');
INSERT INTO public.orders(id,tenant_id,order_number) VALUES
 ('d3000000-0000-0000-0000-000000000001','a3000000-0000-0000-0000-000000000001','ORD-AUDIT');
INSERT INTO public.inventory_transactions(id,tenant_id,warehouse_id,variant_id,transaction_type,quantity)
VALUES ('f3000000-0000-0000-0000-000000000002','a3000000-0000-0000-0000-000000000001',
 'b3000000-0000-0000-0000-000000000001','f3000000-0000-0000-0000-000000000001','receipt',10);
INSERT INTO public.audit_logs(id,tenant_id,actor_user_id,action,entity_type,entity_id)
VALUES ('f3000000-0000-0000-0000-000000000003','a3000000-0000-0000-0000-000000000001',
 'c3000000-0000-0000-0000-000000000001','created','orders','d3000000-0000-0000-0000-000000000001');
SELECT set_config('request.jwt.claims',
 '{"sub":"c3000000-0000-0000-0000-000000000001","role":"authenticated","app_metadata":{"tenant_id":"a3000000-0000-0000-0000-000000000001"}}',true);

DO $$
DECLARE update_blocked boolean := false; delete_blocked boolean := false; n1 text; n2 text;
BEGIN
  BEGIN UPDATE public.inventory_transactions SET quantity=11 WHERE id='f3000000-0000-0000-0000-000000000002';
  EXCEPTION WHEN raise_exception THEN update_blocked:=true; END;
  BEGIN DELETE FROM public.inventory_transactions WHERE id='f3000000-0000-0000-0000-000000000002';
  EXCEPTION WHEN raise_exception THEN delete_blocked:=true; END;
  IF NOT update_blocked OR NOT delete_blocked THEN RAISE EXCEPTION 'Inventory ledger mutation was allowed'; END IF;

  update_blocked:=false; delete_blocked:=false;
  BEGIN UPDATE public.audit_logs SET action='tampered' WHERE id='f3000000-0000-0000-0000-000000000003';
  EXCEPTION WHEN raise_exception THEN update_blocked:=true; END;
  BEGIN DELETE FROM public.audit_logs WHERE id='f3000000-0000-0000-0000-000000000003';
  EXCEPTION WHEN raise_exception THEN delete_blocked:=true; END;
  IF NOT update_blocked OR NOT delete_blocked THEN RAISE EXCEPTION 'Audit ledger mutation was allowed'; END IF;

  n1:=public.get_next_order_number('a3000000-0000-0000-0000-000000000001',2026);
  n2:=public.get_next_order_number('a3000000-0000-0000-0000-000000000001',2026);
  IF n1<>'ORD-2026-000001' OR n2<>'ORD-2026-000002' THEN
    RAISE EXCEPTION 'Sequence allocator produced unexpected values %, %',n1,n2;
  END IF;
END $$;
ROLLBACK;
