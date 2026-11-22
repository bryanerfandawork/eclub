import { NextResponse } from "next/server";
import { getDoneMap } from "@/lib/steps-server";

export const dynamic = "force-dynamic";

/** Status isian perjalanan untuk tombol Lanjut (khusus pengguna yang login). */
export async function GET() {
  try {
    return NextResponse.json({ done: await getDoneMap() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ done: null }, { status: 401 });
  }
}
