import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { Badge, Card, Empty, Notice, Options, PageHeader, StockBadge, btnPrimary, btnSecondary, inputCls } from "@/components/ui";
import { int, npr, stockState } from "@/lib/utils";

type Row = {
  id: string; sku: string; name: string; model: string | null; quantity: number; min_stock: number;
  purchase_price: number; selling_price: number; profit_margin: number; active: boolean;
  categories: { name: string } | null; brands: { name: string } | null;
};

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; stock?: string; error?: string; ok?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await getProfile();
  const q = (sp.q ?? "").replace(/[,()%*]/g, " ").trim();

  const { data: cats } = await supabase.from("categories").select("id, name").order("name");

  let query = supabase.from("products").select("*, categories(name), brands(name)").order("created_at", { ascending: false }).limit(500);
  if (sp.category) query = query.eq("category_id", sp.category);
  if (q) {
    const [{ data: bs }, { data: cs }] = await Promise.all([
      supabase.from("brands").select("id").ilike("name", `%${q}%`),
      supabase.from("categories").select("id").ilike("name", `%${q}%`),
    ]);
    const parts = [`name.ilike.%${q}%`, `sku.ilike.%${q}%`, `model.ilike.%${q}%`, `barcode.ilike.%${q}%`];
    if (bs?.length) parts.push(`brand_id.in.(${bs.map((b) => b.id).join(",")})`);
    if (cs?.length) parts.push(`category_id.in.(${cs.map((c) => c.id).join(",")})`);
    query = query.or(parts.join(","));
  }
  const { data, error } = await query;
  let rows = (data ?? []) as unknown as Row[];
  if (sp.stock && sp.stock !== "all") rows = rows.filter((r) => stockState(r.quantity, r.min_stock) === sp.stock);

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle={`${rows.length} product${rows.length === 1 ? "" : "s"}`}
        actions={<Link href="/inventory/new" className={btnPrimary}><Plus size={16} /> Add product</Link>}
      />
      <Notice error={sp.error ?? error?.message} ok={sp.ok} />

      <form className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1">
          <Search size={16} className="absolute left-3 top-3 text-muted" />
          <input name="q" defaultValue={sp.q} placeholder="Search name, SKU, brand, model or category" className={`${inputCls} pl-9`} />
        </div>
        <select name="category" defaultValue={sp.category ?? ""} className={`${inputCls} w-auto`} aria-label="Category">
          <Options items={cats ?? []} empty="All categories" />
        </select>
        <select name="stock" defaultValue={sp.stock ?? "all"} className={`${inputCls} w-auto`} aria-label="Stock status">
          <option value="all">All stock levels</option>
          <option value="ok">In stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
        <button className={btnSecondary}>Apply</button>
      </form>

      <Card className="overflow-hidden !p-0">
        {rows.length === 0 ? (
          <Empty title="No products found" body="Add your first product, or clear the filters to see everything." action={<Link href="/inventory/new" className={btnPrimary}>Add product</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="border-b border-line bg-paper text-left text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Qty</th>
                  <th className="px-4 py-3 text-right font-medium">Cost</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                  <th className="px-4 py-3 text-right font-medium">Margin</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-paper/60">
                    <td className="px-4 py-3 font-mono text-xs">{r.sku}</td>
                    <td className="px-4 py-3">
                      <Link href={`/inventory/${r.id}`} className="font-medium text-brand hover:underline">{r.name}</Link>
                      <p className="text-xs text-muted">{[r.brands?.name, r.model].filter(Boolean).join(" ")}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{r.categories?.name ?? "–"}</td>
                    <td className="num px-4 py-3 text-right font-medium">{int(r.quantity)}</td>
                    <td className="num px-4 py-3 text-right">{npr(r.purchase_price)}</td>
                    <td className="num px-4 py-3 text-right">{npr(r.selling_price)}</td>
                    <td className="num px-4 py-3 text-right">{r.profit_margin}%</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <StockBadge state={stockState(r.quantity, r.min_stock)} />
                        {!r.active && <Badge>Inactive</Badge>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
