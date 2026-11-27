import { NextResponse } from "next/server";
import { catInfo, WALLET_LABEL, type Tx } from "@/lib/finance";
import { getBooks, getPockets, ownIds } from "@/lib/finance-server";
import { getAccount, isAdmin } from "@/lib/plans";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** Ekspor catatan keuangan satu bulan ke CSV (dibuka di Excel / Google Sheets). Khusus Plus. */
export async function GET(request: Request) {
  if (isDemoMode) return NextResponse.json({ error: "demo" }, { status: 400 });
  const acc = await getAccount();
  if (acc.plan !== "plus" && !isAdmin(acc.role)) return NextResponse.json({ error: "Khusus member Plus" }, { status: 403 });
  const url = new URL(request.url);
  const m = url.searchParams.get("m") ?? "";
  const b = url.searchParams.get("b") ?? "";
  if (!/^\d{4}-\d{2}$/.test(m)) return NextResponse.json({ error: "bulan" }, { status: 400 });
  const [y, mo] = m.split("-").map(Number);
  const next = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`;
  const supabase = await createClient();
  // Satu buku (b=...), atau keuangan saya sendiri (Pribadi + usaha milik saya).
  const [pockets, books] = await Promise.all([getPockets(), getBooks()]);
  const ids: string[] = b ? pockets.filter((p) => p.book_id === b).map((p) => p.id) : ownIds(pockets, books);
  if (b && !ids.length) ids.push("00000000-0000-0000-0000-000000000000");
  let q = supabase.from("fin_transactions").select("*").gte("tx_date", `${m}-01`).lt("tx_date", `${next}-01`).order("tx_date");
  if (ids.length) q = q.or(`pocket_id.in.(${ids.join(",")}),to_pocket_id.in.(${ids.join(",")})`);
  const { data } = await q;
  const pname = new Map(pockets.map((p) => [p.id, p.name]));
  const bname = new Map(books.map((x) => [x.id, x.name]));
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const KIND = { in: "Masuk", out: "Keluar", transfer: "Pindah" } as const;
  const lines = [["Tanggal", "Dompet", "Kantong", "Jenis", "Kategori", "Nominal", "Ke dompet", "Ke kantong", "Catatan"].map(esc).join(",")];
  for (const t of (data ?? []) as Tx[]) {
    lines.push(
      [t.tx_date, t.book_id ? (bname.get(t.book_id) ?? WALLET_LABEL[t.wallet]) : WALLET_LABEL[t.wallet], pname.get(t.pocket_id ?? "") ?? "", KIND[t.kind], catInfo(t).label, Number(t.amount), t.to_wallet ? WALLET_LABEL[t.to_wallet] : "", pname.get(t.to_pocket_id ?? "") ?? "", t.note ?? ""]
        .map(esc)
        .join(","),
    );
  }
  return new NextResponse("﻿" + lines.join("\n"), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="keuangan-eclub-${m}${b ? `-${(bname.get(b) ?? "buku").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}` : ""}.csv"` },
  });
}
