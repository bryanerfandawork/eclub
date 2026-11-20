import type { Dream, DreamAction, Profile } from "./types";

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
