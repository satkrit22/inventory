"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { done, errText, fail, num, optStr, str } from "@/lib/form";

export async function saveSparePart(formData: FormData) {
  const id = str(formData, "id");
  const back = id ? `/spare-parts/${id}` : "/spare-parts/new";
  const supabase = await createClient();

  const name = str(formData, "name");
  const purchase = num(formData, "purchase_price");
  const selling = num(formData, "selling_price");
  const minStock = num(formData, "min_stock", 5);
  const opening = id ? 0 : num(formData, "quantity");

  if (!name) fail(back, "Enter a spare part name.");
  if ([purchase, selling, minStock, opening].some((n) => Number.isNaN(n) || n < 0)) fail(back, "Prices and quantities must be numbers, zero or more.");
  if (![minStock, opening].every(Number.isInteger)) fail(back, "Minimum stock and opening stock must be whole numbers.");

  const sku = str(formData, "sku");
  const row = {
    name,
    compatible_with: optStr(formData, "compatible_with"),
    description: optStr(formData, "description"),
    supplier_id: optStr(formData, "supplier_id"),
    purchase_price: purchase,
    selling_price: selling,
    min_stock: minStock,
    active: id ? formData.get("active") === "on" : true,
    ...(sku ? { sku } : {}),
  };

  if (id) {
    const { error } = await supabase.from("spare_parts").update(row).eq("id", id);
    if (error) fail(back, errText(error));
  } else {
    const { data, error } = await supabase.from("spare_parts").insert(row).select("id").single();
    if (error) fail(back, errText(error));
    if (opening > 0) {
      const adj = await supabase.rpc("manual_stock_adjustment", { p_type: "spare_part", p_id: data.id, p_delta: opening, p_note: "Opening stock" });
      if (adj.error) fail(`/spare-parts/${data.id}`, "Spare part saved, but opening stock failed: " + errText(adj.error));
    }
  }
  revalidatePath("/spare-parts");
  revalidatePath("/");
  done("/spare-parts", "Spare part saved.");
}

export async function deleteSparePart(formData: FormData) {
  const id = str(formData, "id");
  const back = `/spare-parts/${id}`;
  const supabase = await createClient();
  const { data, error } = await supabase.from("spare_parts").delete().eq("id", id).select("id");
  if (error) fail(back, errText(error));
  if (!data?.length) fail(back, "Only an administrator can delete spare parts.");
  revalidatePath("/spare-parts");
  done("/spare-parts", "Spare part deleted.");
}
