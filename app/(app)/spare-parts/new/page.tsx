import { getProfile } from "@/lib/auth";
import SparePartForm from "@/components/spare-part-form";
import { Notice, PageHeader } from "@/components/ui";

export default async function NewSparePart({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase } = await getProfile();
  const [s, st] = await Promise.all([
    supabase.from("suppliers").select("id, name").order("name"),
    supabase.from("company_settings").select("low_stock_threshold").eq("id", 1).single(),
  ]);
  return (
    <>
      <PageHeader title="Add spare part" />
      <Notice error={error} />
      <SparePartForm suppliers={s.data ?? []} defaultMin={st.data?.low_stock_threshold ?? 5} />
    </>
  );
}
