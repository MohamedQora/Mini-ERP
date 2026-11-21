# Mini ERP — Architecture Documentation

This repository houses the database schema, business logic, and backend configurations for the **Mini ERP** system tailored to clothing and fashion brands in Egypt (EGP base).

## Architecture Highlights
- **Platform**: Supabase / PostgreSQL 16
- **Isolation**: Tenant-owned tables contain `tenant_id` with composite foreign keys and strict Row Level Security (RLS).
- **Scale**: 74 tables partitioned into 11 functional modules.
- **Inventory Model**: Append-only transaction ledger with atomic reservation locks (`SELECT ... FOR UPDATE`) preventing overselling.
- **State Decoupling**: Orders, Payments, and Fulfillments operate on independent state machines.

See detailed design and open decision analysis in the system blueprint artifact.

## Implementation status (2026-11-21)
- The blueprint is the target design, not a claim that all workflows exist. The repository currently has 8 SQL migrations and 6 SQL suites; the base schema defines 74 tables.
- Current tenant context is read from the trusted Supabase JWT `app_metadata.tenant_id` by `public.current_tenant_id()`. The blueprint's illustrative helper under `auth` is not used because Supabase owns that schema.
- Supabase CLI in the checked environment accepts local PostgreSQL 15/17, not 16. Current local verification used PostgreSQL 17. PostgreSQL 16 remains the target but has not been verified.
- Supplier receipt/WAC, shipment pickup deduction, returns, settlements, warehouse-scoped permissions and full ERP UI workflows remain incomplete.
