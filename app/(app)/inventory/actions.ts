"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { done, errText, fail, num, optStr, str, uploadImage } from "@/lib/form";

export async function saveProduct(formData: FormData) {
  const id = str(formData, "id");
  const back = id ? `/inventory/${id}` : "/inventory/new";
  const supabase = await createClient();

  const name = str(formData, "name");
  const purchase = num(formData, "purchase_price");
  const selling = num(formData, "selling_price");
  const minStock = num(formData, "min_stock", 5);
  const warranty = num(formData, "warranty_months");
  const opening = id ? 0 : num(formData, "quantity");

  if (!name) fail(back, "Enter a product name.");
  if ([purchase, selling, minStock, warranty, opening].some((n) => Number.isNaN(n) || n < 0)) fail(back, "Prices and quantities must be numbers, zero or more.");
  if (![minStock, warranty, opening].every(Number.isInteger)) fail(back, "Minimum stock, warranty and opening stock must be whole numbers.");

  const img = await uploadImage(supabase, "product-images", formData.get("image"));
  if (img.error) fail(back, img.error);

  const sku = str(formData, "sku");
  const row = {
    name,
    category_id: optStr(formData, "category_id"),
    brand_id: optStr(formData, "brand_id"),
    supplier_id: optStr(formData, "supplier_id"),
    model: optStr(formData, "model"),
    description: optStr(formData, "description"),
    barcode: optStr(formData, "barcode"),
    purchase_date: optStr(formData, "purchase_date"),
    purchase_price: purchase,
    selling_price: selling,
    min_stock: minStock,
    warranty_months: warranty,
    active: id ? formData.get("active") === "on" : true,
    ...(sku ? { sku } : {}),
    ...(img.path ? { image_url: img.path } : {}),
  };

  if (id) {
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) fail(back, errText(error));
  } else {
    const { data, error } = await supabase.from("products").insert(row).select("id").single();
    if (error) fail(back, errText(error));
    if (opening > 0) {
      const adj = await supabase.rpc("manual_stock_adjustment", { p_type: "product", p_id: data.id, p_delta: opening, p_note: "Opening stock" });
      if (adj.error) fail(`/inventory/${data.id}`, "Product saved, but opening stock failed: " + errText(adj.error));
    }
  }
  revalidatePath("/inventory");
  revalidatePath("/");
  done("/inventory", "Product saved.");
}

export async function deleteProduct(formData: FormData) {
  const id = str(formData, "id");
  const back = `/inventory/${id}`;
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").delete().eq("id", id).select("id");
  if (error) fail(back, errText(error));
  if (!data?.length) fail(back, "Only an administrator can delete products.");
  revalidatePath("/inventory");
  done("/inventory", "Product deleted.");
}
