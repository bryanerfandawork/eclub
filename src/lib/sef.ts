/** Sustainable Entrepreneur Framework (SEF): 4 fase, 5 langkah belajar, didahului Spark. */
export type SefStepKey = "personal_mapping" | "acquisition" | "systemation" | "transformation" | "investation";

export type Tool = { label: string; href?: string };

export const SPARK = {
  name: "Spark",
  sub: "Menyalakan kembali gairah",
  desc: "Banyak orang stuck bukan karena modal atau pemasaran, tetapi karena kehilangan spark. Semuanya dimulai dari menemukan kembali cita-cita dan alasan Anda bangun setiap pagi.",
  tools: [
    { label: "Definisi Sukses & Visi", href: "/my-life" },
    { label: "Tes Gaya Diri", href: "/gaya-diri" },
    { label: "Dream Planner", href: "/goals" },
  ] as Tool[],
};

export const SEF_PHASES = [
  { key: "survive", name: "Survive", income: "Active income", desc: "Mengenali diri dan peluang, lalu membangun penghasilan aktif pertama: dari kerja, uang saku, klien, atau jualan." },
  { key: "sustain", name: "Sustain", income: "Active → Massive income", desc: "Merapikan keuangan dan sistem, menabung untuk mimpi, lalu mulai menambah sumber penghasilan." },
  { key: "scale", name: "Scale Up", income: "Massive income", desc: "Melipatgandakan penghasilan lewat side hustle atau usaha, digitalisasi, dan inovasi." },
  { key: "spread", name: "Spread Up", income: "Passive income", desc: "Uang dingin bekerja untuk Anda: aset, investasi, dampak sosial, dan warisan." },
] as const;

export const SEF_STEPS: { key: SefStepKey; phase: (typeof SEF_PHASES)[number]["key"]; no: number; name: string; desc: string; tools: Tool[] }[] = [
  {
    key: "personal_mapping",
    phase: "survive",
    no: 1,
    name: "Personal Mapping",
    desc: "Memetakan potensi, kekuatan, dan kompetensi entrepreneur Anda.",
    tools: [{ label: "Tes 8 Wheel Entrepreneur", href: "/assessment/8-wheel-entrepreneur" }],
  },
  {
    key: "acquisition",
    phase: "survive",
    no: 2,
    name: "Acquisition",
    desc: "Memahami pasar, menawarkan nilai, dan mendapatkan pelanggan pertama.",
    tools: [{ label: "Revenue Streams" }],
  },
  {
    key: "systemation",
    phase: "sustain",
    no: 3,
    name: "Systemation",
    desc: "Menyusun proses, SOP, keuangan, dan kebiasaan kerja yang konsisten.",
    tools: [{ label: "Daily Action", href: "/today" }],
  },
  {
    key: "transformation",
    phase: "scale",
    no: 4,
    name: "Transformation",
    desc: "Digitalisasi, inovasi produk, dan ekspansi kapasitas usaha.",
    tools: [],
  },
  {
    key: "investation",
    phase: "spread",
    no: 5,
    name: "Investation",
    desc: "Mengelola aset dan investasi, serta memperluas dampak.",
    tools: [{ label: "My Progress", href: "/progress" }],
  },
];

export const SEF_STEP_LABEL: Record<string, string> = Object.fromEntries(SEF_STEPS.map((s) => [s.key, `${s.no}. ${s.name}`]));
export const phaseName = (key: string) => SEF_PHASES.find((p) => p.key === key)?.name ?? "";
