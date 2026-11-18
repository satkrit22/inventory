import Link from "next/link";
import { saveSparePart } from "@/app/(app)/spare-parts/actions";
import { Card, Field, Options, btnPrimary, btnSecondary, inputCls, textareaCls } from "@/components/ui";

type Part = Record<string, any>;

export default function SparePartForm({ part, suppliers, defaultMin }: { part?: Part; suppliers: { id: string; name: string }[]; defaultMin: number }) {
  const p = part ?? {};
  return (
    <form action={saveSparePart} className="space-y-5">
      {p.id && <input type="hidden" name="id" value={p.id} />}
      <Card title="Spare part details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" className="md:col-span-2">
            <input name="name" required defaultValue={p.name} className={inputCls} />
          </Field>
          <Field label="SKU" hint={p.id ? undefined : "Leave blank to generate one automatically."}>
            <input name="sku" defaultValue={p.sku ?? ""} className={`${inputCls} font-mono`} />
          </Field>
          <Field label="Compatible with" hint="Device models this part fits.">
            <input name="compatible_with" defaultValue={p.compatible_with ?? ""} className={inputCls} />
          </Field>
          <Field label="Supplier">
            <select name="supplier_id" defaultValue={p.supplier_id ?? ""} className={inputCls}>
              <Options items={suppliers} empty="No supplier" />
            </select>
          </Field>
          <Field label="Description" className="md:col-span-2">
            <textarea name="description" defaultValue={p.description ?? ""} className={textareaCls} />
          </Field>
        </div>
      </Card>
      <Card title="Pricing and stock">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Purchase price (Rs.)">
            <input name="purchase_price" type="number" min={0} step="0.01" defaultValue={p.purchase_price ?? 0} className={inputCls} />
          </Field>
          <Field label="Selling price (Rs.)" hint="Charged to the customer when used in a repair.">
            <input name="selling_price" type="number" min={0} step="0.01" defaultValue={p.selling_price ?? 0} className={inputCls} />
          </Field>
          {!p.id && (
            <Field label="Opening stock">
              <input name="quantity" type="number" min={0} step={1} defaultValue={0} className={inputCls} />
            </Field>
          )}
          <Field label="Minimum stock level">
            <input name="min_stock" type="number" min={0} step={1} defaultValue={p.min_stock ?? defaultMin} className={inputCls} />
          </Field>
          {p.id && (
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={p.active} className="h-4 w-4 accent-[#0e7c86]" />
              Active
            </label>
          )}
        </div>
      </Card>
      <div className="flex gap-3">
        <button className={btnPrimary}>Save spare part</button>
        <Link href="/spare-parts" className={btnSecondary}>Cancel</Link>
      </div>
    </form>
  );
}
