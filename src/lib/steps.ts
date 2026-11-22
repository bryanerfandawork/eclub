/**
 * Perjalanan 5 Langkah EClub (urutan ala life plan consultant):
 * 1 Mimpi (arah) -> 2 Kondisi Saat Ini (titik awal) -> 3 Potensi Diri (bekal) -> 4 Action Plan (jembatan) -> 5 Evaluasi Berkala (kompas).
 * Langkah 5 berulang: setiap minggu/bulan kembali ke langkah 2-4 dengan data baru.
 */
export type StepItem = { key: string; label: string; href: string; optional?: boolean };
export type Step = { no: number; key: string; title: string; q: string; why: string; items: StepItem[] };

export const STEPS: Step[] = [
  {
    no: 1,
    key: "mimpi",
    title: "Mimpi",
    q: "Apa yang ingin Anda capai?",
    why: "Mimpi memberi arah dan bahan bakar. Tanpa tujuan, semua langkah terasa berat.",
    items: [
      { key: "dream", label: "Tulis mimpi-mimpi Anda", href: "/goals" },
      { key: "dream_num", label: "Beri angka & tanggal pada mimpi", href: "/goals" },
      { key: "life", label: "Definisi sukses & nilai hidup", href: "/my-life" },
    ],
  },
  {
    no: 2,
    key: "kondisi",
    title: "Kondisi Saat Ini",
    q: "Di mana posisi Anda sekarang?",
    why: "Jarak ke mimpi hanya bisa dihitung kalau titik awalnya jujur: kesibukan, penghasilan, dan pengeluaran.",
    items: [
      { key: "placement", label: "Cek Posisi di peta SEF (3 menit)", href: "/posisi" },
      { key: "income", label: "Kesibukan, penghasilan & pengeluaran", href: "/income#kondisi" },
      { key: "finance", label: "Rapikan uang pribadi & usaha", href: "/keuangan" },
    ],
  },
  {
    no: 3,
    key: "potensi",
    title: "Potensi Diri",
    q: "Apa bekal yang Anda punya?",
    why: "Rencana yang cocok dengan gaya, bakat, dan aset Anda jauh lebih mudah dijalankan.",
    items: [
      { key: "gaya", label: "Tes Gaya Diri", href: "/gaya-diri" },
      { key: "minat", label: "Minat, bakat, passion & hobi", href: "/potensi#minat" },
      { key: "swot", label: "Personal SWOT", href: "/potensi#swot" },
      { key: "aset", label: "Peta Aset (finansial, sosial, diri, fisik)", href: "/potensi#aset" },
      { key: "wheel", label: "8 Wheel Entrepreneur", href: "/assessment/8-wheel-entrepreneur", optional: true },
    ],
  },
  {
    no: 4,
    key: "aksi",
    title: "Action Plan",
    q: "Apa langkah nyata berikutnya?",
    why: "Mimpi dipecah menjadi rencana income, target harian, dan kebiasaan kecil yang dikerjakan setiap hari.",
    items: [
      { key: "plan", label: "Pilih rencana income berikutnya", href: "/income#rencana" },
      { key: "target", label: "Pecah mimpi jadi target harian", href: "/target", optional: true },
      { key: "daily", label: "Rencanakan aksi harian", href: "/today" },
      { key: "habit", label: "Bangun 1 kebiasaan baik", href: "/kebiasaan" },
    ],
  },
  {
    no: 5,
    key: "evaluasi",
    title: "Evaluasi Berkala",
    q: "Apakah Anda makin dekat?",
    why: "Evaluasi rutin menjaga semangat dan membetulkan arah sebelum terlambat. Setelah evaluasi, perbarui langkah 2 sampai 4.",
    items: [
      { key: "streak", label: "Centang aksi harian 3 hari minggu ini", href: "/today" },
      { key: "syukur", label: "Tulis syukur minggu ini", href: "/kebiasaan#syukur" },
      { key: "review", label: "Lihat progres bulanan", href: "/progress", optional: true },
      { key: "retest", label: "Cek ulang 8 Wheel tiap 3 bulan", href: "/assessment/8-wheel-entrepreneur", optional: true },
    ],
  },
];

/** Halaman mana termasuk langkah berapa (untuk penunjuk "Langkah X dari 5"). */
export function stepOfPath(path: string): Step | null {
  const p = path.split("#")[0];
  if (p.startsWith("/income")) return STEPS[1];
  for (const s of STEPS) if (s.items.some((i) => { const h = i.href.split("#")[0]; return p === h || p.startsWith(h + "/"); })) return s;
  return null;
}
