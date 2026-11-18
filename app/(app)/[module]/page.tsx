import { notFound } from "next/navigation";
import { PageHeader, Card } from "@/components/ui";

const modules: Record<string, [string, string]> = {
  repairs: ["Repairs", "Receive devices, track every status, record parts and payments, and print receipts."],
  sales: ["Sales", "Create invoices, take payments, print or download PDFs and process returns."],
  customers: ["Customers", "Customer profiles with purchase, repair and payment history."],
  purchases: ["Purchases", "Record stock purchases and receive them into inventory."],
  suppliers: ["Suppliers", "Supplier profiles, purchase history and balances."],
  expenses: ["Expenses", "Record and report operating expenses with receipts."],
  reports: ["Reports", "Inventory, sales, repair and profit reports with PDF and Excel export."],
  users: ["Users and employees", "Manage staff accounts and roles."],
  notifications: ["Notifications", "Stock, repair and payment alerts."],
};

export default async function Placeholder({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const m = modules[module];
  if (!m) notFound();
  return (
    <>
      <PageHeader title={m[0]} />
      <Card>
        <p className="text-sm">{m[1]}</p>
        <p className="mt-2 text-sm text-muted">This module is built in a later phase. The database for it is already in place.</p>
      </Card>
    </>
  );
}
