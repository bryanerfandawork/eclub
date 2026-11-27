import Link from "next/link";
import { BarChart3, ChevronLeft, ChevronRight, Download, Lock, Plus, Settings2, ShieldCheck, Users } from "lucide-react";
import { PocketBadge } from "@/components/finance/pocket-badge";
import { getAccount, getSettings, isAdmin } from "@/lib/plans";
import { assistantConfig } from "@/lib/assistant-config";
import { compactRupiah } from "@/lib/format";
import { deleteTx } from "@/app/actions/finance";
import { respondBook } from "@/app/actions/finance-books";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/supabase/config";
import { getMe } from "@/lib/me";
import { CatatButton, DeleteTx, QuickAdd } from "@/components/finance/quick-add";
import { PageHeader } from "@/components/ui";
import { BOOK_EMOJI, ROLE_LABEL, catInfo, setEffect, setSummary, WALLET_LABEL, bookWallet, type Book, type Tx, type Wallet } from "@/lib/finance";
import { getFinance, getMonthly, getViewTxs } from "@/lib/finance-server";
import { getDreams } from "@/lib/data";
import { earmarked } from "@/lib/pockets";
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

type View = { key: string; label: string; emoji: string; wallet: Wallet; ids: string[]; balance: number; book: Book | null };

export default async function KeuanganPage({ searchParams }: { searchParams: Promise<{ w?: string; m?: string; b?: string }> }) {
  const sp = await searchParams;
  const thisMonth = todayJakarta().slice(0, 7);
  const month = /^\d{4}-\d{2}$/.test(sp.m ?? "") && sp.m! <= thisMonth ? sp.m! : thisMonth;
  const [{ hasAny, pockets, books: allBooks }, acc, dreams, me] = await Promise.all([getFinance(month), getAccount(), getDreams(), isDemoMode ? Promise.resolve({ user: null, row: null }) : getMe()]);
  const plus = acc.plan === "plus" || isAdmin(acc.role);
  const books = allBooks.filter((b) => b.status === "active");
  const invites = allBooks.filter((b) => b.status === "invited");
  const sum = (ids: string[]) => pockets.filter((p) => ids.includes(p.id)).reduce((n, p) => n + p.balance, 0);
  // Dompet yang bisa dibuka: Pribadi + buku usaha/keluarga (SQL 029). Sebelum itu: Pribadi & Usaha.
  const views: View[] = books.length
    ? [
        { key: "", label: "Pribadi", emoji: "🙂", wallet: "personal" as Wallet, ids: pockets.filter((p) => !p.book_id && p.own !== false).map((p) => p.id), book: null },
        ...books.map((b) => ({ key: b.id, label: b.name, emoji: BOOK_EMOJI[b.kind], wallet: bookWallet(b.kind), ids: pockets.filter((p) => p.book_id === b.id).map((p) => p.id), book: b })),
      ].map((v) => ({ ...v, balance: sum(v.ids) }))
    : (["personal", "business"] as Wallet[]).map((w) => {
        const ids = pockets.filter((p) => p.wallet === w).map((p) => p.id);
        return { key: w, label: WALLET_LABEL[w], emoji: w === "personal" ? "🙂" : "🏪", wallet: w, ids, balance: sum(ids), book: null };
      });
  const wanted = sp.b ?? (sp.w === "business" ? (books.length ? (books.find((b) => b.kind === "business" && b.mine) ?? books.find((b) => b.kind === "business"))?.id : "business") : undefined);
  const view = views.find((v) => v.key === wanted) ?? views[0];
  const w = view.wallet;
  const book = view.book;
  const set = new Set(view.ids);
  const txs = await getViewTxs(month, view.ids.join(","));
  const monthly = plus ? await getMonthly(view.ids) : [];
  const maxM = Math.max(1, ...monthly.flatMap((x) => [x.income, x.expense]));
  const myPockets = pockets.filter((p) => set.has(p.id));
  const pname = (id?: string | null) => pockets.find((p) => p.id === id)?.name;
  const mine = txs;
  const s = setSummary(txs, set);
  const net = s.income - s.expense;
  const paidSelf = txs.some((t) => t.kind === "transfer" && t.category === "gaji_diri");
  const canManage = !book || book.role !== "recorder";
  const href = (q: { b?: string; m?: string }) => {
    const k = q.b ?? view.key;
    const m = q.m ?? month;
    const qs = [k ? (books.length ? `b=${k}` : `w=${k}`) : "", m !== thisMonth ? `m=${m}` : ""].filter(Boolean).join("&");
    return `/keuangan${qs ? `?${qs}` : ""}`;
  };
  // Siapa yang mencatat (buku bersama).
  let people = new Map<string, string>();
  if (book && book.members > 1 && !isDemoMode) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("fin_book_people", { p_book: book.id });
    people = new Map(((data ?? []) as { user_id: string; full_name: string | null }[]).map((r) => [r.user_id, (r.full_name ?? "Anggota").split(" ")[0]]));
  }
  const who = (t: Tx) => (book && t.user_id && t.user_id !== me.user?.id ? people.get(t.user_id) : null);

  const groups = new Map<string, Tx[]>();
  for (const t of mine) groups.set(t.tx_date, [...(groups.get(t.tx_date) ?? []), t]);

  return (
    <>
      <PageHeader
        eyebrow="Keuangan"
        title="Uang Anda, rapi & terpisah"
        desc="Pribadi, setiap usaha, dan keuangan keluarga punya dompet sendiri. Di dalamnya ada kantong: uang tunai, rekening bank, atau e-wallet. Lapor setiap hari, cukup 1 menit."
      />

      {invites.map((b) => (
        <section key={b.id} className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-gold bg-gold-soft/50 p-4">
          <span className="text-2xl">{BOOK_EMOJI[b.kind]}</span>
          <p className="min-w-0 flex-1 text-sm text-heading">
            <b>{b.owner_name ?? "Seseorang"}</b> mengajak Anda mengelola <b>{b.name}</b> sebagai {ROLE_LABEL[b.role]}. Keuangan Pribadi Anda tetap rahasia.
          </p>
          <form action={respondBook} className="flex gap-2">
            <input type="hidden" name="book_id" value={b.id} />
            <button name="accept" value="1" className="btn-primary py-2">Terima</button>
            <button name="accept" value="0" className="btn-ghost py-2">Tolak</button>
          </form>
        </section>
      ))}

      {/* Dompet: Pribadi, usaha-usaha, keluarga */}
      <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
        {views.map((x) => {
          const on = x.key === view.key;
          return (
            <Link
              key={x.key}
              href={href({ b: x.key })}
              scroll={false}
              className={`relative min-w-[46%] shrink-0 snap-start overflow-hidden rounded-2xl p-4 transition sm:min-w-[220px] lg:p-5 ${on ? "bg-brand text-white shadow-lift" : "card hover:border-gold"}`}
            >
              {on && <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gold/25 blur-2xl" />}
              <p className={`truncate text-xs font-semibold ${on ? "text-gold" : "text-muted"}`}>
                {x.emoji} {x.book ? x.label : `Dompet ${x.label}`}
              </p>
              <p className={`mt-1.5 text-xl font-bold tracking-tight lg:text-2xl ${on ? "" : "text-heading"} ${x.balance < 0 ? (on ? "text-gold" : "text-danger") : ""}`}>{rupiah(x.balance)}</p>
              <p className={`mt-0.5 flex items-center gap-1 text-[11px] ${on ? "text-white/60" : "text-muted"}`}>
                {x.book && x.book.members > 1 ? (
                  <>
                    <Users className="h-3 w-3" /> {x.book.members} orang{!x.book.mine ? ` · milik ${(x.book.owner_name ?? "").split(" ")[0]}` : ""}
                  </>
                ) : (
                  "Saldo saat ini"
                )}
              </p>
            </Link>
          );
        })}
        {books.length > 0 && (
          <Link href="/keuangan/buku" className="flex min-w-[120px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line p-4 text-center text-xs font-semibold text-muted hover:border-gold hover:text-heading">
            <Plus className="h-5 w-5 text-brand" /> Usaha lain / Keluarga
          </Link>
        )}
      </div>

      {myPockets.length > 0 && (
        <section className="mt-3 rounded-2xl border border-line bg-white p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-muted">Kantong {view.label}</p>
            <span className="flex items-center gap-3">
              {book && (
                <Link href={`/keuangan/buku#${book.id}`} className="flex items-center gap-1 text-xs font-semibold text-brand">
                  <Users className="h-3.5 w-3.5" /> {book.mine ? "Anggota" : ROLE_LABEL[book.role]}
                </Link>
              )}
              {canManage && (
                <Link href={`/keuangan/kantong${book ? `#${book.id}` : ""}`} className="flex items-center gap-1 text-xs font-semibold text-brand">
                  <Settings2 className="h-3.5 w-3.5" /> Kelola kantong
                </Link>
              )}
            </span>
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {myPockets.map((p) => (
              <div key={p.id} className="flex min-w-[150px] items-center gap-2.5 rounded-xl bg-paper p-2.5">
                <PocketBadge type={p.type} provider={p.provider} size={34} />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-heading">{p.name}</span>
                  <span className={`block text-sm font-bold ${p.balance < 0 ? "text-danger" : "text-heading"}`}>{rupiah(p.balance)}</span>
                  {earmarked(p) > 0 && <span className="block text-[11px] font-semibold text-gold">🐷 {compactRupiah(earmarked(p))} untuk mimpi</span>}
                </span>
              </div>
            ))}
          </div>
          {book?.role === "recorder" && book.pocket_ids && <p className="mt-1 px-1 text-[11px] text-muted">Anda pencatat di buku ini, jadi yang tampil hanya kantong yang diizinkan pemilik.</p>}
        </section>
      )}

      {w === "business" && canManage && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link href="/keuangan/hpp" className="card flex items-center gap-3 p-3.5 hover:border-gold">
            <span className="text-2xl">🧮</span>
            <span className="text-sm leading-tight">
              <b className="block text-heading">Kalkulator HPP</b>
              <span className="text-xs text-muted">Harga jual yang untung</span>
            </span>
          </Link>
          <Link href={`/keuangan/laba-rugi${book ? `?b=${book.id}` : ""}`} className="card flex items-center gap-3 p-3.5 hover:border-gold">
            <span className="text-2xl">📊</span>
            <span className="text-sm leading-tight">
              <b className="block text-heading">Laba rugi</b>
              <span className="text-xs text-muted">Untung bersih bulan ini</span>
            </span>
          </Link>
        </div>
      )}
      {view.key === "" && books.length > 0 && !books.some((b) => b.kind === "family") && (
        <Link href="/keuangan/buku" className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 hover:border-gold">
          <span className="text-2xl">👨‍👩‍👧</span>
          <span className="flex-1 text-sm">
            <b className="block text-heading">Kelola keuangan keluarga bersama pasangan</b>
            <span className="text-xs text-muted">Buku keluarga terpisah dari dompet pribadi. Pasangan bisa ikut mencatat.{!plus && " Khusus Plus."}</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>
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
            {month === thisMonth && !paidSelf && w === "business" && canManage && (!book || book.mine) && view.balance > 0 && (
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
                  <a href={`/api/keuangan/export?m=${month}${book ? `&b=${book.id}` : view.key === "business" ? "&w=business" : ""}`} className="flex items-center gap-1 text-xs font-semibold text-brand">
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
            <h3 className="font-bold text-heading">Riwayat {view.label}</h3>
            {mine.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted">
                Belum ada catatan di bulan ini.
                <div className="mt-3">
                  <CatatButton preset={{ wallet: w, book: view.key }} className="btn-ghost">
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
                        const v = setEffect(t, set);
                        return (
                          <li key={t.id} className="group flex items-center gap-3 py-2.5">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper text-xl">{c.emoji}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-heading">{c.label}</span>
                              <span className="block truncate text-xs text-muted">
                                {[t.kind === "transfer" && t.to_pocket_id ? `${pname(t.pocket_id) ?? "Pribadi"} → ${pname(t.to_pocket_id) ?? "Pribadi"}` : pname(t.pocket_id), t.note, who(t) ? `oleh ${who(t)}` : null, t.source === "scan" ? "📸" : t.source === "chat" ? "💬" : null].filter(Boolean).join(" · ")}
                              </span>
                            </span>
                            {t.kind === "transfer" && v === 0 ? (
                              <span className="text-sm font-bold whitespace-nowrap text-muted">⇄ {rupiah(t.amount)}</span>
                            ) : (
                              <span className={`text-sm font-bold whitespace-nowrap ${v >= 0 ? "text-success" : "text-ink"}`}>
                                {v >= 0 ? "+" : "−"}
                                {rupiah(Math.abs(v))}
                              </span>
                            )}
                            {(canManage || t.user_id === me.user?.id) && <DeleteTx id={t.id} action={deleteTx} />}
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
        <ShieldCheck className="h-3.5 w-3.5" /> {book && book.members > 1 ? `Buku ini dikelola ${book.members} orang. Keuangan Pribadi Anda tetap hanya bisa dilihat oleh Anda.` : "Catatan keuangan hanya bisa dilihat oleh Anda."}
      </p>
      <div className="h-16 lg:hidden" />
      <QuickAdd defaultWallet={w} defaultBook={books.length ? view.key : undefined} pockets={pockets} books={allBooks} plus={plus} teaser={assistantConfig(await getSettings()).teaser} dreams={dreams.filter((d) => d.status === "active").map((d) => ({ id: d.id, title: d.title }))} />
    </>
  );
}
