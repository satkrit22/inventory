import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { int, npr } from "@/lib/utils";

type Stats = Record<string, number>;
type Row = [label: string, key: string, kind?: "money"];

const sections: { title: string; rows: Row[] }[] = [
  {
    title: "Stock",
    rows: [
      ["Products", "total_products"],
      ["Units in stock", "available_stock"],
      ["Inventory value (at cost)", "inventory_value", "money"],
      ["Spare parts value (at cost)", "spare_parts_value", "money"],
      ["Low stock products", "low_stock"],
      ["Out of stock products", "out_of_stock"],
      ["Low stock spare parts", "low_stock_spare_parts"],
    ],
  },
  {
    title: "Sales and customers",
    rows: [
      ["Products sold", "products_sold"],
      ["Sales revenue", "sales_revenue", "money"],
      ["Customers", "total_customers"],
    ],
  },
  {
    title: "Repairs",
    rows: [
      ["Devices received", "devices_received"],
      ["Pending repairs", "pending_repairs"],
      ["Completed repairs", "completed_repairs"],
      ["Returned to customers", "devices_returned"],
      ["Repair revenue", "repair_revenue", "money"],
    ],
  },
];

export default async function Dashboard() {
  const { supabase } = await getProfile();
  const { data, error } = await supabase.rpc("dashboard_stats");
  const s = (data ?? {}) as Stats;
  const attention = (s.out_of_stock ?? 0) + (s.low_stock ?? 0);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live figures from your stock, sales and repairs." />
      {error && (
        <div role="alert" className="mb-5 rounded-md border border-bad/30 bg-bad/5 px-4 py-3 text-sm text-bad">
          Couldn&apos;t load the figures: {error.message}. Check that comtech_schema.sql ran without errors.
        </div>
      )}
      {attention > 0 && (
        <Link href="/inventory?stock=low" className="mb-5 block rounded-md border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn hover:bg-warn/10">
          {s.out_of_stock ?? 0} out of stock and {s.low_stock ?? 0} running low. Review inventory.
        </Link>
      )}
      <div className="grid gap-5 lg:grid-cols-3">
        {sections.map((sec) => (
          <Card key={sec.title} title={sec.title}>
            <dl className="-my-2 divide-y divide-line">
              {sec.rows.map(([label, key, kind]) => (
                <div key={key} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="num text-sm font-semibold">{kind === "money" ? npr(s[key]) : int(s[key])}</dd>
                </div>
              ))}
            </dl>
          </Card>
        ))}
      </div>
    </>
  );
}
