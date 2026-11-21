# Mini ERP — Final Business Logic Decisions

**Status:** Recommended design decisions; not evidence that these workflows are implemented or business-approved
**Platform:** PostgreSQL 16 / Supabase  
**Domain:** Multi-tenant clothing-brand ERP; EGP base currency

These decisions are selected based on operational practicality, inventory/financial integrity, security, and common ERP controls. They supersede unapproved assumptions in the implementation.

## 1. Inventory costing
- Method: perpetual moving weighted-average cost (WAC).
- Scope: per tenant and product variant, across all tenant warehouses.
- Incoming cost includes directly attributable landed costs (freight, customs, clearance, etc.).
- Allocate shared landed costs proportionally by receipt-line extended purchase value; allow an explicit allocation method/amount with audit trail when value-based allocation is unsuitable.
- Damaged stock is tracked separately from sellable stock. Damage write-offs reduce inventory value and are recorded as an expense; do not silently include scrapped units in sellable WAC quantity.
- Preserve unit COGS snapshots on confirmed order lines. Later cost changes must not rewrite historical snapshots.
- Cost recalculation must lock the variant costing record and inventory valuation inputs; serialize concurrent receipts for the same variant.

## 2. Purchasing and receiving
- Default over-receiving tolerance: 0%.
- Zero tolerance is the default and initial implementation. Excess quantities require an approved PO amendment before receipt; no receipt function may accept caller-supplied tolerance as authorization.
- Partial receipts and multiple receipts per PO are supported.
- Each receipt is posted atomically and idempotently.
- Posted receipts are immutable; corrections use reversal/adjustment records.
- PO completion requires all lines received, cancelled, or explicitly closed with remaining quantity and reason recorded.
- Receiving must validate tenant, PO/receipt state, warehouse, variant, line identity, quantities, unit costs, and remaining authorized quantity.

## 3. Reservations and available stock
- Reserve stock when an order is confirmed, using an atomic transaction and row locks.
- Reservations are warehouse- and order-item-specific.
- Only sellable stock may be reserved: on-hand minus damaged minus active reservations.
- Negative sellable/available stock is prohibited.
- Unpaid reservations expire after 24 hours by default; tenant setting may change this. Paid orders do not expire automatically while awaiting fulfillment.
- Cancellation releases only unshipped active reservation quantities.
- Reservation release/fulfillment must reconcile exactly; discrepancies raise an exception and are not hidden with `GREATEST(0, ...)`.

## 4. Fulfillment and shipment
- Packing, label generation, and dispatch preparation do not deduct inventory.
- Inventory deduction occurs only on confirmed courier pickup (`picked_up`).
- Partial shipments are supported. Deduct only quantities included in that pickup event.
- Each pickup event is idempotent and uniquely identified; retries must not double-deduct.
- Deduction requires sufficient on-hand and reservation quantities. No negative stock and no silent reservation underflow.
- Cancellation before pickup releases the remaining reservation. After pickup, use a return or authorized inventory adjustment; do not restore stock merely by changing shipment status.
- Track fulfillment, shipment, order, payment, and return state separately; validate transitions.

## 5. Returns and quality inspection
- Returns are accepted only against quantities delivered, net of prior accepted returns.
- Refund authorization and physical inspection are separate workflow steps.
- Inspection grades:
  - Grade A: resalable; restock into sellable stock.
  - Grade B: refurbishable/discount outlet; route to a designated outlet or quarantine location and keep separate from normal sellable stock until disposition.
  - Grade C: unsellable; record damaged/scrap stock and an approved write-off.
- Inspection processing is atomic and idempotent.
- Restocked/scrapped quantities must reconcile to inspected quantity; partial disposition must be explicitly recorded.
- Returned quantity on the original order item increments only after the return is accepted/processed, not when a return request is created.
- Refunds cannot exceed the amount paid or otherwise payable under the order and must have a traceable approval/payment state.

## 6. Revenue, profit, payments, and settlements
- Show operational sales at order confirmation, but label them as order value—not recognized revenue.
- Show estimated profit after confirmation using snapshot COGS and expected costs; clearly mark it estimated.
- Recognize operational revenue when delivery is confirmed. Failed/refused delivery is not revenue.
- COD is not cash collected until courier settlement is reconciled and confirmed.
- Actual profit is calculated from delivered revenue, discounts, actual COGS, shipping/courier costs, payment fees, packaging, return costs, refunds, and other allocated costs.
- Keep shipment/courier payable, customer collection, courier remittance, fees, shortage/overage, and settlement adjustments as separate ledger items.
- Refunds are recorded through explicit refund transactions; never mutate original payment history.
- Posted financial transactions are immutable. Correct with reversal/adjustment entries.
- Expenses follow draft → approved → posted; posting requires permission and supporting reference/reason. Posted expense cannot be edited/deleted.
- Supplier payments support partial allocation and must not exceed available payable balance without an explicitly authorized advance/overpayment workflow.

## 7. Support access
- Tenant-consented grant required; platform admin role alone does not grant tenant data access.
- Read-only by default. Write access is separately granted and narrowly scoped.
- Default grant duration: 2 hours; hard maximum: 24 hours.
- Require reason, grantor, grantee, scope, start/end, and audit events.
- Expired/revoked grants deny access immediately; no reuse or silent renewal.

## 8. Audit, retention, and partitioning
- Preserve financial, inventory, security, and audit history; no automatic deletion of posted records.
- Initial release does not partition ledgers or delete history automatically.
- Partitioning may be introduced later as a performance change after workload measurement and a reviewed retention/archive policy.
- Audit/ledger records are append-only; corrections are new events.

## 9. State machine and idempotency requirements
- Enforce valid transitions for orders, payments, fulfillments, shipments, purchase orders, receipts, returns, inspections, expenses, and settlements.
- Every stock/money-changing operation accepts or derives a stable idempotency key/reference.
- Repeated identical request returns the original outcome; a conflicting replay fails.
- Operations that update a balance and append a ledger entry must occur in one database transaction.
- Lock records in a deterministic order where multiple stock/variant rows are affected to reduce deadlocks.

## 10. Implementation and verification gate
- Implement changes in new migrations; do not rewrite migration history.
- Execute all migrations from a clean PostgreSQL 16/Supabase-compatible database.
- Test RLS as anon, authenticated users with distinct roles, tenant members from different tenants, support users with/without grants, and service role.
- Add tests for concurrency, duplicate requests, partial receipt/shipment/return, reservation expiry, reversals, invalid state transitions, reconciliation, and audit immutability.
- Do not declare production-ready until migration execution and regression/security tests have actual passing results.
