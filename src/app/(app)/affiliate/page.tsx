import Link from "next/link";
import { headers } from "next/headers";
import { Crown, Gift, Hourglass, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { getAffiliate, PRODUCT_LABEL } from "@/lib/affiliate";
import { rupiah, tanggal } from "@/lib/format";
import { getAccount, getSettings, isAdmin } from "@/lib/plans";
import { ChangeCodeForm, LinkPicker, PayoutForm, ShareLink, type ShareOption } from "./client";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { listCourses } from "@/lib/lms";
import { listArticles } from "@/lib/articles";

export const metadata = { title: "Affiliate" };

const STATUS: Record<string, { label: string; cls: string }> = {
  requested: { label: "Diproses", cls: "bg-gold-soft text-heading" },
  paid: { label: "Ditransfer", cls: "bg-success/10 text-success" },
  rejected: { label: "Ditolak", cls: "bg-danger/10 text-danger" },
};

export default async function AffiliatePage() {
  const [acc, s] = await Promise.all([getAccount(), getSettings()]);
  const rate = Number(s.affiliate_rate) || 20;
  const months = Number(s.affiliate_months) || 12;
  const hold = Number(s.affiliate_hold_days) || 7;
  const disc = Number(s.coupon_discount) || 10;
  const eligible = acc.plan === "plus" || isAdmin(acc.role);
  const yearly = Number(s.plus_price_yearly) || 0;
  const aff = await getAffiliate();
  // Ganti kode sekali: hanya bila belum pernah diganti dan belum ada yang memakai kode lama.
  let canChange = false;
  if (eligible && aff && !isDemoMode && aff.referrals === 0 && aff.commissions.length === 0) {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("profiles").select("ref_code_changed").eq("id", u.user?.id ?? "").maybeSingle();
    canChange = !error && data?.ref_code_changed === false;
  }
  const [courses, articles] = eligible ? await Promise.all([listCourses(), listArticles().catch(() => [])]) : [[], []];
  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;

  const shareOptions: ShareOption[] = aff
    ? [
        { group: "Umum", label: "Beranda EClub (ajak coba gratis)", url: `${origin}/?ref=${aff.code}`, text: `Aku pakai EClub buat menata mimpi, keuangan, dan belajar bisnis step by step. Coba gratis ya. Pakai kode *${aff.code}* biar hemat hingga ${disc}% kalau upgrade:` },
        { group: "Umum", label: "Semua kelas", url: `${origin}/kelas?ref=${aff.code}`, text: `Kelas bisnis berjenjang dari EClub, bisa dilihat dulu isinya. Kode hemat hingga ${disc}%: *${aff.code}*` },
        { group: "Umum", label: "Event & webinar", url: `${origin}/acara?ref=${aff.code}`, text: `Ada event EClub nih, yuk ikut bareng. Kode hemat hingga ${disc}%: *${aff.code}*` },
        { group: "Umum", label: "Mentoring 1-on-1", url: `${origin}/mentoring-1on1?ref=${aff.code}`, text: `Lagi buntu soal usaha? Coba mentoring 1-on-1 di EClub. Kode hemat hingga ${disc}%: *${aff.code}*` },
        ...courses.map((c) => ({ group: "Kelas", label: c.title, url: `${origin}/kelas/${c.slug}?ref=${aff.code}`, text: `Kelas ini bagus banget: *${c.title}*. Lihat dulu isinya, pakai kode *${aff.code}* biar hemat hingga ${disc}%:` })),
        ...articles.slice(0, 15).map((a) => ({ group: "Artikel", label: a.title, url: `${origin}/artikel/${a.slug}?ref=${aff.code}`, text: `Baca deh artikel ini: *${a.title}*` })),
      ]
    : [];

  const how = [
    { icon: Gift, t: "Bagikan link Anda", d: "Ke teman, grup WhatsApp, atau media sosial." },
    { icon: Users, t: "Teman daftar & berlangganan", d: `Setiap pembelian mereka (Plus, course, laporan) selama ${months} bulan pertama.` },
    { icon: Wallet, t: `Anda dapat ${rate}%`, d: `Siap cair ${hold} hari setelah lunas, kelipatan Rp100.000.` },
  ];

  return (
    <>
      <PageHeader eyebrow="Program affiliate" title="Ajak teman, bertumbuh bersama" desc={`Dapatkan bagi hasil ${rate}% dari setiap pembelian teman yang bergabung lewat link Anda.`} />

      {!eligible ? (
        <section className="card overflow-hidden">
          <div className="bg-brand p-6 text-white lg:p-8">
            <Crown className="h-8 w-8 text-gold" />
            <h2 className="mt-3 text-xl font-bold">Khusus member EClub Plus</h2>
            <p className="mt-1 max-w-lg text-sm text-white/75">
              Member Plus mendapat link affiliate pribadi. Contoh: 1 teman ambil Plus tahunan {rupiah(yearly)}, Anda dapat {rupiah(Math.floor((yearly * rate) / 100))}. Ajak 5 teman, langganan Anda sudah terbayar kembali.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/beli/plus" className="btn-gold">
                Upgrade ke Plus & mulai dapat komisi
              </Link>
              <Link href="/syarat-affiliate" className="text-sm font-semibold text-white/80 underline-offset-2 hover:underline">
                Baca syarat program
              </Link>
            </div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-3">
            {how.map((x) => (
              <div key={x.t}>
                <x.icon className="h-5 w-5 text-brand" />
                <p className="mt-2 font-semibold text-heading">{x.t}</p>
                <p className="text-sm text-muted">{x.d}</p>
              </div>
            ))}
          </div>
        </section>
      ) : !aff ? (
        <div className="card p-6 text-sm text-muted">Fitur affiliate sedang disiapkan. Coba lagi sebentar lagi.</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
          <div className="min-w-0 space-y-5 lg:col-span-2">
            <section className="relative overflow-hidden rounded-2xl bg-brand p-6 text-white shadow-lift">
              <div className="pointer-events-none absolute -top-16 -right-12 h-48 w-48 rounded-full bg-gold/25 blur-3xl" />
              <p className="text-xs font-semibold text-gold">Link affiliate Anda</p>
              <p className="mt-1 mb-4 text-sm text-white/70">
                Kode: <b className="text-white">{aff.code}</b>
              </p>
              <ShareLink link={`${origin}/?ref=${aff.code}`} code={aff.code} discount={disc} />
            </section>
            <section className="card border-gold/50 p-5">
              <p className="text-xs font-semibold text-gold">🎟️ Kode kupon pribadi Anda</p>
              <p className="mt-1 text-2xl font-bold tracking-wider text-heading">{aff.code}</p>
              <p className="mt-1 text-sm text-muted">
                Teman hemat <b className="text-heading">{disc}%</b> untuk paket Plus saat memasukkan kode ini di halaman pembayaran, dan Anda tetap mendapat komisi {rate}%. Kupon aktif otomatis selama Anda member Plus. Cocok dibagikan lewat status WA atau live jualan.
              </p>
              {canChange && <ChangeCodeForm current={aff.code} />}
            </section>
            <section className="card p-5">
              <h3 className="font-bold text-heading">🔗 Link siap bagikan</h3>
              <p className="mt-0.5 mb-3 text-sm text-muted">Mau promosikan kelas, event, atau artikel tertentu? Pilih di sini. Semua link sudah berisi kode Anda, dan teman bisa melihat isinya dulu tanpa harus login.</p>
              <LinkPicker options={shareOptions} />
            </section>
            <section className="card p-5">
              <h3 className="font-bold text-heading">Cara kerjanya</h3>
              <ol className="mt-3 space-y-3">
                {how.map((x, i) => (
                  <li key={x.t} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold-soft text-xs font-bold text-brand">{i + 1}</span>
                    <span className="text-sm">
                      <b className="block text-heading">{x.t}</b>
                      <span className="text-muted">{x.d}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-muted">
                Komisi dihitung dari harga yang dibayar teman (tanpa kode unik), selama status Plus Anda aktif. Mengajak diri sendiri tidak dihitung.{" "}
                <Link href="/syarat-affiliate" className="font-semibold text-brand">Baca syarat lengkap ›</Link>
              </p>
            </section>
          </div>

          <div className="min-w-0 space-y-5 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { l: "Teman bergabung", v: String(aff.referrals) },
                { l: "Sudah membeli", v: String(aff.buyers) },
                { l: "Menunggu (masa tunggu)", v: rupiah(aff.pending) },
                { l: "Total dicairkan", v: rupiah(aff.paid) },
              ].map((x) => (
                <div key={x.l} className="card p-4">
                  <p className="text-[11px] text-muted">{x.l}</p>
                  <p className="mt-1 text-lg font-bold text-heading">{x.v}</p>
                </div>
              ))}
            </div>

            <section className="card p-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted">Siap dicairkan</p>
                  <p className="text-3xl font-bold text-success">{rupiah(aff.available)}</p>
                </div>
                {aff.requested > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-heading">
                    <Hourglass className="h-3.5 w-3.5" /> {rupiah(aff.requested)} diproses
                  </span>
                )}
              </div>
              <div className="mt-4">
                <PayoutForm available={aff.available} />
              </div>
            </section>

            <section className="card p-5">
              <h3 className="font-bold text-heading">Riwayat komisi</h3>
              {aff.commissions.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">Belum ada komisi. Bagikan link Anda ke 3 teman pertama hari ini. 🙌</p>
              ) : (
                <ul className="mt-2 divide-y divide-line">
                  {aff.commissions.map((c, i) => {
                    const ready = new Date(c.available_at) <= new Date();
                    return (
                      <li key={i} className="flex items-center gap-3 py-3 text-sm">
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-heading">
                            {c.buyer} · {PRODUCT_LABEL[c.product] ?? c.product}
                          </span>
                          <span className="block text-xs text-muted">
                            {tanggal(c.created_at.slice(0, 10))} · {c.status === "cancelled" ? "dibatalkan" : ready ? "siap cair" : `siap cair ${tanggal(c.available_at.slice(0, 10))}`}
                          </span>
                        </span>
                        <span className={`font-bold ${c.status === "cancelled" ? "text-muted line-through" : "text-success"}`}>+{rupiah(c.amount)}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {aff.payouts.length > 0 && (
              <section className="card p-5">
                <h3 className="font-bold text-heading">Riwayat pencairan</h3>
                <ul className="mt-2 divide-y divide-line">
                  {aff.payouts.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 py-3 text-sm">
                      <span className="flex-1">
                        <b className="text-heading">{rupiah(p.amount)}</b>
                        <span className="block text-xs text-muted">
                          {tanggal(p.created_at.slice(0, 10))}
                          {p.note ? ` · ${p.note}` : ""}
                        </span>
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS[p.status].cls}`}>{STATUS[p.status].label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}
    </>
  );
}
