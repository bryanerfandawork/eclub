import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isDemoMode } from "./config";

const PROTECTED = ["/dashboard", "/journey", "/goals", "/learn", "/profile", "/today", "/wheel-of-life", "/progress", "/my-life"];
const AUTH_PAGES = ["/masuk", "/daftar"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (isDemoMode) return response;

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
  const redirectTo = (to: string) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = "";
    const r = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };

  if (!user && PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) return redirectTo("/masuk");
  if (user && (AUTH_PAGES.includes(path) || path === "/")) return redirectTo("/dashboard");

  return response;
}
