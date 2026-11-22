import Link from "next/link";
import { Download, Search } from "lucide-react";
import { getAccount } from "@/lib/plans";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { UserRow, type AdminUser } from "./user-row";

export const metadata = { title: "Admin · Pengguna" };

const PER_PAGE = 50;
const now = Date.now();
const DEMO_USERS: AdminUser[] = [
  { id: "1", email: "sari@contoh.id", full_name: "Sari Wulandari", segment: "Freelancer", role: "member", plan: "plus", plan_expires_at: null, created_at: new Date(now - 40 * 864e5).toISOString(), last_sign_in_at: null, last_active: new Date(now - 2 * 3600e3).toISOString(), whatsapp: "6281234567890", regency: "34.71", dreams_count: 3 },
  { id: "2", email: "budi@contoh.id", full_name: "Budi Santoso", segment: "Entrepreneur", role: "mentor", plan: "free", plan_expires_at: null, created_at: new Date(now - 20 * 864e5).toISOString(), last_sign_in_at: null, last_active: new Date(now - 5 * 864e5).toISOString(), whatsapp: null, regency: null, dreams_count: 1 },
  { id: "3", email: "dewi@contoh.id", full_name: "Dewi Lestari", segment: "Karyawan", role: "member", plan: "free", plan_expires_at: null, created_at: new Date(now - 3 * 864e5).toISOString(), last_sign_in_at: null, last_active: null, whatsapp: null, regency: null, dreams_count: 0 },
];

const SORTS = [
  ["created:desc", "Terbaru daftar"],
  ["created:asc", "Terlama daftar"],
  ["active:desc", "Baru saja aktif"],
  ["active:asc", "Paling lama tidak aktif"],
  ["name:asc", "Nama A-Z"],
  ["name:desc", "Nama Z-A"],
  ["email:asc", "Email A-Z"],
  ["plan:desc", "Plus dulu"],
] as const;

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string; s?: string; p?: string }> }) {
  const [{ q = "", s = "created:desc", p = "1" }, account] = await Promise.all([searchParams, getAccount()]);
  const sortKey = SORTS.some(([v]) => v === s) ? s : "created:desc";
  const [sort, dir] = sortKey.split(":");
  const page = Math.max(1, Number(p) || 1);
  let users: AdminUser[] = DEMO_USERS;
  let total = DEMO_USERS.length;
  let error: string | null = null;
  let needSql = false;
  if (!isDemoMode) {
    const supabase = await createClient();
    const r = await supabase.rpc("admin_users", { search: q.trim(), sort, dir, lim: PER_PAGE, off: (page - 1) * PER_PAGE });
    if (r.error) {
      // SQL 018 belum dijalankan: pakai daftar lama.
      needSql = true;
      const old = await supabase.rpc("admin_list_users", { search: q.trim(), lim: 100, off: 0 });
      users = ((old.data ?? []) as AdminUser[]).map((u) => ({ ...u, last_active: u.last_sign_in_at }));
      total = users.length;
      error = old.error?.message ?? null;
    } else {
      users = (r.data ?? []) as AdminUser[];
      total = Number((r.data?.[0] as { total?: number })?.total ?? 0);
    }
  }
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const qs = (extra: Record<string, string>) => "?" + new URLSearchParams({ ...(q ? { q } : {}), s: sortKey, ...extra }).toString();

  return (
    <section className="card p-5 lg:p-6">
      {needSql && <p className="mb-4 rounded-xl bg-gold-soft/60 p-3 text-xs text-ink">Jalankan SQL 018 di Supabase untuk mengaktifkan data &ldquo;terakhir aktif&rdquo;, pengurutan, dan halaman.</p>}
      <form className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} className="input pl-10" placeholder="Cari nama, email, atau nomor WA…" />
        </div>
        <select name="s" defaultValue={sortKey} className="input sm:w-56">
          {SORTS.map(([v, l]) => (
            <option key={v} value={v}>Urutkan: {l}</option>
          ))}
        </select>
        <button className="btn-primary shrink-0">Terapkan</button>
        <a href={`/api/admin/users-export${qs({})}`} className="btn shrink-0 border border-line bg-white text-heading hover:bg-paper">
          <Download className="h-4 w-4" /> Excel
        </a>
      </form>
      <p className="mt-3 text-xs text-muted">{total} pengguna{q ? ` cocok dengan "${q}"` : ""}. Klik nama untuk mengubah paket, peran, atau menghapus akun.</p>
      {error && <p className="mt-4 text-sm text-danger">Gagal memuat pengguna: {error}</p>}
      <ul className="mt-2 divide-y divide-line">
        {users.map((u) => (
          <UserRow key={u.id} u={u} canSetRole={account.role === "super_admin"} />
        ))}
      </ul>
      {!error && users.length === 0 && <p className="py-8 text-center text-sm text-muted">Tidak ada pengguna ditemukan.</p>}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? <Link href={qs({ p: String(page - 1) })} className="font-semibold text-brand">‹ Sebelumnya</Link> : <span />}
          <span className="text-muted">Halaman {page} dari {pages}</span>
          {page < pages ? <Link href={qs({ p: String(page + 1) })} className="font-semibold text-brand">Berikutnya ›</Link> : <span />}
        </div>
      )}
    </section>
  );
}
