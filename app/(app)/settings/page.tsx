import { Trash2 } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { Card, Field, Notice, PageHeader, btnPrimary, btnSecondary, inputCls, textareaCls } from "@/components/ui";
import { addBrand, addCategory, deleteBrand, deleteCategory, saveSettings } from "./actions";

type Item = { id: string; name: string };

function NameList({ title, items, add, remove }: { title: string; items: Item[]; add: (f: FormData) => Promise<void>; remove: (f: FormData) => Promise<void> }) {
  return (
    <Card title={title}>
      <form action={add} className="mb-4 flex gap-2">
        <input name="name" required placeholder={`New ${title.toLowerCase().slice(0, -1)}`} className={inputCls} aria-label={`New ${title}`} />
        <button className={btnSecondary}>Add</button>
      </form>
      {items.length === 0 ? (
        <p className="text-sm text-muted">None yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between py-2 text-sm">
              {i.name}
              <form action={remove}>
                <input type="hidden" name="id" value={i.id} />
                <button aria-label={`Delete ${i.name}`} className="rounded p-1.5 text-muted hover:bg-bad/5 hover:text-bad">
                  <Trash2 size={15} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams;
  const { supabase, profile } = await getProfile();
  const [{ data: s }, { data: cats }, { data: brands }] = await Promise.all([
    supabase.from("company_settings").select("*").eq("id", 1).single(),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);
  const isAdmin = profile?.role === "admin";

  return (
    <>
      <PageHeader title="Settings" subtitle="Company details used on invoices and receipts." />
      <Notice error={sp.error} ok={sp.ok} />
      {!isAdmin && <Notice error="Only an administrator can change settings." />}

      <form action={saveSettings} className="space-y-5">
        <Card title="Company">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Company name"><input name="company_name" required defaultValue={s?.company_name} className={inputCls} /></Field>
            <Field label="VAT or PAN number"><input name="vat_pan" defaultValue={s?.vat_pan ?? ""} className={inputCls} /></Field>
            <Field label="Phone"><input name="phone" defaultValue={s?.phone ?? ""} className={inputCls} /></Field>
            <Field label="Email"><input name="email" type="email" defaultValue={s?.email ?? ""} className={inputCls} /></Field>
            <Field label="Address" className="md:col-span-2"><input name="address" defaultValue={s?.address ?? ""} className={inputCls} /></Field>
            <Field label={s?.logo_url ? "Replace logo" : "Logo"} hint="Shown in the sidebar and on invoices.">
              <input name="logo" type="file" accept="image/*" className="block text-sm" />
            </Field>
            {s?.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.logo_url} alt="Current logo" className="h-14 max-w-48 object-contain" />
            )}
          </div>
        </Card>
        <Card title="Tax, currency and stock">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Currency"><input disabled value="NPR (Rs.)" className={inputCls} /></Field>
            <Field label="VAT percentage"><input name="vat_percent" type="number" min={0} max={100} step="0.01" defaultValue={s?.vat_percent ?? 13} className={inputCls} /></Field>
            <Field label="Default minimum stock" hint="Pre-filled on new products and spare parts."><input name="low_stock_threshold" type="number" min={0} step={1} defaultValue={s?.low_stock_threshold ?? 5} className={inputCls} /></Field>
          </div>
        </Card>
        <Card title="Printed documents">
          <div className="grid gap-4">
            <Field label="Invoice footer"><textarea name="invoice_footer" defaultValue={s?.invoice_footer ?? ""} className={textareaCls} /></Field>
            <Field label="Repair receipt terms"><textarea name="repair_terms" defaultValue={s?.repair_terms ?? ""} className={textareaCls} /></Field>
          </div>
        </Card>
        <button className={btnPrimary} disabled={!isAdmin}>Save settings</button>
      </form>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <NameList title="Categories" items={cats ?? []} add={addCategory} remove={deleteCategory} />
        <NameList title="Brands" items={brands ?? []} add={addBrand} remove={deleteBrand} />
      </div>
    </>
  );
}
