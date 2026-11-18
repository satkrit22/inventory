import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { Badge, Card, Empty, Notice, PageHeader, StockBadge, btnPrimary, btnSecondary, inputCls } from "@/components/ui";
import { int, npr, stockState } from "@/lib/utils";

type Row = { id: string; sku: string; name: string; compatible_with: string | null; quantity: number; min_stock: number; purchase_price: number; selling_price: number; active: boolean };

export default async function SparePartsPage({ searchParams }: { searchParams: Promise<{ q?: string; stock?: string; error?: string; ok?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await getProfile();
  const q = (sp.q ?? "").replace(/[,()%*]/g, " ").trim();

  let query = supabase.from("spare_parts").select("*").order("created_at", { ascending: false }).limit(500);
  if (q) query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%,compatible_with.ilike.%${q}%`);
  const { data, error } = await query;
  let rows = (data ?? []) as Row[];
  if (sp.stock && sp.stock !== "all") rows = rows.filter((r) => stockState(r.quantity, r.min_stock) === sp.stock);

  return (
    <>
      <PageHeader
        title="Spare parts"
        subtitle="Kept separate from sale products. Parts used in repairs are deducted automatically."
        actions={<Link href="/spare-parts/new" className={btnPrimary}><Plus size={16} /> Add spare part</Link>}
      />
      <Notice error={sp.error ?? error?.message} ok={sp.ok} />
      <form className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1">
          <Search size={16} className="absolute left-3 top-3 text-muted" />
          <input name="q" defaultValue={sp.q} placeholder="Search name, SKU or compatible device" className={`${inputCls} pl-9`} />
        </div>
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
          <Empty title="No spare parts found" body="Add the parts you keep for repairs, or clear the filters." action={<Link href="/spare-parts/new" className={btnPrimary}>Add spare part</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-line bg-paper text-left text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Part</th>
                  <th className="px-4 py-3 text-right font-medium">Qty</th>
                  <th className="px-4 py-3 text-right font-medium">Cost</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-paper/60">
                    <td className="px-4 py-3 font-mono text-xs">{r.sku}</td>
                    <td className="px-4 py-3">
                      <Link href={`/spare-parts/${r.id}`} className="font-medium text-brand hover:underline">{r.name}</Link>
                      {r.compatible_with && <p className="text-xs text-muted">{r.compatible_with}</p>}
                    </td>
                    <td className="num px-4 py-3 text-right font-medium">{int(r.quantity)}</td>
                    <td className="num px-4 py-3 text-right">{npr(r.purchase_price)}</td>
                    <td className="num px-4 py-3 text-right">{npr(r.selling_price)}</td>
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
