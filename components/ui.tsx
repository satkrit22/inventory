import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputCls =
  "h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-[#17212c] placeholder:text-[#98a2b0] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:bg-paper";
export const textareaCls =
  "min-h-24 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-[#17212c] placeholder:text-[#98a2b0] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
const btn = "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors";
export const btnPrimary = `${btn} bg-brand text-white hover:bg-brand-dark`;
export const btnSecondary = `${btn} border border-line bg-white text-[#17212c] hover:bg-paper`;
export const btnDanger = `${btn} border border-bad/30 bg-white text-bad hover:bg-bad/5`;

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, children, className, action }: { title?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cn("rounded-lg border border-line bg-white", className)}>
      {title && (
        <header className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Notice({ error, ok }: { error?: string; ok?: string }) {
  if (!error && !ok) return null;
  return (
    <div
      role={error ? "alert" : "status"}
      className={cn("mb-5 rounded-md border px-4 py-3 text-sm", error ? "border-bad/30 bg-bad/5 text-bad" : "border-ok/30 bg-ok/5 text-ok")}
    >
      {error ?? ok}
    </div>
  );
}

const tones = {
  ok: "bg-ok/10 text-ok",
  warn: "bg-warn/10 text-warn",
  bad: "bg-bad/10 text-bad",
  muted: "bg-[#e7ebf0] text-muted",
};
export function Badge({ tone = "muted", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-medium", tones[tone])}>{children}</span>;
}

export function StockBadge({ state }: { state: "out" | "low" | "ok" }) {
  return state === "out" ? <Badge tone="bad">Out of stock</Badge> : state === "low" ? <Badge tone="warn">Low stock</Badge> : <Badge tone="ok">In stock</Badge>;
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export const Options = ({ items, empty }: { items: { id: string; name: string }[]; empty: string }) => (
  <>
    <option value="">{empty}</option>
    {items.map((i) => (
      <option key={i.id} value={i.id}>
        {i.name}
      </option>
    ))}
  </>
);
