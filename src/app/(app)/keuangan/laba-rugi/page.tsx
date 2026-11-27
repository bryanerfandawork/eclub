import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { PrintButton } from "@/components/print-button";
import { catInfo, setEffect, type Tx } from "@/lib/finance";
import { getBooks, getFinance, getPockets, getViewTxs } from "@/lib/finance-server";
import { rupiah, todayJakarta } from "@/lib/format";
import { getAccount, isAdmin } from "@/lib/plans";

export const metadata = { title: "Laba Rugi" };

const REVENUE = ["penjualan", "jasa", "lain"];
const COGS = ["bahan"];
const NON_PL_OUT = ["cicilan"];

function shift(month: string, d: number) {
  const [y, m] = month.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1 + d, 1));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}`;
}

function pl(txs: Tx[], set: Set<string> | null) {
  // set = kantong satu buku usaha (SQL 029). null = semua dompet Usaha (cara lama).
  const inSet = (t: Tx) => (set ? !!t.pocket_id && set.has(t.pocket_id) : t.wallet === "business");
  const biz = set ? txs : txs.filter((t) => t.wallet === "business" || t.to_wallet === "business");
  const sum = (f: (t: Tx) => boolean) => biz.filter(f).reduce((s, t) => s + t.amount, 0);
  const tOut = (t: Tx) => t.kind === "transfer" && (set ? setEffect(t, set) < 0 : t.wallet === "business" && t.to_wallet !== "business");
  const tIn = (t: Tx) => t.kind === "transfer" && (set ? setEffect(t, set) > 0 : t.to_wallet === "business" && t.wallet !== "business");
  const revenue = new Map<string, number>();
  const opex = new Map<string, number>();
  for (const t of biz) {
    if (t.kind === "in" && inSet(t) && REVENUE.includes(t.category)) revenue.set(t.category, (revenue.get(t.category) ?? 0) + t.amount);
    if (t.kind === "out" && inSet(t) && !COGS.includes(t.category) && !NON_PL_OUT.includes(t.category)) opex.set(t.category, (opex.get(t.category) ?? 0) + t.amount);
  }
  const rev = [...revenue.values()].reduce((a, b) => a + b, 0);
  const cogs = sum((t) => t.kind === "out" && inSet(t) && COGS.includes(t.category));
  const op = [...opex.values()].reduce((a, b) => a + b, 0);
  return {
    revenue: [...revenue.entries()].sort((a, b) => b[1] - a[1]),
    opex: [...opex.entries()].sort((a, b) => b[1] - a[1]),
    rev,
    cogs,
    gross: rev - cogs,
    op,
    net: rev - cogs - op,
    owner: sum(tOut),
    capitalIn: sum((t) => tIn(t) || (t.kind === "in" && inSet(t) && t.category === "modal")),
    debt: sum((t) => t.kind === "out" && inSet(t) && NON_PL_OUT.includes(t.category)),
  };
}

function Row({ label, value, bold, sub, tone }: { label: string; value: number; bold?: boolean; sub?: boolean; tone?: string }) {
  return (
    <div className={`flex items-center justify-between py-2 ${sub ? "pl-4 text-sm text-muted" : ""} ${bold ? "font-bold text-heading" : ""}`}>
      <span>{label}</span>
      <span className={tone}>{rupiah(value)}</span>
    </div>
  );
}

export default async function LabaRugiPage({ searchParams }: { searchParams: Promise<{ m?: string; b?: string }> }) {
  const sp = await searchParams;
  const thisMonth = todayJakarta().slice(0, 7);
  const month = /^\d{4}-\d{2}$/.test(sp.m ?? "") && sp.m! <= thisMonth ? sp.m! : thisMonth;
  const acc = await getAccount();
  const plus = acc.plan === "plus" || isAdmin(acc.role);
  const [books, pockets] = await Promise.all([getBooks(), getPockets()]);
  const biz = books.filter((b) => b.status === "active" && b.kind === "business" && b.role !== "recorder");
  const book = biz.find((b) => b.id === sp.b) ?? biz.find((b) => b.mine) ?? biz[0] ?? null;
  let r: ReturnType<typeof pl>, p: ReturnType<typeof pl>;
  if (book) {
    const ids = pockets.filter((x) => x.book_id === book.id).map((x) => x.id);
    const set = new Set(ids);
    const [a, b] = await Promise.all([getViewTxs(month, ids.join(",")), getViewTxs(shift(month, -1), ids.join(","))]);
    r = pl(a, set);
    p = pl(b, set);
  } else {
    const [cur, prev] = await Promise.all([getFinance(month), getFinance(shift(month, -1))]);
    r = pl(cur.txs, null);
    p = pl(prev.txs, null);
  }
  const q = book ? `&b=${book.id}` : "";
  const margin = r.rev ? Math.round((r.net / r.rev) * 100) : 0;
  const delta = r.net - p.net;
  const name = new Date(month + "-01T00:00:00").toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <>
      <Link href={book ? `/keuangan?b=${book.id}` : "/keuangan?w=business"} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-heading print:hidden">
        <ArrowLeft className="h-4 w-4" /> Keuangan
      </Link>
      <PageHeader eyebrow="Keuangan usaha" title="Laba rugi" desc={`Dihitung otomatis dari catatan ${book ? `"${book.name}"` : "dompet Usaha"}. Tidak perlu paham akuntansi.`} action={plus ? <PrintButton /> : undefined} />

      <div className="mb-4 flex items-center justify-between rounded-2xl border border-line bg-white px-2 py-1.5 print:hidden">
        <Link href={`/keuangan/laba-rugi?m=${shift(month, -1)}${q}`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper" aria-label="Bulan sebelumnya">
          <ChevronLeft className="h-5 w-5 text-muted" />
        </Link>
        <p className="font-bold text-heading capitalize">{name}</p>
        {month < thisMonth ? (
          <Link href={`/keuangan/laba-rugi?m=${shift(month, 1)}${q}`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper" aria-label="Bulan berikutnya">
            <ChevronRight className="h-5 w-5 text-muted" />
          </Link>
        ) : (
          <span className="h-9 w-9" />
        )}
      </div>

      <div className="relative">
        <div className={`grid gap-5 lg:grid-cols-5 lg:gap-6 ${plus ? "" : "pointer-events-none blur-[6px] select-none"}`} aria-hidden={!plus}>
          <section className="card p-5 lg:col-span-3 lg:p-6">
            <p className="hidden text-lg font-bold text-heading capitalize print:block">Laba rugi · {name}</p>
            <Row label="Pendapatan" value={r.rev} bold />
            {r.revenue.map(([k, v]) => (
              <Row key={k} label={`${catInfo({ wallet: "business", kind: "in", category: k }).emoji} ${catInfo({ wallet: "business", kind: "in", category: k }).label}`} value={v} sub />
            ))}
            <Row label="Modal bahan (HPP)" value={-r.cogs} bold />
            <div className="my-1 border-t border-dashed border-line" />
            <Row label="Laba kotor" value={r.gross} bold tone={r.gross < 0 ? "text-danger" : ""} />
            <Row label="Biaya operasional" value={-r.op} bold />
            {r.opex.map(([k, v]) => (
              <Row key={k} label={`${catInfo({ wallet: "business", kind: "out", category: k }).emoji} ${catInfo({ wallet: "business", kind: "out", category: k }).label}`} value={-v} sub />
            ))}
            <div className="mt-2 flex items-center justify-between rounded-xl bg-paper px-4 py-3.5">
              <span className="font-bold text-heading">Laba bersih</span>
              <span className={`text-xl font-bold ${r.net < 0 ? "text-danger" : "text-success"}`}>{rupiah(r.net)}</span>
            </div>
            <div className="mt-5 rounded-xl border border-line p-4 text-sm">
              <p className="font-semibold text-heading">Di luar laba rugi</p>
              <p className="mt-0.5 text-xs text-muted">Tetap tercatat, tapi bukan biaya usaha.</p>
              <Row label="🧑‍💼 Gaji diri sendiri (diambil pemilik)" value={r.owner} sub />
              <Row label="🏦 Modal / pinjaman masuk" value={r.capitalIn} sub />
              <Row label="💳 Cicilan usaha" value={r.debt} sub />
            </div>
          </section>
          <aside className="space-y-4 lg:col-span-2 print:hidden">
            <section className="rounded-2xl bg-brand p-6 text-white shadow-lift">
              <p className="text-xs font-semibold text-gold">Margin laba bersih</p>
              <p className="mt-1 text-4xl font-bold">{margin}%</p>
              <p className="mt-2 text-sm text-white/70">
                {delta === 0 ? "Sama dengan bulan lalu." : `${delta > 0 ? "Naik" : "Turun"} ${rupiah(Math.abs(delta))} dibanding bulan lalu.`}
              </p>
            </section>
            <section className="card p-5 text-sm">
              <p className="font-bold text-heading">Cara membacanya</p>
              <ul className="mt-2 space-y-2 text-muted">
                <li>
                  <b className="text-heading">Laba kotor</b> = penjualan dikurangi modal bahan. Kalau kecil, cek harga jual di Kalkulator HPP.
                </li>
                <li>
                  <b className="text-heading">Laba bersih</b> = yang benar-benar tersisa setelah semua biaya usaha.
                </li>
                <li>Idealnya gaji diri sendiri diambil dari laba bersih, bukan dari modal.</li>
                {r.owner > r.net && r.owner > 0 && <li className="font-medium text-danger">Bulan ini gaji diri sendiri lebih besar dari laba bersih. Hati-hati, modal usaha bisa tergerus.</li>}
              </ul>
            </section>
          </aside>
        </div>
        {!plus && (
          <div className="absolute inset-0 grid place-items-start justify-center pt-16">
            <div className="card max-w-sm p-6 text-center shadow-lift">
              <Crown className="mx-auto h-8 w-8 text-gold" />
              <p className="mt-2 text-lg font-bold text-heading">Laporan laba rugi otomatis</p>
              <p className="mt-1 text-sm text-muted">Lihat untung bersih usaha tiap bulan dari catatan yang sudah Anda isi, lengkap dengan pembanding bulan lalu dan bisa dicetak PDF.</p>
              <Link href="/beli/plus" className="btn-gold mt-4 w-full">
                Buka dengan EClub Plus
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
