// AUTO-GENERATED from the migrations in supabase/migrations (74 tables). Do not edit by hand.
// Row types describe table columns. Some columns (cost fields, invitation tokens) are NOT selectable
// by the browser role - see docs/FRONTEND_NOTES.md. Always use explicit column lists.

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export interface AttributeDefinitionsRow {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  display_type: string;
  is_required: boolean;
  created_at: string;
}

export interface AttributeValuesRow {
  id: string;
  tenant_id: string;
  attribute_definition_id: string;
  name: string;
  value: string;
  color_hex: string | null;
  display_order: number;
}

export interface AuditLogsRow {
  id: string;
  tenant_id: string;
  user_id: string | null;
  table_name: string;
  record_id: string;
  action: string;
  old_data: Json | null;
  new_data: Json | null;
  changed_fields: string[] | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface CourierPricingRulesRow {
  id: string;
  tenant_id: string;
  courier_id: string;
  governorate: string;
  base_fee: number;
  base_weight_kg: number;
  extra_kg_fee: number;
  cod_fee_fixed: number;
  cod_fee_percent: number;
  return_fee: number;
}

export interface CourierServiceAreasRow {
  id: string;
  tenant_id: string;
  courier_id: string;
  governorate: string;
  city: string | null;
  is_deliverable: boolean;
  is_cod_supported: boolean;
  sla_days: number;
}

export interface CouriersRow {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  api_code: string;
  is_active: boolean;
  tracking_url_template: string | null;
  settings: Json | null;
  created_at: string;
  updated_at: string;
}

export interface CurrenciesRow {
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  is_active: boolean;
  created_at: string;
}

export interface CustomerAddressesRow {
  id: string;
  tenant_id: string;
  customer_id: string;
  label: string | null;
  recipient_name: string;
  recipient_phone: string;
  governorate: string;
  city: string;
  district: string | null;
  street_address: string;
  building_number: string | null;
  floor_apartment: string | null;
  landmark: string | null;
  postal_code: string | null;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerIdentifiersRow {
  id: string;
  tenant_id: string;
  customer_id: string;
  type: string;
  identifier_value: string;
  is_primary: boolean;
  is_verified: boolean;
  has_conflict: boolean;
  conflict_notes: string | null;
  created_at: string;
}

export interface CustomersRow {
  id: string;
  tenant_id: string;
  customer_code: string;
  first_name: string;
  last_name: string | null;
  status: string;
  flags: Json | null;
  total_orders_count: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategoriesRow {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ExpensesRow {
  id: string;
  tenant_id: string;
  expense_number: string;
  category_id: string;
  warehouse_id: string | null;
  amount: number;
  currency_code: string;
  status: string;
  payment_method: string | null;
  paid_at: string | null;
  recipient: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExternalOrderRefsRow {
  id: string;
  tenant_id: string;
  connection_id: string;
  internal_order_id: string;
  external_order_id: string;
  external_order_number: string | null;
  external_order_status: string | null;
  raw_payload_hash: string | null;
  first_synced_at: string;
}

export interface ExternalProductMappingsRow {
  id: string;
  tenant_id: string;
  connection_id: string;
  variant_id: string;
  external_product_id: string;
  external_variant_id: string;
  external_sku: string | null;
  sync_inventory: boolean;
  last_synced_at: string | null;
  created_at: string;
}

export interface GoodsReceiptItemsRow {
  id: string;
  tenant_id: string;
  goods_receipt_id: string;
  po_item_id: string;
  variant_id: string;
  received_quantity: number;
  unit_cost_actual: number;
  landed_cost_allocated: number;
  final_unit_cost: number | null;
}

export interface GoodsReceiptsRow {
  id: string;
  tenant_id: string;
  purchase_order_id: string;
  warehouse_id: string;
  receipt_number: string;
  received_by: string;
  status: string;
  received_at: string;
  supplier_delivery_note_ref: string | null;
  notes: string | null;
  created_at: string;
}

export interface IntegrationConnectionsRow {
  id: string;
  tenant_id: string;
  provider_id: string;
  name: string;
  status: string;
  settings: Json | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationCredentialsRow {
  id: string;
  tenant_id: string;
  connection_id: string;
  vault_secret_reference: string;
  key_alias: string;
  encrypted_metadata: Json | null;
  rotated_at: string | null;
  created_at: string;
}

export interface IntegrationProvidersRow {
  id: string;
  name: string;
  code: string;
  category: string;
  supported_features: Json | null;
  is_active: boolean;
  created_at: string;
}

export interface InventoryLevelsRow {
  id: string;
  tenant_id: string;
  warehouse_id: string;
  variant_id: string;
  on_hand: number;
  reserved: number;
  damaged: number;
  sellable: number | null;
  available: number | null;
  updated_at: string;
}

export interface InventoryReservationsRow {
  id: string;
  tenant_id: string;
  warehouse_id: string;
  variant_id: string;
  order_id: string;
  quantity: number;
  status: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransactionsRow {
  id: string;
  tenant_id: string;
  warehouse_id: string;
  variant_id: string;
  transaction_type: string;
  quantity: number;
  balance_after: number;
  reference_type: string;
  reference_id: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface MembershipWarehouseAccessRow {
  id: string;
  tenant_id: string;
  membership_id: string;
  warehouse_id: string;
  access_type: string;
}

export interface NotificationsRow {
  id: string;
  tenant_id: string;
  user_id: string | null;
  title: string;
  body: string;
  type: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface OrderCostEntriesRow {
  id: string;
  tenant_id: string;
  order_id: string;
  cost_type: string;
  amount: number;
  currency_code: string;
  reference_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface OrderFulfillmentItemsRow {
  id: string;
  tenant_id: string;
  fulfillment_id: string;
  order_item_id: string;
  quantity: number;
  shipped_quantity: number;
}

export interface OrderFulfillmentsRow {
  id: string;
  tenant_id: string;
  order_id: string;
  warehouse_id: string;
  fulfillment_number: string;
  status: string;
  packed_at: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemsRow {
  id: string;
  tenant_id: string;
  order_id: string;
  variant_id: string;
  product_name_snapshot: string;
  variant_name_snapshot: string;
  sku_snapshot: string;
  unit_price: number;
  unit_cogs_snapshot: number;
  quantity: number;
  fulfilled_quantity: number;
  returned_quantity: number;
  line_discount: number;
  line_total: number;
  created_at: string;
}

export interface OrderNumberSequencesRow {
  id: string;
  tenant_id: string;
  prefix: string;
  current_number: number;
  year: number;
  padding: number;
  updated_at: string;
}

export interface OrderPaymentsRow {
  id: string;
  tenant_id: string;
  order_id: string;
  payment_method: string;
  payment_gateway: string | null;
  transaction_reference: string | null;
  amount: number;
  currency_code: string;
  status: string;
  settled_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface OrderProfitSnapshotsRow {
  id: string;
  tenant_id: string;
  order_id: string;
  version: number;
  gross_revenue: number;
  total_cogs: number;
  total_shipping_revenue: number;
  total_shipping_cost: number;
  total_payment_fees: number;
  total_packaging_cost: number;
  total_return_costs: number;
  total_discounts: number;
  net_profit: number;
  profit_margin_pct: number;
  is_latest: boolean;
  snapshotted_at: string;
  trigger_event: string;
}

export interface OrderRefundsRow {
  id: string;
  tenant_id: string;
  order_id: string;
  return_id: string | null;
  refund_number: string;
  amount: number;
  method: string;
  gateway_reference: string | null;
  status: string;
  processed_at: string | null;
  reason: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderReturnItemsRow {
  id: string;
  tenant_id: string;
  return_id: string;
  order_item_id: string;
  variant_id: string;
  quantity: number;
  reason: string;
  customer_note: string | null;
}

export interface OrderReturnsRow {
  id: string;
  tenant_id: string;
  order_id: string;
  return_number: string;
  return_type: string;
  replacement_order_id: string | null;
  status: string;
  return_fee: number;
  requested_at: string;
  received_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistoryRow {
  id: string;
  tenant_id: string;
  order_id: string;
  old_status: string | null;
  new_status: string;
  status_type: string;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

export interface OrdersRow {
  id: string;
  tenant_id: string;
  order_number: string;
  customer_id: string;
  sales_channel_id: string;
  warehouse_id: string;
  order_status: string;
  payment_status: string;
  fulfillment_status: string;
  currency_code: string;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  tax_amount: number;
  cod_charge: number;
  total_amount: number;
  total_cogs: number;
  confirmed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PermissionsRow {
  id: string;
  code: string;
  module: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface PlatformAdminsRow {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface PlatformAuditLogsRow {
  id: string;
  admin_id: string | null;
  target_tenant_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  query_hash: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Json | null;
  created_at: string;
}

export interface ProductCategoriesRow {
  id: string;
  tenant_id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductImagesRow {
  id: string;
  tenant_id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface ProductVariantsRow {
  id: string;
  tenant_id: string;
  product_id: string;
  sku: string;
  barcode: string | null;
  weight_grams: number;
  retail_price: number;
  compare_at_price: number | null;
  current_cost: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProductsRow {
  id: string;
  tenant_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  season: string | null;
  brand: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItemsRow {
  id: string;
  tenant_id: string;
  purchase_order_id: string;
  variant_id: string;
  ordered_quantity: number;
  received_quantity: number;
  unit_cost: number;
  tax_rate: number;
  line_total: number;
}

export interface PurchaseOrdersRow {
  id: string;
  tenant_id: string;
  po_number: string;
  supplier_id: string;
  destination_warehouse_id: string;
  status: string;
  currency_code: string;
  exchange_rate: number;
  subtotal: number;
  tax_amount: number;
  freight_amount: number;
  customs_amount: number;
  other_landed_costs: number;
  total_amount: number;
  expected_delivery_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReturnInspectionsRow {
  id: string;
  tenant_id: string;
  return_item_id: string;
  inspector_user_id: string;
  grade: string;
  destination_warehouse_id: string;
  inspected_quantity: number;
  restocked_quantity: number;
  scrap_quantity: number;
  inspection_notes: string | null;
  status: string;
  inspected_at: string;
  processed_at: string | null;
}

export interface RolePermissionsRow {
  id: string;
  role_id: string;
  permission_id: string;
}

export interface RolesRow {
  id: string;
  tenant_id: string | null;
  name: string;
  code: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
}

export interface SalesChannelsRow {
  id: string;
  tenant_id: string;
  connection_id: string | null;
  name: string;
  code: string;
  channel_type: string;
  is_active: boolean;
  currency_code: string;
  created_at: string;
  updated_at: string;
}

export interface SettlementItemsRow {
  id: string;
  tenant_id: string;
  settlement_id: string;
  order_id: string;
  shipment_id: string | null;
  expected_amount: number;
  collected_amount: number;
  fee_deducted: number;
  net_amount: number;
  discrepancy_amount: number | null;
  status: string;
}

export interface SettlementsRow {
  id: string;
  tenant_id: string;
  settlement_number: string;
  settlement_type: string;
  entity_id: string | null;
  total_collected: number;
  total_fees_deducted: number;
  net_payout: number;
  currency_code: string;
  status: string;
  settled_date: string;
  bank_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentItemsRow {
  id: string;
  tenant_id: string;
  shipment_id: string;
  fulfillment_item_id: string;
  quantity: number;
}

export interface ShipmentTrackingEventsRow {
  id: string;
  tenant_id: string;
  shipment_id: string;
  event_status: string;
  courier_raw_status: string | null;
  location: string | null;
  description: string | null;
  event_timestamp: string;
  created_at: string;
}

export interface ShipmentsRow {
  id: string;
  tenant_id: string;
  order_id: string;
  fulfillment_id: string;
  courier_id: string;
  waybill_number: string | null;
  tracking_number: string | null;
  status: string;
  cod_amount: number;
  actual_courier_cost: number;
  return_shipping_cost: number;
  delivery_attempts: number;
  dispatched_at: string | null;
  delivered_at: string | null;
  courier_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierContactsRow {
  id: string;
  tenant_id: string;
  supplier_id: string;
  contact_name: string;
  title: string | null;
  email: string | null;
  phone: string;
  is_primary: boolean;
  created_at: string;
}

export interface SupplierPaymentAllocationsRow {
  id: string;
  tenant_id: string;
  supplier_payment_id: string;
  purchase_order_id: string;
  allocated_amount: number;
  allocated_at: string;
}

export interface SupplierPaymentsRow {
  id: string;
  tenant_id: string;
  payment_number: string;
  supplier_id: string;
  amount: number;
  currency_code: string;
  payment_method: string;
  status: string;
  payment_date: string;
  reference_number: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SuppliersRow {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  tax_registration_number: string | null;
  payment_terms_days: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportAccessGrantsRow {
  id: string;
  tenant_id: string;
  admin_id: string;
  granted_by_user_id: string;
  reason: string;
  access_level: string;
  granted_at: string;
  expires_at: string;
  revoked_at: string | null;
  revoked_by_user_id: string | null;
}

export interface SyncLogsRow {
  id: string;
  tenant_id: string;
  sync_run_id: string;
  level: string;
  entity_type: string | null;
  external_id: string | null;
  message: string;
  context: Json | null;
  created_at: string;
}

export interface SyncRunsRow {
  id: string;
  tenant_id: string;
  connection_id: string;
  sync_type: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  items_processed: number;
  items_succeeded: number;
  items_failed: number;
}

export interface TenantCurrenciesRow {
  id: string;
  tenant_id: string;
  currency_code: string;
  exchange_rate_to_base: number;
  is_base: boolean;
  is_active: boolean;
  updated_at: string;
}

export interface TenantInvitationsRow {
  id: string;
  tenant_id: string;
  email: string;
  role_id: string;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  status: string;
}

export interface TenantMembershipsRow {
  id: string;
  tenant_id: string;
  user_id: string;
  role_id: string;
  status: string;
  invited_at: string | null;
  joined_at: string | null;
}

export interface TenantNotificationRulesRow {
  id: string;
  tenant_id: string;
  event_trigger: string;
  channel: string;
  recipient_role_id: string | null;
  recipient_emails: string[] | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantSettingsRow {
  id: string;
  tenant_id: string;
  key: string;
  value: Json;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface TenantsRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  tier: string;
  default_currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfilesRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface VariantAttributeValuesRow {
  id: string;
  tenant_id: string;
  variant_id: string;
  attribute_definition_id: string;
  attribute_value_id: string;
}

export interface VariantCostHistoryRow {
  id: string;
  tenant_id: string;
  variant_id: string;
  cost: number;
  costing_method: string;
  effective_at: string;
  source_reference_type: string | null;
  source_reference_id: string | null;
  notes: string | null;
  created_by: string | null;
}

export interface WarehouseTransferItemsRow {
  id: string;
  tenant_id: string;
  transfer_id: string;
  variant_id: string;
  requested_quantity: number;
  dispatched_quantity: number;
  received_quantity: number;
}

export interface WarehouseTransfersRow {
  id: string;
  tenant_id: string;
  transfer_number: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  status: string;
  dispatched_at: string | null;
  received_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WarehousesRow {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  type: string;
  address_line: string | null;
  city: string | null;
  governorate: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookEventsRow {
  id: string;
  tenant_id: string;
  connection_id: string;
  event_type: string;
  external_event_id: string | null;
  payload: Json;
  status: string;
  retry_count: number;
  error_message: string | null;
  received_at: string;
  processed_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      attribute_definitions: { Row: AttributeDefinitionsRow; Insert: Partial<AttributeDefinitionsRow>; Update: Partial<AttributeDefinitionsRow>; Relationships: [] };
      attribute_values: { Row: AttributeValuesRow; Insert: Partial<AttributeValuesRow>; Update: Partial<AttributeValuesRow>; Relationships: [] };
      audit_logs: { Row: AuditLogsRow; Insert: Partial<AuditLogsRow>; Update: Partial<AuditLogsRow>; Relationships: [] };
      courier_pricing_rules: { Row: CourierPricingRulesRow; Insert: Partial<CourierPricingRulesRow>; Update: Partial<CourierPricingRulesRow>; Relationships: [] };
      courier_service_areas: { Row: CourierServiceAreasRow; Insert: Partial<CourierServiceAreasRow>; Update: Partial<CourierServiceAreasRow>; Relationships: [] };
      couriers: { Row: CouriersRow; Insert: Partial<CouriersRow>; Update: Partial<CouriersRow>; Relationships: [] };
      currencies: { Row: CurrenciesRow; Insert: Partial<CurrenciesRow>; Update: Partial<CurrenciesRow>; Relationships: [] };
      customer_addresses: { Row: CustomerAddressesRow; Insert: Partial<CustomerAddressesRow>; Update: Partial<CustomerAddressesRow>; Relationships: [] };
      customer_identifiers: { Row: CustomerIdentifiersRow; Insert: Partial<CustomerIdentifiersRow>; Update: Partial<CustomerIdentifiersRow>; Relationships: [] };
      customers: { Row: CustomersRow; Insert: Partial<CustomersRow>; Update: Partial<CustomersRow>; Relationships: [] };
      expense_categories: { Row: ExpenseCategoriesRow; Insert: Partial<ExpenseCategoriesRow>; Update: Partial<ExpenseCategoriesRow>; Relationships: [] };
      expenses: { Row: ExpensesRow; Insert: Partial<ExpensesRow>; Update: Partial<ExpensesRow>; Relationships: [] };
      external_order_refs: { Row: ExternalOrderRefsRow; Insert: Partial<ExternalOrderRefsRow>; Update: Partial<ExternalOrderRefsRow>; Relationships: [] };
      external_product_mappings: { Row: ExternalProductMappingsRow; Insert: Partial<ExternalProductMappingsRow>; Update: Partial<ExternalProductMappingsRow>; Relationships: [] };
      goods_receipt_items: { Row: GoodsReceiptItemsRow; Insert: Partial<GoodsReceiptItemsRow>; Update: Partial<GoodsReceiptItemsRow>; Relationships: [] };
      goods_receipts: { Row: GoodsReceiptsRow; Insert: Partial<GoodsReceiptsRow>; Update: Partial<GoodsReceiptsRow>; Relationships: [] };
      integration_connections: { Row: IntegrationConnectionsRow; Insert: Partial<IntegrationConnectionsRow>; Update: Partial<IntegrationConnectionsRow>; Relationships: [] };
      integration_credentials: { Row: IntegrationCredentialsRow; Insert: Partial<IntegrationCredentialsRow>; Update: Partial<IntegrationCredentialsRow>; Relationships: [] };
      integration_providers: { Row: IntegrationProvidersRow; Insert: Partial<IntegrationProvidersRow>; Update: Partial<IntegrationProvidersRow>; Relationships: [] };
      inventory_levels: { Row: InventoryLevelsRow; Insert: Partial<InventoryLevelsRow>; Update: Partial<InventoryLevelsRow>; Relationships: [] };
      inventory_reservations: { Row: InventoryReservationsRow; Insert: Partial<InventoryReservationsRow>; Update: Partial<InventoryReservationsRow>; Relationships: [] };
      inventory_transactions: { Row: InventoryTransactionsRow; Insert: Partial<InventoryTransactionsRow>; Update: Partial<InventoryTransactionsRow>; Relationships: [] };
      membership_warehouse_access: { Row: MembershipWarehouseAccessRow; Insert: Partial<MembershipWarehouseAccessRow>; Update: Partial<MembershipWarehouseAccessRow>; Relationships: [] };
      notifications: { Row: NotificationsRow; Insert: Partial<NotificationsRow>; Update: Partial<NotificationsRow>; Relationships: [] };
      order_cost_entries: { Row: OrderCostEntriesRow; Insert: Partial<OrderCostEntriesRow>; Update: Partial<OrderCostEntriesRow>; Relationships: [] };
      order_fulfillment_items: { Row: OrderFulfillmentItemsRow; Insert: Partial<OrderFulfillmentItemsRow>; Update: Partial<OrderFulfillmentItemsRow>; Relationships: [] };
      order_fulfillments: { Row: OrderFulfillmentsRow; Insert: Partial<OrderFulfillmentsRow>; Update: Partial<OrderFulfillmentsRow>; Relationships: [] };
      order_items: { Row: OrderItemsRow; Insert: Partial<OrderItemsRow>; Update: Partial<OrderItemsRow>; Relationships: [] };
      order_number_sequences: { Row: OrderNumberSequencesRow; Insert: Partial<OrderNumberSequencesRow>; Update: Partial<OrderNumberSequencesRow>; Relationships: [] };
      order_payments: { Row: OrderPaymentsRow; Insert: Partial<OrderPaymentsRow>; Update: Partial<OrderPaymentsRow>; Relationships: [] };
      order_profit_snapshots: { Row: OrderProfitSnapshotsRow; Insert: Partial<OrderProfitSnapshotsRow>; Update: Partial<OrderProfitSnapshotsRow>; Relationships: [] };
      order_refunds: { Row: OrderRefundsRow; Insert: Partial<OrderRefundsRow>; Update: Partial<OrderRefundsRow>; Relationships: [] };
      order_return_items: { Row: OrderReturnItemsRow; Insert: Partial<OrderReturnItemsRow>; Update: Partial<OrderReturnItemsRow>; Relationships: [] };
      order_returns: { Row: OrderReturnsRow; Insert: Partial<OrderReturnsRow>; Update: Partial<OrderReturnsRow>; Relationships: [] };
      order_status_history: { Row: OrderStatusHistoryRow; Insert: Partial<OrderStatusHistoryRow>; Update: Partial<OrderStatusHistoryRow>; Relationships: [] };
      orders: { Row: OrdersRow; Insert: Partial<OrdersRow>; Update: Partial<OrdersRow>; Relationships: [] };
      permissions: { Row: PermissionsRow; Insert: Partial<PermissionsRow>; Update: Partial<PermissionsRow>; Relationships: [] };
      platform_admins: { Row: PlatformAdminsRow; Insert: Partial<PlatformAdminsRow>; Update: Partial<PlatformAdminsRow>; Relationships: [] };
      platform_audit_logs: { Row: PlatformAuditLogsRow; Insert: Partial<PlatformAuditLogsRow>; Update: Partial<PlatformAuditLogsRow>; Relationships: [] };
      product_categories: { Row: ProductCategoriesRow; Insert: Partial<ProductCategoriesRow>; Update: Partial<ProductCategoriesRow>; Relationships: [] };
      product_images: { Row: ProductImagesRow; Insert: Partial<ProductImagesRow>; Update: Partial<ProductImagesRow>; Relationships: [] };
      product_variants: { Row: ProductVariantsRow; Insert: Partial<ProductVariantsRow>; Update: Partial<ProductVariantsRow>; Relationships: [] };
      products: { Row: ProductsRow; Insert: Partial<ProductsRow>; Update: Partial<ProductsRow>; Relationships: [] };
      purchase_order_items: { Row: PurchaseOrderItemsRow; Insert: Partial<PurchaseOrderItemsRow>; Update: Partial<PurchaseOrderItemsRow>; Relationships: [] };
      purchase_orders: { Row: PurchaseOrdersRow; Insert: Partial<PurchaseOrdersRow>; Update: Partial<PurchaseOrdersRow>; Relationships: [] };
      return_inspections: { Row: ReturnInspectionsRow; Insert: Partial<ReturnInspectionsRow>; Update: Partial<ReturnInspectionsRow>; Relationships: [] };
      role_permissions: { Row: RolePermissionsRow; Insert: Partial<RolePermissionsRow>; Update: Partial<RolePermissionsRow>; Relationships: [] };
      roles: { Row: RolesRow; Insert: Partial<RolesRow>; Update: Partial<RolesRow>; Relationships: [] };
      sales_channels: { Row: SalesChannelsRow; Insert: Partial<SalesChannelsRow>; Update: Partial<SalesChannelsRow>; Relationships: [] };
      settlement_items: { Row: SettlementItemsRow; Insert: Partial<SettlementItemsRow>; Update: Partial<SettlementItemsRow>; Relationships: [] };
      settlements: { Row: SettlementsRow; Insert: Partial<SettlementsRow>; Update: Partial<SettlementsRow>; Relationships: [] };
      shipment_items: { Row: ShipmentItemsRow; Insert: Partial<ShipmentItemsRow>; Update: Partial<ShipmentItemsRow>; Relationships: [] };
      shipment_tracking_events: { Row: ShipmentTrackingEventsRow; Insert: Partial<ShipmentTrackingEventsRow>; Update: Partial<ShipmentTrackingEventsRow>; Relationships: [] };
      shipments: { Row: ShipmentsRow; Insert: Partial<ShipmentsRow>; Update: Partial<ShipmentsRow>; Relationships: [] };
      supplier_contacts: { Row: SupplierContactsRow; Insert: Partial<SupplierContactsRow>; Update: Partial<SupplierContactsRow>; Relationships: [] };
      supplier_payment_allocations: { Row: SupplierPaymentAllocationsRow; Insert: Partial<SupplierPaymentAllocationsRow>; Update: Partial<SupplierPaymentAllocationsRow>; Relationships: [] };
      supplier_payments: { Row: SupplierPaymentsRow; Insert: Partial<SupplierPaymentsRow>; Update: Partial<SupplierPaymentsRow>; Relationships: [] };
      suppliers: { Row: SuppliersRow; Insert: Partial<SuppliersRow>; Update: Partial<SuppliersRow>; Relationships: [] };
      support_access_grants: { Row: SupportAccessGrantsRow; Insert: Partial<SupportAccessGrantsRow>; Update: Partial<SupportAccessGrantsRow>; Relationships: [] };
      sync_logs: { Row: SyncLogsRow; Insert: Partial<SyncLogsRow>; Update: Partial<SyncLogsRow>; Relationships: [] };
      sync_runs: { Row: SyncRunsRow; Insert: Partial<SyncRunsRow>; Update: Partial<SyncRunsRow>; Relationships: [] };
      tenant_currencies: { Row: TenantCurrenciesRow; Insert: Partial<TenantCurrenciesRow>; Update: Partial<TenantCurrenciesRow>; Relationships: [] };
      tenant_invitations: { Row: TenantInvitationsRow; Insert: Partial<TenantInvitationsRow>; Update: Partial<TenantInvitationsRow>; Relationships: [] };
      tenant_memberships: { Row: TenantMembershipsRow; Insert: Partial<TenantMembershipsRow>; Update: Partial<TenantMembershipsRow>; Relationships: [] };
      tenant_notification_rules: { Row: TenantNotificationRulesRow; Insert: Partial<TenantNotificationRulesRow>; Update: Partial<TenantNotificationRulesRow>; Relationships: [] };
      tenant_settings: { Row: TenantSettingsRow; Insert: Partial<TenantSettingsRow>; Update: Partial<TenantSettingsRow>; Relationships: [] };
      tenants: { Row: TenantsRow; Insert: Partial<TenantsRow>; Update: Partial<TenantsRow>; Relationships: [] };
      user_profiles: { Row: UserProfilesRow; Insert: Partial<UserProfilesRow>; Update: Partial<UserProfilesRow>; Relationships: [] };
      variant_attribute_values: { Row: VariantAttributeValuesRow; Insert: Partial<VariantAttributeValuesRow>; Update: Partial<VariantAttributeValuesRow>; Relationships: [] };
      variant_cost_history: { Row: VariantCostHistoryRow; Insert: Partial<VariantCostHistoryRow>; Update: Partial<VariantCostHistoryRow>; Relationships: [] };
      warehouse_transfer_items: { Row: WarehouseTransferItemsRow; Insert: Partial<WarehouseTransferItemsRow>; Update: Partial<WarehouseTransferItemsRow>; Relationships: [] };
      warehouse_transfers: { Row: WarehouseTransfersRow; Insert: Partial<WarehouseTransfersRow>; Update: Partial<WarehouseTransfersRow>; Relationships: [] };
      warehouses: { Row: WarehousesRow; Insert: Partial<WarehousesRow>; Update: Partial<WarehousesRow>; Relationships: [] };
      webhook_events: { Row: WebhookEventsRow; Insert: Partial<WebhookEventsRow>; Update: Partial<WebhookEventsRow>; Relationships: [] };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
  };
}
