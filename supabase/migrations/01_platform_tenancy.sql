-- Mini ERP | PostgreSQL 16 / Supabase
-- 01: Platform, tenancy, currencies, settings, support access
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE currencies (
  code text PRIMARY KEY CHECK (code ~ '^[A-Z]{3}$'),
  name text NOT NULL,
  symbol text NOT NULL,
  decimal_places smallint NOT NULL DEFAULT 2 CHECK (decimal_places BETWEEN 0 AND 4),
  is_active boolean NOT NULL DEFAULT true
);
INSERT INTO currencies(code,name,symbol) VALUES
 ('EGP','Egyptian Pound','ج.م'),('USD','US Dollar','$'),('EUR','Euro','€'),
 ('SAR','Saudi Riyal','﷼'),('AED','UAE Dirham','د.إ')
ON CONFLICT DO NOTHING;

CREATE TABLE tenants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL,
 slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
 status text NOT NULL DEFAULT 'active' CHECK (status IN ('trial','active','suspended','cancelled')),
 subscription_tier text NOT NULL DEFAULT 'starter',
 base_currency_code text NOT NULL DEFAULT 'EGP' REFERENCES currencies(code),
 default_timezone text NOT NULL DEFAULT 'Africa/Cairo',
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE tenant_settings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
 setting_key text NOT NULL,
 setting_value jsonb NOT NULL DEFAULT '{}',
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,setting_key)
);
CREATE TABLE tenant_currencies (
 tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
 currency_code text NOT NULL REFERENCES currencies(code),
 exchange_rate numeric(18,8) NOT NULL DEFAULT 1 CHECK(exchange_rate > 0),
 is_default boolean NOT NULL DEFAULT false,
 enabled_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,currency_code)
);
CREATE UNIQUE INDEX tenant_one_default_currency ON tenant_currencies(tenant_id) WHERE is_default;
CREATE TABLE platform_admins (
 user_id uuid PRIMARY KEY,
 created_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid,
 is_active boolean NOT NULL DEFAULT true,
 notes text
);
CREATE TABLE support_access_grants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
 platform_admin_user_id uuid NOT NULL REFERENCES platform_admins(user_id),
 granted_by_user_id uuid NOT NULL,
 reason text NOT NULL,
 granted_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL,
 revoked_at timestamptz,
 CHECK(expires_at > granted_at),
 CHECK(expires_at <= granted_at + interval '24 hours')
);
CREATE TABLE platform_audit_logs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 actor_user_id uuid,
 tenant_id uuid REFERENCES tenants(id),
 action text NOT NULL,
 target_type text,
 target_id text,
 details jsonb NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now()
);
