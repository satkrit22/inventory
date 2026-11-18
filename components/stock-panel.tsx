import { adjustStock } from "@/app/(app)/stock-actions";
import { Card, Field, StockBadge, btnSecondary, inputCls } from "@/components/ui";
import { fmtDateTime, int, stockState } from "@/lib/utils";

const reasons: Record<string, string> = {
  purchase: "Purchase received", sale: "Sale", sale_return: "Sale return", repair_use: "Used in repair",
  repair_return: "Returned from repair", adjustment: "Adjustment", opening: "Opening stock",
};

type Move = { id: string; change: number; balance_after: number; reason: string; note: string | null; created_at: string };

export default function StockPanel({ type, id, back, quantity, min, moves }: { type: "product" | "spare_part"; id: string; back: string; quantity: number; min: number; moves: Move[] }) {
  return (
    <div className="space-y-5">
      <Card title="Stock">
        <div className="flex items-baseline justify-between">
          <p className="num text-3xl font-semibold">{int(quantity)}</p>
          <StockBadge state={stockState(quantity, min)} />
        </div>
        <p className="mt-1 text-sm text-muted">Minimum level {int(min)}</p>
        <form action={adjustStock} className="mt-5 space-y-3 border-t border-line pt-5">
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="back" value={back} />
          <p className="text-sm font-medium">Adjust stock</p>
          <div className="grid grid-cols-2 gap-3">
            <select name="direction" className={inputCls} aria-label="Direction">
              <option value="in">Add</option>
              <option value="out">Remove</option>
            </select>
            <input name="quantity" type="number" min={1} step={1} required placeholder="Quantity" className={inputCls} aria-label="Quantity" />
          </div>
          <Field label="Reason" hint="For example: stocktake correction, damaged, found.">
            <input name="note" required className={inputCls} />
          </Field>
          <button className={`${btnSecondary} w-full`}>Update stock</button>
        </form>
      </Card>
      <Card title="Stock history">
        {moves.length === 0 ? (
          <p className="text-sm text-muted">No stock movements yet.</p>
        ) : (
          <ul className="-my-2 divide-y divide-line">
            {moves.map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                <div>
                  <p>{reasons[m.reason] ?? m.reason}</p>
                  <p className="text-xs text-muted">
                    {fmtDateTime(m.created_at)}
                    {m.note ? `: ${m.note}` : ""}
                  </p>
                </div>
                <div className="num text-right">
                  <p className={m.change > 0 ? "font-semibold text-ok" : "font-semibold text-bad"}>{m.change > 0 ? `+${m.change}` : m.change}</p>
                  <p className="text-xs text-muted">Balance {m.balance_after}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
