"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, Cpu, Wrench, Receipt, Users, ShoppingCart, Truck, Wallet,
  FileText, UserCog, Bell, Settings, LogOut, Menu, X,
} from "lucide-react";
import { signOut } from "@/app/login/actions";
import { cn } from "@/lib/utils";

const groups = [
  { label: "Overview", items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard, ready: true }] },
  {
    label: "Stock",
    items: [
      { href: "/inventory", label: "Inventory", icon: Package, ready: true },
      { href: "/spare-parts", label: "Spare parts", icon: Cpu, ready: true },
    ],
  },
  {
    label: "Customers and service",
    items: [
      { href: "/repairs", label: "Repairs", icon: Wrench, ready: false },
      { href: "/sales", label: "Sales", icon: Receipt, ready: false },
      { href: "/customers", label: "Customers", icon: Users, ready: false },
    ],
  },
  {
    label: "Buying",
    items: [
      { href: "/purchases", label: "Purchases", icon: ShoppingCart, ready: false },
      { href: "/suppliers", label: "Suppliers", icon: Truck, ready: false },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/expenses", label: "Expenses", icon: Wallet, ready: false },
      { href: "/reports", label: "Reports", icon: FileText, ready: false },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/users", label: "Users and employees", icon: UserCog, ready: false },
      { href: "/notifications", label: "Notifications", icon: Bell, ready: false },
      { href: "/settings", label: "Settings", icon: Settings, ready: true },
    ],
  },
];

export default function Sidebar({ company, logoUrl, userName, role, unread }: { company: string; logoUrl: string | null; userName: string; role: string; unread: number }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

  const brand = logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoUrl} alt={company} className="h-8 max-w-40 object-contain" />
  ) : (
    <span className="text-lg font-semibold tracking-tight text-white">{company}</span>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 md:hidden">
        {brand}
        <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded p-2 text-white">
          <Menu size={22} />
        </button>
      </header>
      {open && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-ink text-white/80 transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          {brand}
          <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-1 md:hidden">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {groups.map((g) => (
            <div key={g.label} className="mt-4">
              <p className="px-3 pb-1 text-xs text-white/40">{g.label}</p>
              {g.items.map(({ href, label, icon: Icon, ready }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm transition-colors",
                    active(href) ? "border-brand bg-white/10 text-white" : "border-transparent hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={17} />
                  <span className="flex-1">{label}</span>
                  {href === "/notifications" && unread > 0 && (
                    <span className="rounded-full bg-bad px-1.5 text-xs text-white">{unread > 99 ? "99+" : unread}</span>
                  )}
                  {!ready && <span className="text-xs text-white/30">Soon</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-medium text-white">{userName}</p>
          <p className="mb-3 text-xs capitalize text-white/50">{role === "admin" ? "Administrator" : role}</p>
          <form action={signOut}>
            <button className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
