-- اختبار استقلال حالات الطلب والدفع والتنفيذ وقيود المدخلات المالية.
BEGIN;
INSERT INTO public.tenants(id,name,slug) VALUES
 ('a2000000-0000-0000-0000-000000000001','Delta','delta'),
 ('b2000000-0000-0000-0000-000000000002','Epsilon','epsilon');
INSERT INTO public.customers(id,tenant_id,full_name) VALUES
 ('c2000000-0000-0000-0000-000000000001','a2000000-0000-0000-0000-000000000001','Customer A'),
 ('c2000000-0000-0000-0000-000000000002','b2000000-0000-0000-0000-000000000002','Customer B');
INSERT INTO public.orders(id,tenant_id,order_number,customer_id,status,payment_status,fulfillment_status,subtotal,grand_total)
VALUES ('d2000000-0000-0000-0000-000000000001','a2000000-0000-0000-0000-000000000001','ORD-STATE-01',
 'c2000000-0000-0000-0000-000000000001','confirmed','unpaid','unfulfilled',1600,1600);

DO $$
DECLARE bad_amount boolean := false; bad_tenant boolean := false;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.orders WHERE id='d2000000-0000-0000-0000-000000000001'
    AND status='confirmed' AND payment_status='unpaid' AND fulfillment_status='unfulfilled') THEN
    RAISE EXCEPTION 'Order, payment and fulfillment state columns are not independent';
  END IF;
  BEGIN
    INSERT INTO public.orders(tenant_id,order_number,subtotal)
    VALUES ('a2000000-0000-0000-0000-000000000001','ORD-NEGATIVE',-1);
  EXCEPTION WHEN check_violation THEN bad_amount:=true;
  END;
  IF NOT bad_amount THEN RAISE EXCEPTION 'Negative subtotal was accepted'; END IF;

  BEGIN
    INSERT INTO public.orders(tenant_id,order_number,customer_id)
    VALUES ('a2000000-0000-0000-0000-000000000001','ORD-CROSS-CUSTOMER','c2000000-0000-0000-0000-000000000002');
  EXCEPTION WHEN foreign_key_violation THEN bad_tenant:=true;
  END;
  IF NOT bad_tenant THEN RAISE EXCEPTION 'Cross-tenant customer reference was accepted'; END IF;
END $$;
ROLLBACK;
