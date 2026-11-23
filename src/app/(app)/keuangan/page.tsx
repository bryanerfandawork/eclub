import Link from "next/link";
import { BarChart3, ChevronLeft, ChevronRight, Download, Lock, Settings2, ShieldCheck } from "lucide-react";
import { PocketBadge } from "@/components/finance/pocket-badge";
import { getAccount, isAdmin } from "@/lib/plans";
import { compactRupiah } from "@/lib/format";
import { deleteTx } from "@/app/actions/finance";
import { CatatButton, DeleteTx, QuickAdd } from "@/components/finance/quick-add";
import { PageHeader } from "@/components/ui";
import { catInfo, effect, WALLET_LABEL, type Tx, type Wallet } from "@/lib/finance";
import { getFinance, getMonthly, monthSummary } from "@/lib/finance-server";
import { rupiah, todayJakarta } from "@/lib/format";

export const metadata = { title: "Keuangan" };

function shift(month: string, d: number) {
  const [y, m] = month.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1 + d, 1));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}`;
}
function monthName(month: string) {
  return new Date(month + "-01T00:00:00").toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}
function dayLabel(iso: string) {
  if (iso === todayJakarta()) return "Hari ini";
  if (iso === todayJakarta(-1)) return "Kemarin";
  return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" });
}

export default async function KeuanganPage({ searchParams }: { searchParams: Promise<{ w?: string; m?: string }> }) {
  const sp = await searchParams;
  const w: Wallet = sp.w === "business" ? "business" : "personal";
  const thisMonth = todayJakarta().slice(0, 7);
  const month = /^\d{4}-\d{2}$/.test(sp.m ?? "") && sp.m! <= thisMonth ? sp.m! : thisMonth;
  const [{ balances, txs, hasAny, pockets }, acc] = await Promise.all([getFinance(month), getAccount()]);
  const plus = acc.plan === "plus" || isAdmin(acc.role);
  const monthly = plus ? await getMonthly(w) : [];
  const maxM = Math.max(1, ...monthly.flatMap((x) => [x.income, x.expense]));
  const myPockets = pockets.filter((p) => p.wallet === w);
  const pname = (id?: string | null) => pockets.find((p) => p.id === id)?.name;
  const mine = txs.filter((t) => t.wallet === w || t.to_wallet === w);
  const s = monthSummary(txs, w);
  const net = s.income - s.expense;
  const paidSelf = txs.some((t) => t.kind === "transfer" && t.category === "gaji_diri");
  const href = (q: { w?: Wallet; m?: string }) => `/keuangan?w=${q.w ?? w}${(q.m ?? month) !== thisMonth ? `&m=${q.m ?? month}` : ""}`;

  const groups = new Map<string, Tx[]>();
  for (const t of mine) groups.set(t.tx_date, [...(groups.get(t.tx_date) ?? []), t]);

  return (
    <>
      <PageHeader
        eyebrow="Keuangan"
        title="Uang Anda, rapi & terpisah"
        desc="Pribadi dan usaha punya dompet sendiri. Di dalamnya ada kantong: uang tunai, rekening bank, atau e-wallet. Lapor setiap hari, cukup 1 menit."
      />

      {/* Dua dompet */}
      <div className="grid grid-cols-2 gap-3">
        {(["personal", "business"] as Wallet[]).map((x) => {
          const on = x === w;
          return (
            <Link
              key={x}
              href={href({ w: x })}
              scroll={false}
              className={`relative overflow-hidden rounded-2xl p-4 transition lg:p-5 ${on ? "bg-brand text-white shadow-lift" : "card hover:border-gold"}`}
            >
              {on && <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gold/25 blur-2xl" />}
              <p className={`text-xs font-semibold ${on ? "text-gold" : "text-muted"}`}>
                {x === "personal" ? "🙂" : "🏪"} Dompet {WALLET_LABEL[x]}
              </p>
              <p className={`mt-1.5 text-xl font-bold tracking-tight lg:text-2xl ${on ? "" : "text-heading"} ${balances[x] < 0 ? (on ? "text-gold" : "text-danger") : ""}`}>{rupiah(balances[x])}</p>
              <p className={`mt-0.5 text-[11px] ${on ? "text-white/60" : "text-muted"}`}>Saldo saat ini</p>
            </Link>
          );
        })}
      </div>

      {myPockets.length > 0 && (
        <section className="mt-3 rounded-2xl border border-line bg-white p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-muted">Kantong {WALLET_LABEL[w]}</p>
            <Link href="/keuangan/kantong" className="flex items-center gap-1 text-xs font-semibold text-brand">
              <Settings2 className="h-3.5 w-3.5" /> Kelola kantong
            </Link>
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {myPockets.map((p) => (
              <div key={p.id} className="flex min-w-[150px] items-center gap-2.5 rounded-xl bg-paper p-2.5">
                <PocketBadge type={p.type} provider={p.provider} size={34} />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-heading">{p.name}</span>
                  <span className={`block text-sm font-bold ${p.balance < 0 ? "text-danger" : "text-heading"}`}>{rupiah(p.balance)}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {w === "business" && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link href="/keuangan/hpp" className="card flex items-center gap-3 p-3.5 hover:border-gold">
            <span className="text-2xl">🧮</span>
            <span className="text-sm leading-tight">
              <b className="block text-heading">Kalkulator HPP</b>
              <span className="text-xs text-muted">Harga jual yang untung</span>
            </span>
          </Link>
          <Link href="/keuangan/laba-rugi" className="card flex items-center gap-3 p-3.5 hover:border-gold">
            <span className="text-2xl">📊</span>
            <span className="text-sm leading-tight">
              <b className="block text-heading">Laba rugi</b>
              <span className="text-xs text-muted">Untung bersih bulan ini</span>
            </span>
          </Link>
        </div>
      )}

      {!hasAny ? (
        <section className="card mt-5 p-6 text-center lg:p-8">
          <div className="text-4xl">👋</div>
          <h2 className="mt-3 text-lg font-bold text-heading">Mulai dari saldo yang Anda punya sekarang</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">
            Cukup isi berapa uang pribadi dan uang usaha Anda hari ini. Setelah itu, catat setiap uang masuk dan keluar. Butuh 5 detik saja.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <CatatButton preset={{ kind: "in", wallet: "personal", category: "saldo_awal" }} className="btn-ghost">
              🙂 Isi saldo Pribadi
            </CatatButton>
            <CatatButton preset={{ kind: "in", wallet: "business", category: "saldo_awal" }} className="btn-primary">
              🏪 Isi saldo Usaha
            </CatatButton>
          </div>
          <div className="mx-auto mt-6 grid max-w-lg gap-3 text-left text-sm sm:grid-cols-3">
            {[
              ["🔀", "Tidak tercampur", "Uang usaha dan pribadi dicatat terpisah."],
              ["🧑‍💼", "Gaji diri sendiri", "Ambil uang usaha dengan cara yang sehat."],
              ["📊", "Tahu ke mana uang pergi", "Lihat pengeluaran terbesar tiap bulan."],
            ].map(([e, t, d]) => (
              <div key={t} className="rounded-xl bg-paper p-3">
                <p className="text-lg">{e}</p>
                <p className="mt-1 font-semibold text-heading">{t}</p>
                <p className="text-xs text-muted">{d}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-5 lg:gap-6">
          <div className="space-y-5 lg:col-span-2">
            {/* Ringkasan bulan */}
            <section className="card p-5">
              <div className="flex items-center justify-between">
                <Link href={href({ m: shift(month, -1) })} scroll={false} className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper" aria-label="Bulan sebelumnya">
                  <ChevronLeft className="h-5 w-5 text-muted" />
                </Link>
                <p className="font-bold text-heading capitalize">{monthName(month)}</p>
                {month < thisMonth ? (
                  <Link href={href({ m: shift(month, 1) })} scroll={false} className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper" aria-label="Bulan berikutnya">
                    <ChevronRight className="h-5 w-5 text-muted" />
                  </Link>
                ) : (
                  <span className="h-9 w-9" />
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-success/8 p-3">
                  <p className="text-xs text-muted">{w === "business" ? "Uang masuk" : "Pemasukan"}</p>
                  <p className="mt-0.5 font-bold text-success">{rupiah(s.income)}</p>
                </div>
                <div className="rounded-xl bg-brand/5 p-3">
                  <p className="text-xs text-muted">{w === "business" ? "Uang keluar" : "Pengeluaran"}</p>
                  <p className="mt-0.5 font-bold text-brand">{rupiah(s.expense)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-line px-3.5 py-3">
                <span className="text-sm text-muted">{w === "business" ? "Sisa kas usaha bulan ini" : "Sisa bulan ini"}</span>
                <span className={`font-bold ${net >= 0 ? "text-heading" : "text-danger"}`}>
                  {net > 0 ? "+" : ""}
                  {rupiah(net)}
                </span>
              </div>
              {(s.transferIn > 0 || s.transferOut > 0) && (
                <p className="mt-3 text-xs text-muted">
                  {w === "business"
                    ? `Gaji diri sendiri / pindah ke pribadi: ${rupiah(s.transferOut)}${s.transferIn ? ` · modal masuk dari pribadi: ${rupiah(s.transferIn)}` : ""}`
                    : `Dari usaha (gaji diri sendiri): ${rupiah(s.transferIn)}${s.transferOut ? ` · ditambahkan ke modal usaha: ${rupiah(s.transferOut)}` : ""}`}
                </p>
              )}
            </section>

            {/* Petunjuk gaji diri sendiri */}
            {month === thisMonth && !paidSelf && balances.business > 0 && (
              <section className="flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold-soft p-4">
                <span className="text-2xl">🧑‍💼</span>
                <div className="flex-1 text-sm">
                  <p className="font-bold text-heading">Sudah gaji diri sendiri bulan ini?</p>
                  <p className="mt-0.5 text-muted">Ambil uang usaha untuk kebutuhan pribadi lewat “gaji”, bukan comot langsung. Usaha jadi sehat, Anda pun tenang.</p>
                  <CatatButton preset={{ kind: "transfer", category: "gaji_diri" }} className="btn-primary mt-3 py-2">
                    Catat gaji diri sendiri
                  </CatatButton>
                </div>
              </section>
            )}

            {/* Grafik 6 bulan (Plus) */}
            {plus ? (
              <section className="card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-bold text-heading">
                    <BarChart3 className="h-4 w-4 text-brand" /> 6 bulan terakhir
                  </h3>
                  <a href={`/api/keuangan/export?m=${month}`} className="flex items-center gap-1 text-xs font-semibold text-brand">
                    <Download className="h-3.5 w-3.5" /> Ekspor Excel
                  </a>
                </div>
                <div className="mt-4 flex h-32 items-end gap-2">
                  {monthly.map((x) => (
                    <div key={x.month} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex h-24 w-full items-end justify-center gap-0.5">
                        <span className="w-1/3 rounded-t bg-success/70" style={{ height: `${Math.max(2, (x.income / maxM) * 100)}%` }} title={`Masuk ${rupiah(x.income)}`} />
                        <span className="w-1/3 rounded-t bg-brand/70" style={{ height: `${Math.max(2, (x.expense / maxM) * 100)}%` }} title={`Keluar ${rupiah(x.expense)}`} />
                      </div>
                      <span className="text-[10px] text-muted">{new Date(x.month + "-01T00:00:00").toLocaleDateString("id-ID", { month: "short" })}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 flex gap-3 text-[11px] text-muted">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success/70" /> Masuk</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand/70" /> Keluar</span>
                  <span className="ml-auto">Rata-rata sisa {compactRupiah(Math.round(monthly.reduce((n, x) => n + x.income - x.expense, 0) / Math.max(1, monthly.length)))}/bln</span>
                </p>
              </section>
            ) : (
              <Link href="/paket" className="card flex items-center gap-3 p-4 hover:border-gold">
                <Lock className="h-5 w-5 shrink-0 text-gold" />
                <span className="flex-1 text-sm">
                  <b className="block text-heading">Grafik 6 bulan, ekspor Excel & kantong tanpa batas</b>
                  <span className="text-muted">Khusus member Plus</span>
                </span>
              </Link>
            )}

            {/* Kategori terbesar */}
            {s.top.length > 0 && (
              <section className="card p-5">
                <h3 className="font-bold text-heading">Ke mana uang pergi?</h3>
                <ul className="mt-3 space-y-3">
                  {s.top.map(([cat, amt]) => {
                    const c = catInfo({ wallet: w, kind: "out", category: cat });
                    const pct = Math.round((amt / s.expense) * 100);
                    return (
                      <li key={cat}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-ink">
                            <span className="text-lg">{c.emoji}</span> {c.label}
                          </span>
                          <span className="font-semibold text-heading">
                            {rupiah(amt)} <span className="text-xs font-normal text-muted">· {pct}%</span>
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-paper">
                          <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>

          {/* Riwayat */}
          <section className="card p-5 lg:col-span-3">
            <h3 className="font-bold text-heading">Riwayat {WALLET_LABEL[w]}</h3>
            {mine.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted">
                Belum ada catatan di bulan ini.
                <div className="mt-3">
                  <CatatButton preset={{ wallet: w }} className="btn-ghost">
                    Catat sekarang
                  </CatatButton>
                </div>
              </div>
            ) : (
              <div className="mt-2 space-y-4">
                {[...groups.entries()].map(([d, list]) => (
                  <div key={d}>
                    <p className="sticky top-0 bg-white py-1.5 text-xs font-semibold text-muted capitalize">{dayLabel(d)}</p>
                    <ul className="divide-y divide-line">
                      {list.map((t) => {
                        const c = catInfo(t);
                        const v = effect(t, w);
                        return (
                          <li key={t.id} className="group flex items-center gap-3 py-2.5">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper text-xl">{c.emoji}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-heading">{c.label}</span>
                              <span className="block truncate text-xs text-muted">
                                {[t.kind === "transfer" && t.to_pocket_id ? `${pname(t.pocket_id) ?? "?"} → ${pname(t.to_pocket_id) ?? "?"}` : pname(t.pocket_id), t.note].filter(Boolean).join(" · ")}
                              </span>
                            </span>
                            {t.kind === "transfer" && t.wallet === t.to_wallet ? (
                              <span className="text-sm font-bold whitespace-nowrap text-muted">⇄ {rupiah(t.amount)}</span>
                            ) : (
                              <span className={`text-sm font-bold whitespace-nowrap ${v >= 0 ? "text-success" : "text-ink"}`}>
                                {v >= 0 ? "+" : "−"}
                                {rupiah(Math.abs(v))}
                              </span>
                            )}
                            <DeleteTx id={t.id} action={deleteTx} />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
        <ShieldCheck className="h-3.5 w-3.5" /> Catatan keuangan hanya bisa dilihat oleh Anda.
      </p>
      <div className="h-16 lg:hidden" />
      <QuickAdd defaultWallet={w} pockets={pockets} plus={plus} />
    </>
  );
}
