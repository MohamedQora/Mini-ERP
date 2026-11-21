-- اختبار الحجز بالتتابع واستبعاد التالف وثبات إعادة المحاولة ومنع البيع الزائد.
-- لا يعوض هذا عن اختبار سباق متعدد الجلسات.
BEGIN;
INSERT INTO public.tenants(id,name,slug) VALUES ('a1000000-0000-0000-0000-000000000001','Gamma','gamma');
INSERT INTO auth.users(id,aud,role,email,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) VALUES
 ('c1000000-0000-0000-0000-000000000001','authenticated','authenticated','gamma@example.test','{}','{}',now(),now());
INSERT INTO public.tenant_memberships(tenant_id,user_id,role_id,status)
VALUES ('a1000000-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','active');
INSERT INTO public.warehouses(id,tenant_id,code,name) VALUES
 ('b1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','CAI-01','Cairo Hub');
INSERT INTO public.products(id,tenant_id,name,status) VALUES
 ('e1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','Summer Polo','active');
INSERT INTO public.product_variants(id,tenant_id,product_id,sku,variant_name,retail_price,current_cost)
VALUES ('f1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001',
 'e1000000-0000-0000-0000-000000000001','POLO-NAVY-M','Navy / M',450,150);
INSERT INTO public.inventory_levels(tenant_id,warehouse_id,variant_id,on_hand,reserved,damaged)
VALUES ('a1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001',
 'f1000000-0000-0000-0000-000000000001',10,0,3);
INSERT INTO public.orders(id,tenant_id,order_number) VALUES
 ('d1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000001','ORD-RES-001'),
 ('d1000000-0000-0000-0000-000000000002','a1000000-0000-0000-0000-000000000001','ORD-RES-002');
SELECT set_config('request.jwt.claims',
  '{"sub":"c1000000-0000-0000-0000-000000000001","role":"authenticated","app_metadata":{"tenant_id":"a1000000-0000-0000-0000-000000000001"}}',true);

DO $$
DECLARE v integer; v_available integer; blocked boolean := false; conflicted boolean := false;
BEGIN
  SELECT available INTO v FROM public.inventory_levels
  WHERE tenant_id='a1000000-0000-0000-0000-000000000001'
    AND warehouse_id='b1000000-0000-0000-0000-000000000001'
    AND variant_id='f1000000-0000-0000-0000-000000000001';
  IF v<>7 THEN RAISE EXCEPTION 'Damaged units were counted as sellable stock: %',v; END IF;

  PERFORM public.inventory_reserve_stock('a1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001','f1000000-0000-0000-0000-000000000001',
    'd1000000-0000-0000-0000-000000000001',5);
  PERFORM public.inventory_reserve_stock('a1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001','f1000000-0000-0000-0000-000000000001',
    'd1000000-0000-0000-0000-000000000001',5);
  SELECT reserved,available INTO v,v_available FROM public.inventory_levels
  WHERE tenant_id='a1000000-0000-0000-0000-000000000001'
    AND warehouse_id='b1000000-0000-0000-0000-000000000001'
    AND variant_id='f1000000-0000-0000-0000-000000000001';
  IF v<>5 OR v_available<>2 THEN RAISE EXCEPTION 'Reservation retry changed balances (reserved %, available %)',v,v_available; END IF;
  IF (SELECT count(*) FROM public.inventory_transactions WHERE reference_id='d1000000-0000-0000-0000-000000000001')<>1 THEN
    RAISE EXCEPTION 'Reservation retry appended a duplicate ledger row';
  END IF;

  BEGIN
    PERFORM public.inventory_reserve_stock('a1000000-0000-0000-0000-000000000001',
      'b1000000-0000-0000-0000-000000000001','f1000000-0000-0000-0000-000000000001',
      'd1000000-0000-0000-0000-000000000001',4);
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Conflicting reservation retry%' THEN conflicted:=true; ELSE RAISE; END IF;
  END;
  IF NOT conflicted THEN RAISE EXCEPTION 'Changed reservation retry was accepted'; END IF;

  BEGIN
    PERFORM public.inventory_reserve_stock('a1000000-0000-0000-0000-000000000001',
      'b1000000-0000-0000-0000-000000000001','f1000000-0000-0000-0000-000000000001',
      'd1000000-0000-0000-0000-000000000002',3);
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Insufficient sellable inventory%' THEN blocked:=true; ELSE RAISE; END IF;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Oversell beyond sellable stock was accepted'; END IF;
END $$;
ROLLBACK;
