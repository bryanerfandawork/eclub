import "server-only";
import { getAccount, getSettings, isAdmin } from "./plans";
import { isDemoMode } from "./supabase/config";
import { createClient } from "./supabase/server";

export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.eclub.co.id";

/** Link publik + kode affiliate, mis. refUrl("/kelas/abc", "BUDI1") -> https://www.eclub.co.id/kelas/abc?ref=BUDI1 */
export const refUrl = (path: string, code: string) => `${SITE}${path}${path.includes("?") ? "&" : "?"}ref=${encodeURIComponent(code)}`;

/** Kode affiliate milik pengguna yang sedang login, bila berhak (Plus aktif / admin). */
export async function myShare(): Promise<{ eligible: boolean; loggedIn: boolean; code: string | null; rate: number; discount: number }> {
  const s = await getSettings();
  const rate = Number(s.affiliate_rate) || 20;
  const discount = Number(s.coupon_discount) || 10;
  if (isDemoMode) return { eligible: true, loggedIn: true, code: "SAHABAT123", rate, discount };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { eligible: false, loggedIn: false, code: null, rate, discount };
  const acc = await getAccount();
  const eligible = acc.plan === "plus" || isAdmin(acc.role);
  if (!eligible) return { eligible, loggedIn: true, code: null, rate, discount };
  const { data } = await supabase.from("profiles").select("ref_code").eq("id", user.id).maybeSingle();
  return { eligible, loggedIn: true, code: (data?.ref_code as string | null) ?? null, rate, discount };
}
