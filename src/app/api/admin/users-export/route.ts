import ExcelJS from "exceljs";
import { getAccount, isAdmin } from "@/lib/plans";
import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { provinceName, regencyName } from "@/lib/regions";

export const runtime = "nodejs";
export const maxDuration = 60;

type U = { email: string; full_name: string | null; segment: string | null; role: string; plan: string; plan_expires_at: string | null; created_at: string; last_active: string | null; whatsapp: string | null; province: string | null; regency: string | null; birth_date: string | null; dreams_count: number };

/** Unduh daftar pengguna (mengikuti pencarian & urutan di halaman) sebagai file Excel. */
export async function GET(request: Request) {
  if (isDemoMode) return new Response("Mode demo", { status: 400 });
  if (!isAdmin((await getAccount()).role)) return new Response("Khusus admin", { status: 403 });
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const [sort = "created", dir = "desc"] = (url.searchParams.get("s") ?? "created:desc").split(":");
  const supabase = await createClient();
  const rows: U[] = [];
  for (let off = 0; ; off += 5000) {
    const { data, error } = await supabase.rpc("admin_users", { search: q.trim(), sort, dir, lim: 5000, off });
    if (error) return new Response("Jalankan SQL 018 dulu di Supabase.", { status: 500 });
    rows.push(...((data ?? []) as U[]));
    if (!data || data.length < 5000) break;
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "EClub";
  const ws = wb.addWorksheet("Pengguna", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = [
    { header: "Nama", key: "name", width: 26 },
    { header: "Email", key: "email", width: 30 },
    { header: "WhatsApp", key: "wa", width: 16 },
    { header: "Paket", key: "plan", width: 9 },
    { header: "Plus sampai", key: "until", width: 13, style: { numFmt: "dd/mm/yyyy" } },
    { header: "Peran", key: "role", width: 12 },
    { header: "Tanggal lahir", key: "birth", width: 13, style: { numFmt: "dd/mm/yyyy" } },
    { header: "Provinsi", key: "prov", width: 22 },
    { header: "Kota/Kab.", key: "reg", width: 24 },
    { header: "Daftar", key: "created", width: 17, style: { numFmt: "dd/mm/yyyy hh:mm" } },
    { header: "Terakhir aktif", key: "active", width: 17, style: { numFmt: "dd/mm/yyyy hh:mm" } },
    { header: "Hari tidak aktif", key: "idle", width: 14 },
    { header: "Jumlah impian", key: "dreams", width: 13 },
    { header: "Segmen", key: "segment", width: 16 },
  ];
  // Waktu ditulis dalam WIB (UTC+7) agar sesuai jam Indonesia.
  const wib = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + 7 * 3600e3) : null);
  const now = Date.now();
  for (const u of rows) {
    const plus = u.plan === "plus" && (!u.plan_expires_at || new Date(u.plan_expires_at).getTime() > now);
    ws.addRow({
      name: u.full_name ?? "",
      email: u.email,
      wa: u.whatsapp ?? "",
      plan: plus ? "Plus" : "Gratis",
      until: plus && u.plan_expires_at ? wib(u.plan_expires_at) : null,
      role: u.role,
      birth: u.birth_date ? new Date(u.birth_date + "T00:00:00Z") : null,
      prov: provinceName(u.province) ?? "",
      reg: regencyName(u.regency) ?? "",
      created: wib(u.created_at),
      active: wib(u.last_active),
      idle: u.last_active ? Math.floor((now - new Date(u.last_active).getTime()) / 864e5) : null,
      dreams: Number(u.dreams_count) || 0,
      segment: u.segment ?? "",
    });
  }
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF8B2220" } };
  ws.autoFilter = { from: "A1", to: "N1" };

  const buf = await wb.xlsx.writeBuffer();
  const date = new Date(now + 7 * 3600e3).toISOString().slice(0, 10);
  return new Response(buf as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="pengguna-eclub-${date}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
