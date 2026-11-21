"use client";
import { ArrowDown, ArrowUp, ChevronsUpDown, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";
import { IconButton } from "./button";
import { Popover } from "./menu";
import { ErrorState, TableSkeleton } from "./states";
import { Select } from "./form";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "start" | "end";
  /** Hide this column below the given breakpoint to keep tables readable on small screens. */
  hideBelow?: "sm" | "md" | "lg";
  numeric?: boolean;
};
export type Sort = { key: string; dir: "asc" | "desc" };

const hide = { sm: "hidden sm:table-cell", md: "hidden md:table-cell", lg: "hidden lg:table-cell" };

/**
 * Presentational table. Sorting/pagination/filtering state is owned by the caller (so it can be server-side).
 * Handles loading, error and empty states. `rowActions` renders the row's action menu (children get close()).
 */
export function DataTable<T>({ columns, rows, rowKey, loading, error, onRetry, empty, sort, onSort, rowActions, onRowClick, caption }: {
  columns: Column<T>[]; rows: T[]; rowKey: (r: T) => string; loading?: boolean; error?: boolean; onRetry?: () => void; empty: React.ReactNode;
  sort?: Sort | null; onSort?: (s: Sort) => void; rowActions?: (r: T, close: () => void) => React.ReactNode; onRowClick?: (r: T) => void; caption?: string;
}) {
  const { t } = useI18n();
  if (loading) return <TableSkeleton cols={Math.min(columns.length, 5)} />;
  if (error) return <ErrorState onRetry={onRetry} />;
  if (rows.length === 0) return <>{empty}</>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-line bg-canvas/60">
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <th key={c.key} scope="col" aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}
                  className={cn("t-th px-4 py-2.5", c.align === "end" || c.numeric ? "text-end" : "text-start", c.hideBelow && hide[c.hideBelow])}>
                  {c.sortable && onSort ? (
                    <button type="button" onClick={() => onSort({ key: c.key, dir: active && sort!.dir === "asc" ? "desc" : "asc" })} className="inline-flex items-center gap-1 uppercase hover:text-navy">
                      {c.header}
                      {active ? (sort!.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ChevronsUpDown className="size-3 opacity-50" />}
                    </button>
                  ) : c.header}
                </th>
              );
            })}
            {rowActions && <th scope="col" className="w-12"><span className="sr-only">{t("common.actions")}</span></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined} className={cn("hover:bg-canvas/60", onRowClick && "cursor-pointer")}>
              {columns.map((c) => (
                <td key={c.key} className={cn("t-table px-4 py-3", c.numeric && "t-number text-end", c.align === "end" && "text-end", c.hideBelow && hide[c.hideBelow])}>{c.cell(r)}</td>
              ))}
              {rowActions && (
                <td className="px-2 text-end" onClick={(e) => e.stopPropagation()}>
                  <Popover label={t("common.actions")} trigger={({ toggle }) => <IconButton label={t("common.actions")} onClick={toggle} className="size-8"><MoreHorizontal className="size-4" /></IconButton>}>
                    {({ close }) => <div className="py-1">{rowActions(r, close)}</div>}
                  </Popover>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, pageSize, total, onPage, onPageSize, sizes = [10, 25, 50] }: { page: number; pageSize: number; total: number; onPage: (p: number) => void; onPageSize?: (n: number) => void; sizes?: number[] }) {
  const { t } = useI18n();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5">
      <p className="t-support t-number">{t("common.showing", { from, to, total })}</p>
      <div className="flex items-center gap-3">
        {onPageSize && (
          <label className="flex items-center gap-2 whitespace-nowrap t-support">
            {t("common.rowsPerPage")}
            <Select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} className="h-8 w-24">{sizes.map((s) => <option key={s} value={s}>{s}</option>)}</Select>
          </label>
        )}
        <div className="flex items-center gap-1">
          <IconButton label={t("common.previous")} disabled={page <= 1} onClick={() => onPage(page - 1)} className="size-8"><ChevronLeft className="size-4 rtl:-scale-x-100" /></IconButton>
          <span className="t-support t-number px-1">{t("common.pageOf", { page, total: pages })}</span>
          <IconButton label={t("common.next")} disabled={page >= pages} onClick={() => onPage(page + 1)} className="size-8"><ChevronRight className="size-4 rtl:-scale-x-100" /></IconButton>
        </div>
      </div>
    </div>
  );
}
