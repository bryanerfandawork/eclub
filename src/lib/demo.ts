import type { DailyAction, Dream, DreamAction, HabitItem, LifePlan, Profile, WheelAssessment, Work } from "./types";

export const demoProfile: Profile = {
  id: "demo",
  full_name: "Sahabat EClub",
  segment: "Entrepreneur",
  success_definition: "Hidup bermakna, keluarga sejahtera, dan usaha yang memberi manfaat bagi banyak orang.",
};

const in18 = new Date();
in18.setMonth(in18.getMonth() + 18);
const in36 = new Date();
in36.setMonth(in36.getMonth() + 36);
const iso = (d: Date) => d.toISOString().slice(0, 10);

export const demoDreams: Dream[] = [
  {
    id: "demo-1",
    title: "Membuka cabang kedua kedai kopi",
    category: "Bisnis",
    why: "Membuka lapangan kerja untuk anak muda di sekitar rumah.",
    target_amount: 150_000_000,
    saved_amount: 42_000_000,
    target_date: iso(in18),
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    title: "Umrah bersama orang tua",
    category: "Keluarga",
    why: "Membahagiakan orang tua selagi mereka sehat.",
    target_amount: 90_000_000,
    saved_amount: 18_500_000,
    target_date: iso(in36),
    status: "active",
    created_at: new Date().toISOString(),
  },
];

export const demoActions: DreamAction[] = [
  { id: "a1", dream_id: "demo-1", title: "Survei 3 lokasi calon cabang", done: true, created_at: "" },
  { id: "a2", dream_id: "demo-1", title: "Susun proyeksi arus kas 12 bulan", done: false, created_at: "" },
  { id: "a3", dream_id: "demo-1", title: "Sisihkan Rp6 juta bulan ini", done: false, created_at: "" },
  { id: "a4", dream_id: "demo-2", title: "Buka tabungan khusus umrah", done: true, created_at: "" },
];

const dayIso = (offset: number) => new Date(Date.now() + offset * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

export const demoWheel: WheelAssessment[] = [
  {
    id: "w2",
    scores: { karier: 7, keuangan: 5, kesehatan: 6, keluarga: 8, relasi: 6, diri: 7, spiritual: 7, rekreasi: 4 },
    note: "Keuangan dan waktu istirahat perlu jadi fokus bulan ini.",
    created_at: new Date().toISOString(),
  },
  {
    id: "w1",
    scores: { karier: 6, keuangan: 4, kesehatan: 5, keluarga: 7, relasi: 6, diri: 5, spiritual: 6, rekreasi: 4 },
    note: null,
    created_at: new Date(Date.now() - 30 * 86_400_000).toISOString(),
  },
];

export const demoWorks: Work[] = [
  { id: "w1", name: "Usaha kedai kopi", dream_id: "demo-1" },
  { id: "w2", name: "Latihan & kesehatan", dream_id: null },
];
export const demoHabits: HabitItem[] = [
  { id: "h1", name: "Ibadah tepat waktu", emoji: "🙏", dream_id: null },
  { id: "h2", name: "Catat keuangan", emoji: "💰", dream_id: "demo-2" },
  { id: "h3", name: "Follow-up 5 pelanggan", emoji: "📞", dream_id: "demo-1" },
];

const da = (id: string, title: string, o: number, done: boolean, work_id: string | null, dream_id: string | null, origin = o, followups = 0): DailyAction => ({
  id, title, action_date: dayIso(o), done, dream_id, created_at: "", work_id, status: done ? "done" : "open", origin_date: dayIso(origin), followups,
});
export const demoDaily: DailyAction[] = [
  da("d1", "Olahraga pagi 20 menit", 0, true, "w2", null),
  da("d2", "Hubungi 3 calon pemasok", 0, false, "w1", "demo-1", -3, 3),
  da("d3", "Foto menu kopi baru untuk Instagram", 0, false, "w1", "demo-1", -1, 1),
  ...[-1, -2, -3, -5, -6].map((o, i) => da(`p${i}`, "Rekap penjualan harian", o, true, "w1", "demo-1")),
  da("p9", "Survei harga kemasan", -2, false, "w1", "demo-1"),
];

export const demoLifePlan: LifePlan = {
  core_values: ["Iman", "Keluarga", "Kebermanfaatan", "Integritas", "Pertumbuhan"],
  vision:
    "Sepuluh tahun lagi saya memimpin usaha kuliner sehat dengan lima cabang yang memberdayakan anak muda di daerah saya, punya waktu berkualitas bersama keluarga setiap pekan, dan bebas finansial.",
  priorities: ["keluarga", "karier", "keuangan"],
  updated_at: new Date().toISOString(),
};
