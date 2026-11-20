import { Search } from "lucide-react";
import { getAccount } from "@/lib/plans";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { UserRow, type AdminUser } from "./user-row";

export const metadata = { title: "Admin · Pengguna" };

const DEMO_USERS: AdminUser[] = [
  { id: "1", email: "sari@contoh.id", full_name: "Sari Wulandari", segment: "Freelancer", role: "member", plan: "plus", plan_expires_at: null, created_at: new Date().toISOString(), last_sign_in_at: new Date().toISOString(), dreams_count: 3 },
  { id: "2", email: "budi@contoh.id", full_name: "Budi Santoso", segment: "Entrepreneur", role: "mentor", plan: "free", plan_expires_at: null, created_at: new Date().toISOString(), last_sign_in_at: null, dreams_count: 1 },
  { id: "3", email: "dewi@contoh.id", full_name: "Dewi Lestari", segment: "Karyawan", role: "member", plan: "free", plan_expires_at: null, created_at: new Date().toISOString(), last_sign_in_at: null, dreams_count: 0 },
];

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [{ q = "" }, account] = await Promise.all([searchParams, getAccount()]);
  let users: AdminUser[] = DEMO_USERS;
  let error: string | null = null;
  if (!isDemoMode) {
    const supabase = await createClient();
    const r = await supabase.rpc("admin_list_users", { search: q.trim(), lim: 100, off: 0 });
    users = (r.data as AdminUser[]) ?? [];
    error = r.error?.message ?? null;
  }
  return (
    <section className="card p-5 lg:p-6">
      <form className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
        <input name="q" defaultValue={q} className="input pl-10" placeholder="Cari nama atau email…" />
      </form>
      {error && <p className="mt-4 text-sm text-danger">Gagal memuat pengguna: {error}</p>}
      <ul className="mt-2 divide-y divide-line">
        {users.map((u) => (
          <UserRow key={u.id} u={u} canSetRole={account.role === "super_admin"} />
        ))}
      </ul>
      {!error && users.length === 0 && <p className="py-8 text-center text-sm text-muted">Tidak ada pengguna ditemukan.</p>}
    </section>
  );
}
