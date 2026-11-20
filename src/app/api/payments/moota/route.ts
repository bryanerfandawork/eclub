import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { moota } from "@/lib/payments/moota";
import { SUPABASE_URL } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, provider: "moota" });
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!moota.verify(raw, request.headers)) {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) {
    return NextResponse.json({ ok: false, error: "server not configured" }, { status: 500 });
  }
  const admin = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } });
  const results = [];
  for (const p of moota.parse(raw)) {
    const { data, error } = await admin.rpc("apply_bank_mutation", {
      p_provider: moota.name,
      p_ref: p.ref,
      p_amount: p.amount,
      p_raw: p.raw,
    });
    results.push({ ref: p.ref, order: data ?? null, error: error?.message });
  }
  return NextResponse.json({ ok: true, processed: results.length, results });
}
