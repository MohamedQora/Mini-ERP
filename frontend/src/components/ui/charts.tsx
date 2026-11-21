"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Restrained categorical palette built from the brand tokens plus the two muted semantic hues. */
export const CHART_COLORS = ["#1f7a63", "#092134", "#9aa3a8", "#1d5f8a", "#a8670c"];

type Pt = { label: string; value: number };

function scale(max: number) {
  if (max <= 0) return { top: 1, ticks: [0, 1] };
  const pow = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => max / s <= 5) ?? pow * 10;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);
  return { top, ticks };
}

const H = 240, PL = 44, PR = 12, PT = 12, PB = 28;

/** Measures the container so the SVG is drawn 1:1 (text stays 11px at every screen width). */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function Axes({ W, labels, ticks, top, fmt }: { W: number; labels: string[]; ticks: number[]; top: number; fmt: (n: number) => string }) {
  const y = (v: number) => PT + (H - PT - PB) * (1 - v / top);
  const x = (i: number) => PL + ((W - PL - PR) * (i + 0.5)) / labels.length;
  const every = Math.ceil(labels.length / Math.max(2, Math.floor((W - PL) / 56)));
  return (
    <g fontSize={11} fill="#5b676e">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PL} x2={W - PR} y1={y(t)} y2={y(t)} stroke="#e1e5e8" />
          <text x={PL - 6} y={y(t) + 3} textAnchor="end" className="t-number">{fmt(t)}</text>
        </g>
      ))}
      {labels.map((l, i) => i % every === 0 && <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle">{l}</text>)}
    </g>
  );
}

export function LineChart({ data, format = (n) => String(n), className, ariaLabel }: { data: Pt[]; format?: (n: number) => string; className?: string; ariaLabel: string }) {
  const [ref, W] = useWidth();
  const { top, ticks } = scale(Math.max(...data.map((d) => d.value), 0));
  const y = (v: number) => PT + (H - PT - PB) * (1 - v / top);
  const x = (i: number) => PL + ((W - PL - PR) * (i + 0.5)) / data.length;
  const path = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  return (
    <div ref={ref} className={cn("w-full min-w-0 overflow-hidden", className)}><svg className="block" role="img" aria-label={ariaLabel} width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Axes W={W} labels={data.map((d) => d.label)} ticks={ticks} top={top} fmt={format} />
      <path d={path} fill="none" stroke="#1f7a63" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d.value)} r={3} fill="#fff" stroke="#1f7a63" strokeWidth={2}><title>{`${d.label}: ${format(d.value)}`}</title></circle>)}
    </svg></div>
  );
}

export function BarChart({ data, format = (n) => String(n), className, ariaLabel }: { data: Pt[]; format?: (n: number) => string; className?: string; ariaLabel: string }) {
  const [ref, W] = useWidth();
  const { top, ticks } = scale(Math.max(...data.map((d) => d.value), 0));
  const y = (v: number) => PT + (H - PT - PB) * (1 - v / top);
  const slot = (W - PL - PR) / data.length;
  const bw = Math.min(36, slot * 0.6);
  return (
    <div ref={ref} className={cn("w-full min-w-0 overflow-hidden", className)}><svg className="block" role="img" aria-label={ariaLabel} width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Axes W={W} labels={data.map((d) => d.label)} ticks={ticks} top={top} fmt={format} />
      {data.map((d, i) => (
        <rect key={i} x={PL + slot * i + (slot - bw) / 2} y={y(d.value)} width={bw} height={Math.max(0, y(0) - y(d.value))} rx={2} fill="#1f7a63"><title>{`${d.label}: ${format(d.value)}`}</title></rect>
      ))}
    </svg></div>
  );
}

/** Donut with a text legend (labels + values), so meaning never relies on color alone. */
export function DonutChart({ data, format = (n) => String(n), ariaLabel, centerLabel }: { data: Pt[]; format?: (n: number) => string; ariaLabel: string; centerLabel?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 52, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg role="img" aria-label={ariaLabel} viewBox="0 0 140 140" className="size-36 shrink-0">
        <circle cx={70} cy={70} r={R} fill="none" stroke="#e1e5e8" strokeWidth={16} />
        {total > 0 && data.map((d, i) => {
          const len = (d.value / total) * C;
          const el = <circle key={i} cx={70} cy={70} r={R} fill="none" stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={16} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)"><title>{`${d.label}: ${format(d.value)}`}</title></circle>;
          acc += len;
          return el;
        })}
        <text x={70} y={68} textAnchor="middle" className="t-number" fontSize={18} fontWeight={600} fill="#092134">{format(total)}</text>
        {centerLabel && <text x={70} y={84} textAnchor="middle" fontSize={9} fill="#5b676e">{centerLabel}</text>}
      </svg>
      <ul className="min-w-40 flex-1 space-y-1.5">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} aria-hidden />{d.label}</span>
            <span className="t-number font-medium">{format(d.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
