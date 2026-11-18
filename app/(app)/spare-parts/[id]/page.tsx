import { notFound } from "next/navigation";
import { getProfile } from "@/lib/auth";
import SparePartForm from "@/components/spare-part-form";
import StockPanel from "@/components/stock-panel";
import { Notice, PageHeader, btnDanger } from "@/components/ui";
import { deleteSparePart } from "../actions";

export default async function EditSparePart({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, profile } = await getProfile();
  const { data: part } = await supabase.from("spare_parts").select("*").eq("id", id).maybeSingle();
  if (!part) notFound();

  const [s, m] = await Promise.all([
    supabase.from("suppliers").select("id, name").order("name"),
    supabase.from("stock_movements").select("id, change, balance_after, reason, note, created_at").eq("spare_part_id", id).order("created_at", { ascending: false }).limit(25),
  ]);

  return (
    <>
      <PageHeader title={part.name} subtitle={`SKU ${part.sku}`} />
      <Notice error={sp.error} ok={sp.ok} />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div>
          <SparePartForm part={part} suppliers={s.data ?? []} defaultMin={5} />
          {profile?.role === "admin" && (
            <form action={deleteSparePart} className="mt-8 border-t border-line pt-5">
              <input type="hidden" name="id" value={id} />
              <p className="mb-2 text-sm text-muted">Parts with stock history or repair usage can&apos;t be deleted. Mark them inactive instead.</p>
              <button className={btnDanger}>Delete spare part</button>
            </form>
          )}
        </div>
        <StockPanel type="spare_part" id={id} back={`/spare-parts/${id}`} quantity={part.quantity} min={part.min_stock} moves={m.data ?? []} />
      </div>
    </>
  );
}
