import { getProfile } from "@/lib/auth";
import Sidebar from "@/components/sidebar";
import { signOut } from "@/app/login/actions";
import { btnSecondary } from "@/components/ui";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await getProfile();

  if (!profile?.active) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <form action={signOut} className="max-w-sm text-center">
          <h1 className="text-xl font-semibold">Account not active</h1>
          <p className="mt-2 text-sm text-muted">This account has no access. Ask the administrator to activate it.</p>
          <button className={`${btnSecondary} mt-4`}>Sign out</button>
        </form>
      </div>
    );
  }

  const [{ data: settings }, { count }] = await Promise.all([
    supabase.from("company_settings").select("company_name, logo_url").eq("id", 1).single(),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false),
  ]);

  return (
    <div className="min-h-screen">
      <Sidebar
        company={settings?.company_name ?? "Comtech"}
        logoUrl={settings?.logo_url ?? null}
        userName={profile.full_name}
        role={profile.role}
        unread={count ?? 0}
      />
      <main className="px-4 pb-14 pt-20 md:ml-64 md:px-8 md:pt-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
