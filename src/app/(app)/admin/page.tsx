import Link from "next/link";
import { CalendarCheck2, ClipboardList, Crown, Gem, Sparkles, UserPlus, Users } from "lucide-react";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin" };

type AiUsage = { today: number; month: number; tokens_in: number; tokens_out: number };
type Stats = { users: number; plus: number; new_7d: number; dreams: number; daily_done_7d: number; assessments: number };

export default async function AdminHome() {
  let stats: Stats | null = { users: 128, plus: 12, new_7d: 9, dreams: 214, daily_done_7d: 640, assessments: 37 };
  let error: string | null = null;
  let ai = null as AiUsage | null;
  if (!isDemoMode) {
    const supabase = await createClient();
    const [r, u] = await Promise.all([supabase.rpc("admin_stats"), supabase.rpc("admin_ai_usage")]);
    stats = (r.data as Stats) ?? null;
    error = r.error?.message ?? null;
    ai = (u.data as AiUsage | null) ?? null;
  }
  // Perkiraan biaya Claude Haiku 5.5: $0.10 per 1 juta token masuk, $0.50 per 1 juta token keluar.
  const aiCostUsd = ai ? (ai.tokens_in * 0.1 + ai.tokens_out * 0.5) / 1_000_000 : 0;
  if (!stats) return <p className="card p-6 text-sm text-danger">Gagal memuat ringkasan: {error}</p>;
  const tiles = [
    { icon: Users, label: "Total pengguna", value: stats.users },
    { icon: Crown, label: "Member Plus aktif", value: stats.plus },
    { icon: UserPlus, label: "Pengguna baru (7 hari)", value: stats.new_7d },
    { icon: Gem, label: "Mimpi dibuat", value: stats.dreams },
    { icon: CalendarCheck2, label: "Aksi harian selesai (7 hari)", value: stats.daily_done_7d },
    { icon: ClipboardList, label: "Tes diikuti", value: stats.assessments },
  ];
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
        {tiles.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-5">
            <Icon className="h-5 w-5 text-gold" />
            <p className="mt-3 text-2xl font-bold text-heading">{value.toLocaleString("id-ID")}</p>
            <p className="mt-0.5 text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>
      {ai && (
        <div className="card mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 p-5 text-sm">
          <p className="flex items-center gap-2 font-bold text-heading">
            <Sparkles className="h-4 w-4 text-gold" /> AI Companion
          </p>
          <p className="text-muted">
            Hari ini <b className="text-heading">{ai.today}</b> pesan
          </p>
          <p className="text-muted">
            30 hari <b className="text-heading">{ai.month}</b> pesan
          </p>
          <p className="text-muted">
            Perkiraan biaya 30 hari <b className="text-heading">${aiCostUsd.toFixed(2)}</b>
          </p>
        </div>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/pengguna" className="card p-5 hover:shadow-lift">
          <p className="font-bold text-heading">Kelola pengguna</p>
          <p className="mt-1 text-sm text-muted">Cari pengguna, berikan paket Plus, atur peran admin atau mentor.</p>
        </Link>
        <Link href="/admin/paket" className="card p-5 hover:shadow-lift">
          <p className="font-bold text-heading">Atur paket & fitur</p>
          <p className="mt-1 text-sm text-muted">Ubah batas fitur Gratis dan Plus, harga, dan kontak upgrade.</p>
        </Link>
      </div>
      <p className="mt-5 text-xs text-muted">Demi privasi, admin tidak bisa membaca isi mimpi, jawaban tes, atau catatan pribadi pengguna.</p>
    </>
  );
}
