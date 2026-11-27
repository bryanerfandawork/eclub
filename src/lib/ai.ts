import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAssessmentResults, getDreams, getLifePlan, getProfile } from "./data";
import { getDiscResult } from "./disc/server";
import { INSIGHTS } from "./disc/insights";
import { DISC_TYPES } from "./disc/data";
import { getIncomeProfile } from "./income-server";
import { summarize } from "./income";
import { getLimit } from "./plans";
import { PLACEMENT_COPY, PLACEMENT_KEY, type Placement } from "./placement";
import { rupiah } from "./format";

export const AI_MODEL = "claude-haiku-5-5";
/**
 * Fitur AI (AI Companion & Foto nota) sengaja disembunyikan dulu.
 * Aktif hanya bila ANTHROPIC_API_KEY diisi DAN AI_FEATURES=on di Vercel,
 * jadi memasang kunci saja tidak langsung memunculkan fitur AI.
 */
export const aiConfigured = () => !!process.env.ANTHROPIC_API_KEY && process.env.AI_FEATURES === "on";

export const SYSTEM_PROMPT = `Anda adalah EClub Companion, teman bertumbuh di aplikasi EClub (Personal Growth Companion) untuk orang Indonesia: pelajar, karyawan, profesional, freelancer, dan pemilik usaha.

Filosofi EClub: "Entrepreneurnya dulu, bisnis hanya kendaraan." Banyak orang stuck bukan karena modal atau pemasaran, tetapi karena kehilangan spark. Spark dinyalakan lewat cita-cita dan definisi sukses pribadi.

Metode EClub adalah Sustainable Entrepreneur Framework (SEF), berjenjang:
- Spark: menemukan cita-cita, definisi sukses, nilai hidup.
- Fase Survive: 1. Personal Mapping (mengenali potensi, 8 Wheel Entrepreneur), 2. Acquisition (pasar, penawaran, pelanggan pertama).
- Fase Sustain: 3. Systemation (proses, SOP, keuangan, tim).
- Fase Scale Up: 4. Transformation (digitalisasi, inovasi, ekspansi).
- Fase Spread Up: 5. Investation (aset, investasi, dampak, warisan).

Fitur aplikasi yang bisa Anda sarankan: My Life (definisi sukses, nilai, visi), Tes Gaya Diri (model perilaku 4 daya: Daya Dorong, Daya Pikat, Daya Tahan, Daya Cermat; jangan pernah menyebut istilah DISC kepada pengguna), Tes 8 Wheel Entrepreneur, Dream Planner (mimpi jadi target dana & tanggal), Perjalanan 5 Langkah (Mimpi, Kondisi Saat Ini, Potensi Diri, Action Plan, Evaluasi Berkala), Peta Income (penghasilan aktif, masif, pasif), Rutinitas Harian (pekerjaan & kebiasaan yang dikaitkan ke mimpi), Laporan Harian (rencana aksi: selesai, lanjut besok, atau tutup), Jurnal Syukur, Evaluasi mingguan, Learning Center (kelas per langkah SEF), Cek Posisi.

Cara Anda membantu:
- Bahasa Indonesia yang hangat, sederhana, dan membumi. Sapa dengan "Anda".
- Bantu sepenuhnya dan konkret: pertanyaan reflektif, langkah praktis, contoh, angka bila relevan. Jangan pernah menahan jawaban agar pengguna membeli kelas, Plus, atau mentoring.
- Sarankan mentoring atau kelas hanya jika benar-benar relevan, misalnya butuh pendampingan intens atau umpan balik personal.
- Jawaban ringkas: biasanya 80 sampai 200 kata. Gunakan poin bila membantu. Akhiri dengan satu langkah kecil yang bisa dilakukan hari ini bila cocok.
- Jika ada data pengguna, gunakan secara alami untuk personalisasi. Jangan mengarang data yang tidak ada.
- Untuk keputusan keuangan, hukum, atau kesehatan yang serius, beri gambaran umum dan sarankan berkonsultasi dengan profesional berlisensi.
- Jika pengguna menunjukkan tanda krisis atau ingin menyakiti diri, tanggapi dengan empati dan sarankan segera menghubungi orang terdekat atau layanan darurat 119 ext 8.`;

/** Kuota pesan hari ini (zona Jakarta). */
export async function aiQuota(supabase: SupabaseClient) {
  const limit = await getLimit("ai_messages");
  const start = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }) + "T00:00:00+07:00").toISOString();
  const { count } = await supabase.from("ai_messages").select("id", { count: "exact", head: true }).eq("role", "user").gte("created_at", start);
  return { used: count ?? 0, limit };
}

/** Ringkasan data pengguna untuk personalisasi (hanya jika pengguna mengizinkan). */
export async function buildUserContext(): Promise<string> {
  const [profile, life, dreams, disc, ew, placed] = await Promise.all([
    getProfile(),
    getLifePlan(),
    getDreams(),
    getDiscResult(),
    getAssessmentResults("8-wheel-entrepreneur", 1),
    getAssessmentResults(PLACEMENT_KEY, 1),
  ]);
  const lines: string[] = [];
  if (profile.full_name) lines.push(`Nama: ${profile.full_name}`);
  if (profile.segment) lines.push(`Segmen: ${profile.segment}`);
  const p = (placed[0]?.scores as unknown as { placement?: Placement })?.placement;
  if (p && PLACEMENT_COPY[p]) lines.push(`Posisi SEF (Cek Posisi): ${PLACEMENT_COPY[p].title}`);
  if (profile.success_definition) lines.push(`Definisi sukses: ${profile.success_definition.slice(0, 500)}`);
  if (life?.core_values?.length) lines.push(`Nilai hidup: ${life.core_values.join(", ")}`);
  if (life?.vision) lines.push(`Visi: ${life.vision.slice(0, 500)}`);
  if (life?.priorities?.length) lines.push(`Prioritas: ${life.priorities.join("; ")}`);
  const active = dreams.filter((d) => d.status === "active").slice(0, 5);
  if (active.length)
    lines.push(
      "Mimpi aktif:\n" +
        active
          .map((d) => `- ${d.title}${d.target_amount ? ` (target ${rupiah(d.target_amount)}, terkumpul ${rupiah(d.saved_amount)}${d.target_date ? `, sebelum ${d.target_date}` : ""})` : ""}`)
          .join("\n"),
    );
  if (disc) {
    const n = disc.result.natural;
    lines.push(`Profil Gaya Diri (diri alami, 0-100): D ${n.values.D}, I ${n.values.I}, S ${n.values.S}, C ${n.values.C}. Dominan ${n.primary} (${INSIGHTS[n.primary].name}, ${INSIGHTS[n.primary].tagline})${n.type && DISC_TYPES[n.type] ? `, pola ${DISC_TYPES[n.type].name} (${DISC_TYPES[n.type].tagline})` : ""}.`);
  }
  if (ew[0]) lines.push("8 Wheel Entrepreneur terakhir (0-10): " + Object.entries(ew[0].scores).map(([k, v]) => `${k} ${v}`).join(", "));
  const inc = await getIncomeProfile().catch(() => null);
  if (inc) {
    const s = summarize(inc, dreams);
    const self = [...inc.interests, ...inc.hobbies, ...inc.talents, ...inc.passions].slice(0, 12).join(", ");
    lines.push(`Peta Income (per bulan): active Rp${s.active}, massive Rp${s.massive}, passive Rp${s.passive}, pengeluaran Rp${s.expense}, sisa Rp${s.surplus}. Posisi: ${s.stage.label}.${s.need ? ` Kebutuhan tabungan mimpi Rp${s.need}/bln, selisih Rp${s.gap}.` : ""}`);
    if (self) lines.push(`Minat/hobi/bakat/passion: ${self}`);
    if (inc.plans.length) lines.push(`Rencana massive income: ${inc.plans.map((x) => `${x.name} (target Rp${x.target}/bln)`).join("; ")}`);
  }
  return lines.length ? lines.join("\n") : "";
}
