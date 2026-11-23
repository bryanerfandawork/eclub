import { NextResponse } from "next/server";
import { catInfo, WALLET_LABEL, type Tx } from "@/lib/finance";
import { getAccount, isAdmin } from "@/lib/plans";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** Ekspor catatan keuangan satu bulan ke CSV (dibuka di Excel / Google Sheets). Khusus Plus. */
export async function GET(request: Request) {
  if (isDemoMode) return NextResponse.json({ error: "demo" }, { status: 400 });
  const acc = await getAccount();
  if (acc.plan !== "plus" && !isAdmin(acc.role)) return NextResponse.json({ error: "Khusus member Plus" }, { status: 403 });
  const m = new URL(request.url).searchParams.get("m") ?? "";
  if (!/^\d{4}-\d{2}$/.test(m)) return NextResponse.json({ error: "bulan" }, { status: 400 });
  const [y, mo] = m.split("-").map(Number);
  const next = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`;
  const supabase = await createClient();
  const [{ data }, { data: pk }] = await Promise.all([
    supabase.from("fin_transactions").select("*").gte("tx_date", `${m}-01`).lt("tx_date", `${next}-01`).order("tx_date"),
    supabase.from("fin_pockets").select("id, name"),
  ]);
  const pname = new Map(((pk ?? []) as { id: string; name: string }[]).map((p) => [p.id, p.name]));
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const KIND = { in: "Masuk", out: "Keluar", transfer: "Pindah" } as const;
  const lines = [["Tanggal", "Dompet", "Kantong", "Jenis", "Kategori", "Nominal", "Ke dompet", "Ke kantong", "Catatan"].map(esc).join(",")];
  for (const t of (data ?? []) as Tx[]) {
    lines.push(
      [t.tx_date, WALLET_LABEL[t.wallet], pname.get(t.pocket_id ?? "") ?? "", KIND[t.kind], catInfo(t).label, Number(t.amount), t.to_wallet ? WALLET_LABEL[t.to_wallet] : "", pname.get(t.to_pocket_id ?? "") ?? "", t.note ?? ""]
        .map(esc)
        .join(","),
    );
  }
  return new NextResponse("﻿" + lines.join("\n"), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="keuangan-eclub-${m}.csv"` },
  });
}
