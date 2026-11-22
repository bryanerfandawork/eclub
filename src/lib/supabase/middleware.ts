import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isDemoMode } from "./config";

const PROTECTED = ["/dashboard", "/journey", "/goals", "/learn", "/profile", "/today", "/wheel-of-life", "/progress", "/my-life", "/assessment", "/admin", "/paket", "/beli", "/pesanan", "/posisi", "/disc", "/keuangan", "/affiliate", "/mentoring", "/event", "/kebiasaan", "/sertifikat", "/komunitas", "/target", "/lengkapi", "/aktifkan-notifikasi"];
const AUTH_PAGES = ["/masuk", "/daftar"];
/** [halaman aplikasi, halaman pratinjau publik] */
const PUBLIC_PREVIEW: [string, string][] = [
  ["/learn", "/kelas"],
  ["/event", "/acara"],
  ["/mentoring", "/mentoring-1on1"],
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const ref = request.nextUrl.searchParams.get("ref");
  const next = request.nextUrl.searchParams.get("next");
  const keepRef = (r: NextResponse) => {
    if (ref && /^[A-Za-z0-9]{3,16}$/.test(ref)) r.cookies.set("eclub_ref", ref.toUpperCase(), { maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax" });
    // Halaman tujuan setelah daftar/masuk (mis. kelas yang dibagikan affiliate). Bertahan sampai konfirmasi email.
    if (next && AUTH_PAGES.includes(request.nextUrl.pathname) && /^\/[A-Za-z0-9/_-]{0,120}$/.test(next) && !next.startsWith("//"))
      r.cookies.set("eclub_next", next, { maxAge: 60 * 60 * 24, path: "/", sameSite: "lax" });
    return r;
  };
  if (isDemoMode) return keepRef(response);

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const redirectTo = (to: string, search = "") => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = search;
    const r = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return keepRef(r);
  };

  if (!user) {
    // Tamu (mis. dari link affiliate) melihat versi pratinjau publik dulu, baru daftar saat mau bergabung.
    const pub = PUBLIC_PREVIEW.find(([from]) => path === from || path.startsWith(from + "/"));
    if (pub) return redirectTo(pub[1] + path.slice(pub[0].length));
    if (PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) return redirectTo("/masuk", "?next=" + encodeURIComponent(path));
  }
  if (user) {
    if (AUTH_PAGES.includes(path) || path === "/") return redirectTo("/dashboard");
    // Member yang membuka link pratinjau langsung diarahkan ke versi di dalam aplikasi.
    const app = PUBLIC_PREVIEW.find(([, to]) => path === to || path.startsWith(to + "/"));
    if (app) return redirectTo(app[0] + path.slice(app[1].length));
  }

  return keepRef(response);
}
