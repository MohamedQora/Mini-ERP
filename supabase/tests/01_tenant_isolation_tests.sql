-- اختبارات عزل المستأجر والمفاتيح المركبة للمخطط الفعلي.
BEGIN;

INSERT INTO public.tenants(id,name,slug) VALUES
 ('a0000000-0000-0000-0000-000000000001','Alpha','alpha'),
 ('b0000000-0000-0000-0000-000000000002','Beta','beta');
INSERT INTO auth.users(id,aud,role,email,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) VALUES
 ('c0000000-0000-0000-0000-000000000001','authenticated','authenticated','alpha@example.test','{}','{}',now(),now());
INSERT INTO public.tenant_memberships(id,tenant_id,user_id,role_id,status) VALUES
 ('d0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','active');
INSERT INTO public.products(id,tenant_id,name,status) VALUES
 ('e0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','Alpha item','active'),
 ('e0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000002','Beta item','active');

DO $$
DECLARE blocked boolean := false;
BEGIN
  BEGIN
    INSERT INTO public.product_variants(tenant_id,product_id,sku,variant_name)
    VALUES ('a0000000-0000-0000-0000-000000000001',
            'e0000000-0000-0000-0000-000000000002','CROSS-TENANT','Wrong tenant');
  EXCEPTION WHEN foreign_key_violation THEN blocked := true;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Composite tenant FK accepted a cross-tenant product'; END IF;
END $$;

SELECT set_config('request.jwt.claims',
  '{"sub":"c0000000-0000-0000-0000-000000000001","role":"authenticated","app_metadata":{"tenant_id":"a0000000-0000-0000-0000-000000000001"}}',true);
SET LOCAL ROLE authenticated;
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM public.products WHERE tenant_id='a0000000-0000-0000-0000-000000000001';
  IF n<>1 THEN RAISE EXCEPTION 'Member cannot read own tenant product'; END IF;
  SELECT count(*) INTO n FROM public.products WHERE tenant_id='b0000000-0000-0000-0000-000000000002';
  IF n<>0 THEN RAISE EXCEPTION 'Member can read another tenant product'; END IF;
  PERFORM set_config('app.current_tenant_id','b0000000-0000-0000-0000-000000000002',true);
  IF public.current_tenant_id()<>'a0000000-0000-0000-0000-000000000001'::uuid THEN
    RAISE EXCEPTION 'Caller-set tenant selector overrode the signed tenant claim';
  END IF;
END $$;
RESET ROLE;
ROLLBACK;
