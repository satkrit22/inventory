import { getProfile } from "@/lib/auth";
import ProductForm from "@/components/product-form";
import { Notice, PageHeader } from "@/components/ui";

export default async function NewProduct({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase } = await getProfile();
  const [c, b, s, st] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
    supabase.from("suppliers").select("id, name").order("name"),
    supabase.from("company_settings").select("low_stock_threshold").eq("id", 1).single(),
  ]);
  return (
    <>
      <PageHeader title="Add product" />
      <Notice error={error} />
      <ProductForm categories={c.data ?? []} brands={b.data ?? []} suppliers={s.data ?? []} defaultMin={st.data?.low_stock_threshold ?? 5} />
    </>
  );
}
