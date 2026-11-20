import { SEF_STEPS, type SefStepKey } from "./sef";

/** Cek Posisi EClub: diagnosis singkat untuk member baru. Draf EClub, bisa disesuaikan. */
export type Placement = "spark" | SefStepKey;
export type PQuestion =
  | { id: string; type: "scale"; text: string; group: "spark" | SefStepKey }
  | { id: string; type: "choice"; text: string; options: { label: string; value: Placement }[] };

export const PLACEMENT_KEY = "cek-posisi";

export const PLACEMENT_QUESTIONS: PQuestion[] = [
  { id: "s1", type: "scale", group: "spark", text: "Saya punya cita-cita yang jelas dan membuat saya bersemangat bangun setiap pagi." },
  { id: "s2", type: "scale", group: "spark", text: "Saya tahu apa arti sukses bagi diri saya sendiri, bukan kata orang lain." },
  { id: "s3", type: "scale", group: "spark", text: "Akhir-akhir ini saya menjalani hari dengan gairah, bukan sekadar rutinitas." },
  {
    id: "situasi",
    type: "choice",
    text: "Mana yang paling menggambarkan kondisi Anda saat ini?",
    options: [
      { label: "Belum punya usaha atau penghasilan sendiri, masih mencari arah", value: "personal_mapping" },
      { label: "Sudah mulai jualan atau usaha, tapi pemasukan belum stabil", value: "acquisition" },
      { label: "Pemasukan sudah stabil, tapi semua masih saya kerjakan sendiri", value: "systemation" },
      { label: "Sudah punya sistem dan tim, ingin usaha tumbuh lebih besar", value: "transformation" },
      { label: "Usaha sudah mapan, ingin membangun aset, investasi, dan dampak", value: "investation" },
    ],
  },
  {
    id: "tantangan",
    type: "choice",
    text: "Apa tantangan terbesar Anda sekarang?",
    options: [
      { label: "Bingung arah dan belum tahu potensi diri", value: "personal_mapping" },
      { label: "Susah mendapatkan pelanggan, jualan belum laris", value: "acquisition" },
      { label: "Operasional berantakan, keuangan bercampur, capek sendiri", value: "systemation" },
      { label: "Sulit berkembang, belum digital, kurang inovasi", value: "transformation" },
      { label: "Ingin mengelola aset, investasi, dan warisan", value: "investation" },
    ],
  },
  { id: "p1", type: "scale", group: "personal_mapping", text: "Saya tahu kekuatan dan kelemahan saya sebagai entrepreneur." },
  { id: "a1", type: "scale", group: "acquisition", text: "Pelanggan atau pemasukan datang secara konsisten setiap bulan." },
  { id: "y1", type: "scale", group: "systemation", text: "Keuangan usaha dan pribadi sudah terpisah, dan pekerjaan rutin punya SOP." },
  { id: "t1", type: "scale", group: "transformation", text: "Usaha saya bisa berjalan tanpa saya setiap hari dan sudah memanfaatkan teknologi." },
  { id: "i1", type: "scale", group: "investation", text: "Saya punya aset atau investasi yang menghasilkan di luar usaha utama." },
];

export const SCALE = ["Sangat tidak sesuai", "Tidak sesuai", "Netral", "Sesuai", "Sangat sesuai"];

const ORDER: SefStepKey[] = SEF_STEPS.map((s) => s.key);
const CHECK: Record<SefStepKey, string> = { personal_mapping: "p1", acquisition: "a1", systemation: "y1", transformation: "t1", investation: "i1" };

/** Hitung posisi: spark rendah → Spark. Selain itu, jenjang paling awal di antara kondisi, tantangan, dan langkah pertama yang belum kuat. */
export function computePlacement(answers: Record<string, string | number>): { placement: Placement; spark: number } {
  const spark = Math.round((["s1", "s2", "s3"].reduce((s, k) => s + Number(answers[k] || 0), 0) / 3) * 10) / 10;
  if (spark < 3.5) return { placement: "spark", spark };
  const idx = (v: unknown) => Math.max(0, ORDER.indexOf(v as SefStepKey));
  const weak = ORDER.findIndex((k) => Number(answers[CHECK[k]] || 0) <= 3);
  const candidates = [idx(answers.situasi), idx(answers.tantangan), weak < 0 ? ORDER.length - 1 : weak];
  return { placement: ORDER[Math.min(...candidates)], spark };
}

export function validAnswers(raw: Record<string, unknown>): Record<string, string | number> | null {
  const out: Record<string, string | number> = {};
  for (const q of PLACEMENT_QUESTIONS) {
    const v = raw[q.id];
    if (q.type === "scale") {
      const n = Math.round(Number(v));
      if (!(n >= 1 && n <= 5)) return null;
      out[q.id] = n;
    } else {
      if (!q.options.some((o) => o.value === v)) return null;
      out[q.id] = String(v);
    }
  }
  return out;
}

export const PLACEMENT_COPY: Record<Placement, { title: string; why: string; next: string }> = {
  spark: {
    title: "Spark: menyalakan kembali cita-cita",
    why: "Sebelum bicara strategi, yang Anda butuhkan adalah bahan bakar: cita-cita yang jelas dan definisi sukses versi Anda sendiri.",
    next: "Mulai dengan menulis definisi sukses di My Life, buat mimpi pertama di Dream Planner, lalu ikuti kelas Personal Mapping.",
  },
  personal_mapping: {
    title: "Fase Survive · Personal Mapping",
    why: "Spark Anda sudah menyala. Langkah berikutnya adalah mengenali potensi, kekuatan, dan kendaraan yang paling cocok untuk Anda.",
    next: "Ikuti tes 8 Wheel Entrepreneur dan kelas Personal Mapping.",
  },
  acquisition: {
    title: "Fase Survive · Acquisition",
    why: "Anda sudah punya arah. Fokus Anda sekarang adalah menawarkan nilai yang tepat dan mendapatkan pelanggan secara konsisten.",
    next: "Ikuti kelas Acquisition atau diskusikan strategi jualan bersama mentor.",
  },
  systemation: {
    title: "Fase Sustain · Systemation",
    why: "Pemasukan sudah ada. Agar tidak capek sendiri, saatnya membangun proses, SOP, keuangan yang rapi, dan tim.",
    next: "Ikuti kelas Systemation dan jaga konsistensi lewat Daily Action.",
  },
  transformation: {
    title: "Fase Scale Up · Transformation",
    why: "Fondasi Anda sudah kuat. Sekarang waktunya digitalisasi, inovasi, dan memperbesar kapasitas.",
    next: "Ikuti kelas Transformation atau mentoring untuk merancang ekspansi.",
  },
  investation: {
    title: "Fase Spread Up · Investation",
    why: "Anda sudah di tahap mapan. Fokus berikutnya adalah aset, investasi, dampak sosial, dan warisan.",
    next: "Ikuti kelas Investation dan mentoring untuk perencanaan aset jangka panjang.",
  },
};
