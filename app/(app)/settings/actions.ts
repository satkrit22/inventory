"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { done, errText, fail, num, optStr, str, uploadImage } from "@/lib/form";

const back = "/settings";

export async function saveSettings(formData: FormData) {
  const supabase = await createClient();
  const company = str(formData, "company_name");
  const vat = num(formData, "vat_percent", 13);
  const low = num(formData, "low_stock_threshold", 5);
  if (!company) fail(back, "Enter the company name.");
  if (Number.isNaN(vat) || vat < 0 || vat > 100) fail(back, "VAT must be between 0 and 100.");
  if (!Number.isInteger(low) || low < 0) fail(back, "Low stock threshold must be a whole number, zero or more.");

  const logo = await uploadImage(supabase, "company", formData.get("logo"));
  if (logo.error) fail(back, logo.error);

  const row = {
    company_name: company,
    address: optStr(formData, "address"),
    phone: optStr(formData, "phone"),
    email: optStr(formData, "email"),
    vat_pan: optStr(formData, "vat_pan"),
    vat_percent: vat,
    low_stock_threshold: low,
    invoice_footer: optStr(formData, "invoice_footer"),
    repair_terms: optStr(formData, "repair_terms"),
    ...(logo.path ? { logo_url: supabase.storage.from("company").getPublicUrl(logo.path).data.publicUrl } : {}),
  };
  const { data, error } = await supabase.from("company_settings").update(row).eq("id", 1).select("id");
  if (error) fail(back, errText(error));
  if (!data?.length) fail(back, "Only an administrator can change settings.");
  revalidatePath("/", "layout");
  done(back, "Settings saved.");
}

async function addName(table: "categories" | "brands", formData: FormData) {
  const name = str(formData, "name");
  if (!name) fail(back, "Enter a name.");
  const supabase = await createClient();
  const { error } = await supabase.from(table).insert({ name });
  if (error) fail(back, error.code === "23505" ? `"${name}" already exists.` : errText(error));
  revalidatePath(back);
  done(back, "Added.");
}

async function removeName(table: "categories" | "brands", formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.from(table).delete().eq("id", str(formData, "id")).select("id");
  if (error) fail(back, error.code === "23503" ? "Products still use this. Change them first, then delete." : errText(error));
  if (!data?.length) fail(back, "Only an administrator can delete this.");
  revalidatePath(back);
  done(back, "Deleted.");
}

export async function addCategory(f: FormData) { return addName("categories", f); }
export async function deleteCategory(f: FormData) { return removeName("categories", f); }
export async function addBrand(f: FormData) { return addName("brands", f); }
export async function deleteBrand(f: FormData) { return removeName("brands", f); }
