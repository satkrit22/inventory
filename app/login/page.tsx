import { signIn } from "./actions";
import { Notice, inputCls, btnPrimary, Field } from "@/components/ui";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="grid min-h-screen md:grid-cols-[1.1fr_1fr]">
      <section className="hidden flex-col justify-between bg-ink p-12 text-white md:flex">
        <div className="text-2xl font-semibold tracking-tight">Comtech</div>
        <div className="max-w-md">
          <h1 className="text-4xl font-semibold leading-tight">Every device, part and payment accounted for.</h1>
          <p className="mt-4 text-white/70">Stock, sales, customers and repairs for the Comtech team.</p>
        </div>
        <p className="text-sm text-white/50">Authorised staff only.</p>
      </section>
      <main className="flex items-center justify-center p-6">
        <form action={signIn} className="w-full max-w-sm space-y-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-muted">Use the account created for you by the administrator.</p>
          </div>
          <Notice error={error} />
          <Field label="Email">
            <input name="email" type="email" required autoComplete="username" className={inputCls} />
          </Field>
          <Field label="Password">
            <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
          </Field>
          <button className={`${btnPrimary} w-full`}>Sign in</button>
        </form>
      </main>
    </div>
  );
}
