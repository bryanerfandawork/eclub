import type { DailyAction, Dream, DreamAction, Profile, WheelAssessment } from "./types";

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

export const demoDaily: DailyAction[] = [
  { id: "d1", title: "Olahraga pagi 20 menit", action_date: dayIso(0), done: true, dream_id: null, created_at: "" },
  { id: "d2", title: "Hubungi 3 calon pemasok", action_date: dayIso(0), done: false, dream_id: "demo-1", created_at: "" },
  { id: "d3", title: "Baca 10 halaman buku", action_date: dayIso(0), done: false, dream_id: null, created_at: "" },
  ...[-1, -2, -3, -5, -6].map((o, i) => ({ id: `p${i}`, title: "Catat pengeluaran harian", action_date: dayIso(o), done: true, dream_id: null, created_at: "" })),
  { id: "p9", title: "Review target mingguan", action_date: dayIso(-4), done: false, dream_id: null, created_at: "" },
];
