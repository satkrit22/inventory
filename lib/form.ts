import { redirect } from "next/navigation";

export const str = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" ? v.trim() : "";
};
export const optStr = (f: FormData, k: string) => str(f, k) || null;
export const num = (f: FormData, k: string, fallback = 0) => {
  const v = str(f, k);
  if (v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

export function fail(path: string, message: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);
}
export function done(path: string, message: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}ok=${encodeURIComponent(message)}`);
}

export function errText(e: { message?: string; code?: string }) {
  if (e.code === "23505") return "That SKU, barcode or name is already used by another record.";
  if (e.code === "23503") return "This record is used elsewhere (sales, purchases or stock history), so it can't be deleted. Mark it inactive instead.";
  if (e.code === "23514") return "One of the values is out of range. Check prices and quantities.";
  if (e.code === "42501") return "You don't have permission to do that.";
  return e.message ?? "Something went wrong. Try again.";
}

type Storage = { storage: { from: (b: string) => { upload: (p: string, f: File, o: { contentType: string }) => Promise<{ error: { message: string } | null }> } } };

export async function uploadImage(supabase: Storage, bucket: string, file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return { path: null as string | null, error: null as string | null };
  if (!file.type.startsWith("image/")) return { path: null, error: "Upload an image file (JPG, PNG or WebP)." };
  if (file.size > 4 * 1024 * 1024) return { path: null, error: "The image is larger than 4 MB. Choose a smaller one." };
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
  return error ? { path: null, error: error.message } : { path, error: null };
}
