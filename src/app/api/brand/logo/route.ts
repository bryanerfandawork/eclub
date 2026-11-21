import { NextResponse } from "next/server";
import { getSettings } from "@/lib/plans";

/** Alamat logo yang tetap (dipakai di template email): /api/brand/logo?v=light|dark|icon → logo terbaru dari Admin. */
export async function GET(request: Request) {
  const v = new URL(request.url).searchParams.get("v") ?? "dark";
  const st = await getSettings();
  const url = String((v === "icon" ? st.icon_url : v === "light" ? st.logo_url : st.logo_dark_url || st.logo_url) ?? "");
  const target = url || new URL(v === "icon" ? "/icons/icon-512.png" : "/brand/eclub-logo-original.png", request.url).toString();
  return NextResponse.redirect(target, { status: 302, headers: { "Cache-Control": "public, max-age=3600" } });
}
