"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KpiCard } from "@/components/ui/card";
import { BarChart, DonutChart, LineChart } from "@/components/ui/charts";
import { DataTable, Pagination, type Sort } from "@/components/ui/data-table";
import { ConfirmDialog, Dialog, Drawer } from "@/components/ui/dialog";
import { Field, Input, SearchField, Select } from "@/components/ui/form";
import { MenuItem } from "@/components/ui/menu";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n/provider";
import { formatMoney } from "@/lib/format";
import { normalizeEgyptMobile } from "@/lib/egypt";

// SAMPLE DATA — for component preview only. Never used by real screens.
const rows = [
  { id: "1", sku: "TS-BLK-M", name: "Basic Tee — Black / M", stock: 42, price: 450, status: "ok" },
  { id: "2", sku: "TS-BLK-L", name: "Basic Tee — Black / L", stock: 4, price: 450, status: "low" },
  { id: "3", sku: "HD-GRY-L", name: "Hoodie — Grey / L", stock: 0, price: 1250, status: "out" },
];

export function UiKit() {
  const { t, locale } = useI18n();
  const toast = useToast();
  const [tab, setTab] = useState("a");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort | null>(null);
  const [page, setPage] = useState(1);
  const [dlg, setDlg] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [phone, setPhone] = useState("010 1234 5678");

  const shown = rows.filter((r) => (r.name + r.sku).toLowerCase().includes(q.toLowerCase()));
  const m = (n: number) => formatMoney(n, "EGP", locale);
  return (
    <AppShell ctx={{ userName: "Sample User", userEmail: "sample@example.com", roleCode: "owner", roleName: "Owner", tenants: [{ id: "x", name: "Sample Brand" }], activeTenantId: "x", visibleKeys: ["dashboard", "products", "inventory", "orders", "customers", "purchasing", "shipping", "finance", "integrations", "reports", "settings"] }}>
      <PageHeader title="UI kit" description={t("ui.sample")} actions={<><Button variant="secondary" onClick={() => setDrawer(true)}>Drawer</Button><Button onClick={() => setDlg(true)}><Plus className="size-4" />Dialog</Button></>} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total sales" value={m(128450)} delta="12.4%" deltaTone="up" hint="vs last month" />
        <KpiCard label="Orders" value="312" delta="3.1%" deltaTone="down" hint="vs last month" />
        <KpiCard label="Pending" value="18" />
        <KpiCard label="Delivered" value="274" delta="8%" deltaTone="up" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Sales trend" description={t("ui.sample")} />
          <div className="p-4"><LineChart ariaLabel="Sales trend" format={(n) => String(n / 1000) + "k"} data={[["Jun", 41], ["Jul", 52], ["Aug", 48], ["Sep", 63], ["Oct", 71], ["Nov", 66]].map(([label, v]) => ({ label: String(label), value: Number(v) * 1000 }))} /></div>
        </Card>
        <Card>
          <CardHeader title="Order status" />
          <div className="p-4"><DonutChart ariaLabel="Order status" centerLabel="orders" data={[{ label: t("status.completed"), value: 274 }, { label: t("status.pending"), value: 18 }, { label: t("status.cancelled"), value: 20 }]} /></div>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader title="Orders per week" />
          <div className="p-4"><BarChart ariaLabel="Orders per week" data={[["W1", 60], ["W2", 82], ["W3", 74], ["W4", 96]].map(([label, v]) => ({ label: String(label), value: Number(v) }))} /></div>
        </Card>
      </div>

      <Card className="mt-5">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchField value={q} onChange={setQ} className="w-full sm:w-72" />
          <Select defaultValue="" className="w-52"><option value="">All warehouses</option><option>Main</option></Select>
        </div>
        <Tabs label="Demo tabs" value={tab} onChange={setTab} items={[{ id: "a", label: "All", count: 3 }, { id: "b", label: "Low stock", count: 1 }]} />
        <DataTable caption="Sample stock" rows={shown} rowKey={(r) => r.id} sort={sort} onSort={setSort}
          empty={<EmptyState title={t("common.noResults")} description={t("ui.noDataHint")} />}
          columns={[
            { key: "sku", header: "SKU", cell: (r) => <span className="font-medium">{r.sku}</span>, sortable: true },
            { key: "name", header: "Product", cell: (r) => r.name, hideBelow: "md" },
            { key: "stock", header: "Available", numeric: true, cell: (r) => r.stock },
            { key: "price", header: "Price", numeric: true, cell: (r) => m(r.price), hideBelow: "sm" },
            { key: "status", header: "Status", cell: (r) => r.status === "ok" ? <StatusBadge tone="success">In stock</StatusBadge> : r.status === "low" ? <StatusBadge tone="warning">Low</StatusBadge> : <StatusBadge tone="danger">Out</StatusBadge> },
          ]}
          rowActions={(r, close) => <><MenuItem onClick={close}>View</MenuItem><MenuItem danger onClick={() => { close(); setConfirm(true); }}>{t("common.delete")}</MenuItem></>}
        />
        <Pagination page={page} pageSize={10} total={shown.length} onPage={setPage} onPageSize={() => {}} />
      </Card>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader title="Egyptian phone" />
          <div className="space-y-2 p-4">
            <Field label="Mobile" hint="Accepts 010…, +2010…, 002010…" error={phone && !normalizeEgyptMobile(phone) ? "Not a valid Egyptian mobile number" : undefined}>
              <Input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} invalid={!!phone && !normalizeEgyptMobile(phone)} />
            </Field>
            <p className="t-support t-number" dir="ltr">{normalizeEgyptMobile(phone) ?? "—"}</p>
          </div>
        </Card>
        <Card><ErrorState onRetry={() => toast("info", "Retry clicked")} /></Card>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={() => toast("success", "Saved successfully")}>Success toast</Button>
        <Button variant="secondary" onClick={() => toast("error", "Could not save. Try again.")}>Error toast</Button>
        <Button variant="danger" onClick={() => setConfirm(true)}>Confirm dialog</Button>
        <Button loading>Loading</Button>
      </div>

      <Dialog open={dlg} onClose={() => setDlg(false)} title="Quick action" description="Dialogs are for short tasks." footer={<><Button variant="secondary" onClick={() => setDlg(false)}>{t("common.cancel")}</Button><Button onClick={() => { setDlg(false); toast("success", "Done"); }}>{t("common.save")}</Button></>}>
        <Field label="Name" required><Input /></Field>
      </Dialog>
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Details drawer" description="Side drawer for context-rich quick edits."><p className="t-body">Content</p></Drawer>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={() => { setConfirm(false); toast("success", "Deleted"); }} title="Delete this item?" description="This cannot be undone." confirmLabel={t("common.delete")} />
    </AppShell>
  );
}
