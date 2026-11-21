-- 02: Profiles, RBAC, tenant memberships, warehouse scope
CREATE TABLE user_profiles (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text,
 avatar_url text,
 metadata jsonb NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
 name text NOT NULL,
 description text,
 is_system_role boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,name)
);
CREATE TABLE permissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 code text NOT NULL UNIQUE,
 description text NOT NULL,
 module text NOT NULL
);
CREATE TABLE role_permissions (
 role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
 permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
 PRIMARY KEY(role_id,permission_id)
);
CREATE TABLE tenant_memberships (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 role_id uuid NOT NULL REFERENCES roles(id),
 status text NOT NULL DEFAULT 'invited' CHECK(status IN ('active','suspended','invited')),
 joined_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,user_id),
 UNIQUE(tenant_id,id)
);
CREATE TABLE membership_warehouse_access (
 tenant_id uuid NOT NULL,
 membership_id uuid NOT NULL,
 warehouse_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id,membership_id,warehouse_id),
 FOREIGN KEY(tenant_id,membership_id) REFERENCES tenant_memberships(tenant_id,id) ON DELETE CASCADE
);
CREATE TABLE tenant_invitations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
 email text NOT NULL,
 role_id uuid NOT NULL REFERENCES roles(id),
 token_hash text NOT NULL UNIQUE,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','expired','revoked')),
 invited_by uuid NOT NULL,
 expires_at timestamptz NOT NULL,
 accepted_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
