import { notFound } from "next/navigation";
import { getProfile } from "@/lib/auth";
import ProductForm from "@/components/product-form";
import StockPanel from "@/components/stock-panel";
import { Notice, PageHeader, btnDanger } from "@/components/ui";
import { deleteProduct } from "../actions";

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, profile } = await getProfile();

  const { data: product } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!product) notFound();

  const [c, b, s, m] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
    supabase.from("suppliers").select("id, name").order("name"),
    supabase.from("stock_movements").select("id, change, balance_after, reason, note, created_at").eq("product_id", id).order("created_at", { ascending: false }).limit(25),
  ]);
  const imageUrl = product.image_url ? (await supabase.storage.from("product-images").createSignedUrl(product.image_url, 3600)).data?.signedUrl : null;

  return (
    <>
      <PageHeader title={product.name} subtitle={`SKU ${product.sku}`} />
      <Notice error={sp.error} ok={sp.ok} />
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div>
          <ProductForm product={product} categories={c.data ?? []} brands={b.data ?? []} suppliers={s.data ?? []} defaultMin={5} imageUrl={imageUrl} />
          {profile?.role === "admin" && (
            <form action={deleteProduct} className="mt-8 border-t border-line pt-5">
              <input type="hidden" name="id" value={id} />
              <p className="mb-2 text-sm text-muted">Products with sales, purchases or stock history can&apos;t be deleted. Mark them inactive instead.</p>
              <button className={btnDanger}>Delete product</button>
            </form>
          )}
        </div>
        <StockPanel type="product" id={id} back={`/inventory/${id}`} quantity={product.quantity} min={product.min_stock} moves={m.data ?? []} />
      </div>
    </>
  );
}
