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
      { label: "Masih mencari arah: pelajar, baru lulus, atau belum punya penghasilan sendiri", value: "personal_mapping" },
      { label: "Sudah punya penghasilan (gaji, uang saku, atau jualan), tapi belum stabil atau masih pas-pasan", value: "acquisition" },
      { label: "Penghasilan aktif sudah stabil, ingin menambah sumber penghasilan lain (side hustle / usaha)", value: "systemation" },
      { label: "Sudah punya beberapa sumber penghasilan atau usaha yang berjalan, ingin tumbuh lebih besar", value: "transformation" },
      { label: "Penghasilan sudah mapan, ingin membangun aset, investasi, dan penghasilan pasif", value: "investation" },
    ],
  },
  {
    id: "tantangan",
    type: "choice",
    text: "Apa tantangan terbesar Anda sekarang?",
    options: [
      { label: "Bingung arah dan belum tahu potensi diri", value: "personal_mapping" },
      { label: "Penghasilan masih kurang: susah dapat kerja, klien, atau pelanggan", value: "acquisition" },
      { label: "Waktu dan keuangan berantakan, uang pribadi dan usaha bercampur, capek sendiri", value: "systemation" },
      { label: "Penghasilan mentok, sulit naik level, belum memanfaatkan digital", value: "transformation" },
      { label: "Ingin mengelola aset, investasi, dan warisan", value: "investation" },
    ],
  },
  { id: "p1", type: "scale", group: "personal_mapping", text: "Saya tahu kekuatan, minat, dan bakat saya, serta cara memakainya untuk menghasilkan." },
  { id: "a1", type: "scale", group: "acquisition", text: "Penghasilan aktif saya (gaji, klien, atau pelanggan) datang secara konsisten setiap bulan." },
  { id: "y1", type: "scale", group: "systemation", text: "Keuangan saya tercatat rapi dan ada sisa untuk ditabung setiap bulan." },
  { id: "t1", type: "scale", group: "transformation", text: "Saya punya sumber penghasilan tambahan (massive income) di luar penghasilan utama." },
  { id: "i1", type: "scale", group: "investation", text: "Saya punya aset atau investasi yang menghasilkan tanpa harus saya kerjakan setiap hari (passive income)." },
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
    title: "Fase Survive · Personal Mapping (membangun active income)",
    why: "Spark Anda sudah menyala. Langkah berikutnya adalah mengenali potensi, kekuatan, dan kendaraan yang paling cocok untuk Anda.",
    next: "Isi Potensi Diri (minat, bakat, passion, SWOT), ikuti Tes Gaya Diri, lalu kelas Personal Mapping.",
  },
  acquisition: {
    title: "Fase Survive · Acquisition (menguatkan active income)",
    why: "Anda sudah punya arah. Fokus Anda sekarang adalah membuat penghasilan aktif stabil: menawarkan nilai yang tepat kepada atasan, klien, atau pelanggan secara konsisten.",
    next: "Ikuti kelas Acquisition atau diskusikan strategi jualan bersama mentor.",
  },
  systemation: {
    title: "Fase Sustain · Systemation (dari active ke massive income)",
    why: "Penghasilan aktif sudah ada. Saatnya merapikan keuangan, menyisihkan tabungan untuk mimpi, dan mulai membangun massive income (side hustle atau usaha) yang tidak bergantung pada satu sumber.",
    next: "Isi Peta Income untuk melihat selisih menuju mimpi, ikuti kelas Systemation, dan jaga konsistensi lewat Daily Action.",
  },
  transformation: {
    title: "Fase Scale Up · Transformation (melipatgandakan massive income)",
    why: "Fondasi Anda sudah kuat. Sekarang waktunya melipatgandakan massive income lewat digitalisasi, inovasi, dan memperbesar kapasitas.",
    next: "Ikuti kelas Transformation atau mentoring untuk merancang ekspansi.",
  },
  investation: {
    title: "Fase Spread Up · Investation (membangun passive income)",
    why: "Anda sudah di tahap mapan. Fokus berikutnya adalah passive income dari aset dan investasi, dampak sosial, dan warisan.",
    next: "Ikuti kelas Investation dan mentoring untuk perencanaan aset jangka panjang.",
  },
};
