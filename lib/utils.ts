export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const money = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const whole = new Intl.NumberFormat("en-IN");

export const npr = (n: number | string | null | undefined) => "Rs. " + money.format(Number(n ?? 0));
export const int = (n: number | string | null | undefined) => whole.format(Number(n ?? 0));

export const fmtDate = (d: string | Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d)) : "–";

export const fmtDateTime = (d: string | Date | null | undefined) =>
  d
    ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d))
    : "–";

export type StockState = "out" | "low" | "ok";
export const stockState = (qty: number, min: number): StockState => (qty <= 0 ? "out" : qty <= min ? "low" : "ok");
