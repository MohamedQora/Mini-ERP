-- اختبار RLS والامتيازات أثناء التنفيذ بدور قاعدة البيانات authenticated.
BEGIN;
INSERT INTO public.tenants(id,name,slug) VALUES
 ('a6000000-0000-0000-0000-000000000001','RLS Alpha','rls-alpha'),
 ('b6000000-0000-0000-0000-000000000002','RLS Beta','rls-beta');
INSERT INTO auth.users(id,aud,role,email,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) VALUES
 ('c6000000-0000-0000-0000-000000000001','authenticated','authenticated','rls-alpha@example.test','{}','{}',now(),now());
INSERT INTO public.tenant_memberships(tenant_id,user_id,role_id,status) VALUES
 ('a6000000-0000-0000-0000-000000000001','c6000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001','active');
INSERT INTO public.products(id,tenant_id,name,status) VALUES
 ('e6000000-0000-0000-0000-000000000001','a6000000-0000-0000-0000-000000000001','Alpha item','active'),
 ('e6000000-0000-0000-0000-000000000002','b6000000-0000-0000-0000-000000000002','Beta item','active');
SELECT set_config('request.jwt.claims',
 '{"sub":"c6000000-0000-0000-0000-000000000001","role":"authenticated","app_metadata":{"tenant_id":"a6000000-0000-0000-0000-000000000001"}}',true);
SET LOCAL ROLE authenticated;

DO $$
DECLARE n integer; blocked boolean := false;
BEGIN
  SELECT count(*) INTO n FROM public.products WHERE tenant_id='a6000000-0000-0000-0000-000000000001';
  IF n<>1 THEN RAISE EXCEPTION 'Authenticated tenant member cannot read its product'; END IF;
  SELECT count(*) INTO n FROM public.products WHERE tenant_id='b6000000-0000-0000-0000-000000000002';
  IF n<>0 THEN RAISE EXCEPTION 'Authenticated member can read another tenant'; END IF;

  PERFORM set_config('app.current_tenant_id','b6000000-0000-0000-0000-000000000002',true);
  IF public.current_tenant_id()<>'a6000000-0000-0000-0000-000000000001'::uuid THEN
    RAISE EXCEPTION 'Caller-set tenant selector changed the active claim';
  END IF;
  SELECT count(*) INTO n FROM public.products WHERE tenant_id='b6000000-0000-0000-0000-000000000002';
  IF n<>0 THEN RAISE EXCEPTION 'Caller-set tenant selector bypassed RLS'; END IF;

  BEGIN
    INSERT INTO public.products(tenant_id,name,status)
    VALUES ('b6000000-0000-0000-0000-000000000002','Injected','active');
  EXCEPTION WHEN insufficient_privilege OR check_violation THEN blocked:=true;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Authenticated role inserted into another tenant'; END IF;

  IF has_function_privilege(current_user,'public.inventory_reserve_stock(uuid,uuid,uuid,uuid,integer)','EXECUTE') THEN
    RAISE EXCEPTION 'Authenticated role can execute privileged inventory RPC';
  END IF;
END $$;
RESET ROLE;
ROLLBACK;
