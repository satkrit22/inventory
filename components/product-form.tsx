import Link from "next/link";
import { saveProduct } from "@/app/(app)/inventory/actions";
import { Card, Field, Options, btnPrimary, btnSecondary, inputCls, textareaCls } from "@/components/ui";

type Opt = { id: string; name: string };
type Product = Record<string, any>;

export default function ProductForm({ product, categories, brands, suppliers, defaultMin, imageUrl }: {
  product?: Product; categories: Opt[]; brands: Opt[]; suppliers: Opt[]; defaultMin: number; imageUrl?: string | null;
}) {
  const p = product ?? {};
  return (
    <form action={saveProduct} className="space-y-5">
      {p.id && <input type="hidden" name="id" value={p.id} />}
      <Card title="Product details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Product name" className="md:col-span-2">
            <input name="name" required defaultValue={p.name} className={inputCls} />
          </Field>
          <Field label="Category">
            <select name="category_id" defaultValue={p.category_id ?? ""} className={inputCls}>
              <Options items={categories} empty="No category" />
            </select>
          </Field>
          <Field label="Brand">
            <select name="brand_id" defaultValue={p.brand_id ?? ""} className={inputCls}>
              <Options items={brands} empty="No brand" />
            </select>
          </Field>
          <Field label="Model">
            <input name="model" defaultValue={p.model ?? ""} className={inputCls} />
          </Field>
          <Field label="SKU" hint={p.id ? undefined : "Leave blank to generate one automatically."}>
            <input name="sku" defaultValue={p.sku ?? ""} className={`${inputCls} font-mono`} />
          </Field>
          <Field label="Barcode" hint="Scan with a USB scanner while this field is selected.">
            <input name="barcode" defaultValue={p.barcode ?? ""} className={`${inputCls} font-mono`} />
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
          <Field label="Selling price (Rs.)">
            <input name="selling_price" type="number" min={0} step="0.01" defaultValue={p.selling_price ?? 0} className={inputCls} />
          </Field>
          {p.id ? (
            <Field label="Profit margin">
              <input disabled value={`${p.profit_margin ?? 0}%`} className={inputCls} />
            </Field>
          ) : (
            <Field label="Opening stock" hint="Units on hand now.">
              <input name="quantity" type="number" min={0} step={1} defaultValue={0} className={inputCls} />
            </Field>
          )}
          <Field label="Minimum stock level" hint="Alerts start at or below this.">
            <input name="min_stock" type="number" min={0} step={1} defaultValue={p.min_stock ?? defaultMin} className={inputCls} />
          </Field>
          <Field label="Warranty (months)">
            <input name="warranty_months" type="number" min={0} step={1} defaultValue={p.warranty_months ?? 0} className={inputCls} />
          </Field>
          <Field label="Purchase date">
            <input name="purchase_date" type="date" defaultValue={p.purchase_date ?? ""} className={inputCls} />
          </Field>
        </div>
      </Card>

      <Card title="Image and status">
        <div className="flex flex-wrap items-center gap-5">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={p.name} className="h-24 w-24 rounded-md border border-line object-cover" />
          )}
          <Field label={imageUrl ? "Replace image" : "Product image"} hint="JPG, PNG or WebP, up to 4 MB.">
            <input name="image" type="file" accept="image/*" className="block text-sm" />
          </Field>
          {p.id && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={p.active} className="h-4 w-4 accent-[#0e7c86]" />
              Active (inactive products are hidden from new sales)
            </label>
          )}
        </div>
      </Card>

      <div className="flex gap-3">
        <button className={btnPrimary}>Save product</button>
        <Link href="/inventory" className={btnSecondary}>Cancel</Link>
      </div>
    </form>
  );
}
