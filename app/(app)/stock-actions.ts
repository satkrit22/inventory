"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { done, errText, fail, num, str } from "@/lib/form";

// Shared by inventory and spare parts: adds or removes stock with a required reason, logged in stock history.
export async function adjustStock(formData: FormData) {
  const type = str(formData, "type") === "spare_part" ? "spare_part" : "product";
  const id = str(formData, "id");
  const back = str(formData, "back");
  if (!/^\/(inventory|spare-parts)\/[0-9a-f-]{36}$/.test(back)) throw new Error("Invalid return path");

  const qty = num(formData, "quantity");
  const note = str(formData, "note");
  if (!Number.isInteger(qty) || qty <= 0) fail(back, "Enter a whole number greater than zero.");
  if (!note) fail(back, "Add a reason so the change is traceable in stock history.");
  const delta = str(formData, "direction") === "out" ? -qty : qty;

  const supabase = await createClient();
  const { error } = await supabase.rpc("manual_stock_adjustment", { p_type: type, p_id: id, p_delta: delta, p_note: note });
  if (error) fail(back, errText(error));
  revalidatePath("/inventory");
  revalidatePath("/spare-parts");
  revalidatePath("/");
  done(back, "Stock updated.");
}
