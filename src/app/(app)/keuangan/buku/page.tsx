import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { archiveBook, removeBookMember, respondBook } from "@/app/actions/finance-books";
import { PageHeader } from "@/components/ui";
import { BOOK_EMOJI, ROLE_LABEL, type Book } from "@/lib/finance";
import { getBooks, getPockets } from "@/lib/finance-server";
import { rupiah } from "@/lib/format";
import { getMe } from "@/lib/me";
import { getAccount, isAdmin } from "@/lib/plans";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { BookSettings, InviteForm, MemberAccess, NewBookForm } from "./client";

export const metadata = { title: "Buku Keuangan Bersama" };

type Person = { user_id: string; full_name: string | null; username: string | null; role: Book["role"]; status: "invited" | "active"; pocket_ids: string[] | null };

export default async function BukuPage() {
  const [books, pockets, acc, me] = await Promise.all([getBooks(), getPockets(), getAccount(), isDemoMode ? Promise.resolve({ user: null, row: null }) : getMe()]);
  const plus = acc.plan === "plus" || isAdmin(acc.role);
  const active = books.filter((b) => b.status === "active");
  const invites = books.filter((b) => b.status === "invited");
  const supabase = isDemoMode ? null : await createClient();
  const people = new Map<string, Person[]>();
  let workspaces: { id: string; name: string }[] = [];
  if (supabase) {
    const res = await Promise.all(active.map((b) => supabase.rpc("fin_book_people", { p_book: b.id })));
    active.forEach((b, i) => people.set(b.id, (res[i].data ?? []) as Person[]));
    const { data } = await supabase.from("workspaces").select("id, name").eq("owner_id", me.user?.id ?? "").eq("kind", "company").eq("archived", false);
    workspaces = (data ?? []) as { id: string; name: string }[];
  }
  const ownBiz = active.filter((b) => b.mine && b.kind === "business").length;

  return (
    <>
      <Link href="/keuangan" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-heading">
        <ChevronLeft className="h-4 w-4" /> Keuangan
      </Link>
      <PageHeader
        eyebrow="Keuangan · Bersama"
        title="Usaha & keuangan keluarga"
        desc="Punya lebih dari satu usaha? Buat buku untuk masing-masing. Kelola uang keluarga bersama pasangan, atau ajak staf keuangan mencatat transaksi usaha."
      />

      {books.length === 0 && <div className="card p-6 text-sm text-muted">Fitur ini aktif setelah pembaruan database (SQL 029) dijalankan.</div>}

      {invites.map((b) => (
        <section key={b.id} className="mb-4 rounded-2xl border border-gold bg-gold-soft/50 p-4">
          <p className="text-sm text-heading">
            {BOOK_EMOJI[b.kind]} <b>{b.owner_name ?? "Seseorang"}</b> mengajak Anda mengelola <b>{b.name}</b> sebagai <b>{ROLE_LABEL[b.role]}</b>.
          </p>
          <p className="mt-1 text-xs text-muted">{b.role === "manager" ? "Anda bisa melihat dan mencatat semua kantong di buku ini." : "Anda bisa mencatat transaksi di kantong yang diizinkan pemilik."} Keuangan Pribadi Anda tetap rahasia.</p>
          <form action={respondBook} className="mt-3 flex gap-2">
            <input type="hidden" name="book_id" value={b.id} />
            <button name="accept" value="1" className="btn-primary py-2">Terima</button>
            <button name="accept" value="0" className="btn-ghost py-2">Tolak</button>
          </form>
        </section>
      ))}

      {books.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          {active.map((b) => {
            const list = pockets.filter((p) => p.book_id === b.id);
            const ppl = people.get(b.id) ?? [];
            return (
              <section key={b.id} id={b.id} className="card scroll-mt-24 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted">{b.kind === "business" ? "Usaha" : "Keluarga"}{!b.mine && ` · milik ${b.owner_name ?? "orang lain"}`}</p>
                    <h2 className="truncate text-lg font-bold text-heading">
                      {BOOK_EMOJI[b.kind]} {b.name}
                    </h2>
                  </div>
                  <Link href={`/keuangan?b=${b.id}`} className="btn-ghost shrink-0 py-1.5 text-sm">
                    Buka
                  </Link>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {list.length} kantong · saldo {rupiah(list.reduce((n, p) => n + p.balance, 0))}
                </p>
                {b.workspace_id && (
                  <Link href={`/tim/${b.workspace_id}`} className="mt-2 inline-flex items-center gap-1 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-brand">
                    👥 Terhubung ke Ruang Kerja tim
                  </Link>
                )}

                <h3 className="mt-4 text-sm font-bold text-heading">Anggota</h3>
                <ul className="mt-2 divide-y divide-line">
                  {ppl.map((p) => (
                    <li key={p.user_id} className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-heading">
                            {p.full_name ?? "Anggota"} {p.user_id === me.user?.id && <span className="font-normal text-muted">(Anda)</span>}
                          </span>
                          <span className="block text-xs text-muted">
                            {p.username ? `@${p.username} · ` : ""}
                            {ROLE_LABEL[p.role]}
                            {p.status === "invited" && " · menunggu diterima"}
                            {p.role === "recorder" && (p.pocket_ids ? ` · ${p.pocket_ids.length} kantong` : " · semua kantong")}
                          </span>
                        </span>
                        {p.role !== "owner" && (b.mine || p.user_id === me.user?.id) && (
                          <form action={removeBookMember}>
                            <input type="hidden" name="book_id" value={b.id} />
                            <input type="hidden" name="user_id" value={p.user_id} />
                            <button className="rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:bg-paper hover:text-danger">
                              {p.user_id === me.user?.id ? "Keluar" : p.status === "invited" ? "Batalkan" : "Keluarkan"}
                            </button>
                          </form>
                        )}
                      </div>
                      {b.mine && p.role !== "owner" && <MemberAccess bookId={b.id} person={p} pockets={list} />}
                    </li>
                  ))}
                </ul>

                {b.mine &&
                  (b.owner_plus ? (
                    <InviteForm bookId={b.id} kind={b.kind} pockets={list} />
                  ) : (
                    <Link href="/paket" className="mt-3 block rounded-xl bg-gold-soft/60 p-3 text-sm text-heading">
                      Ajak pasangan atau staf keuangan mengelola buku ini dengan <b>EClub Plus</b>. Yang diajak boleh akun gratis. <span className="font-semibold text-brand">Lihat Plus ›</span>
                    </Link>
                  ))}
                {b.mine && <BookSettings book={b} workspaces={workspaces} />}
                {b.mine && !(b.kind === "business" && ownBiz <= 1) && (
                  <form action={archiveBook} className="mt-2 text-right">
                    <input type="hidden" name="id" value={b.id} />
                    <button className="text-xs font-semibold text-muted hover:text-danger">Arsipkan buku ini</button>
                  </form>
                )}
              </section>
            );
          })}
          <NewBookForm plus={plus} ownBiz={ownBiz} />
        </div>
      )}

      <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
        {[
          ["🔒", "Pribadi tetap rahasia", "Dompet Pribadi tidak pernah bisa dilihat siapa pun, termasuk pasangan dan tim."],
          ["👫", "Pengelola", "Cocok untuk pasangan atau partner usaha: melihat & mencatat semua kantong, bisa menambah kantong."],
          ["🧾", "Pencatat", "Cocok untuk staf keuangan/kasir: mencatat di kantong yang Anda izinkan. Setiap catatannya masuk ke lonceng Anda."],
        ].map(([e, t, d]) => (
          <div key={t} className="rounded-2xl border border-line bg-white p-4">
            <p className="text-xl">{e}</p>
            <p className="mt-1 font-semibold text-heading">{t}</p>
            <p className="text-xs text-muted">{d}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
        <ShieldCheck className="h-3.5 w-3.5" /> Hanya pemilik buku yang bisa mengundang, mengubah akses, dan mengarsipkan.
      </p>
    </>
  );
}
