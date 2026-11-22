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
      { key: "plan", label: "Tentukan rencana income", href: "/rencana" },
      { key: "target", label: "Pecah mimpi jadi target harian", href: "/target", optional: true },
      { key: "daily", label: "Rencanakan aksi harian", href: "/today" },
      { key: "habit", label: "Bangun 1 kebiasaan baik", href: "/kebiasaan" },
      { key: "rekap", label: "Rekap & rekomendasi untuk Anda", href: "/rekap", optional: true },
    ],
  },
  {
    no: 5,
    key: "evaluasi",
    title: "Evaluasi Berkala",
    q: "Apakah Anda makin dekat?",
    why: "Evaluasi rutin menjaga semangat dan membetulkan arah sebelum terlambat. Setelah evaluasi, perbarui langkah 2 sampai 4.",
    items: [
      { key: "review", label: "Evaluasi mingguan (2 menit)", href: "/evaluasi" },
      { key: "streak", label: "Centang aksi harian 3 hari minggu ini", href: "/today" },
      { key: "syukur", label: "Tulis syukur minggu ini", href: "/kebiasaan#syukur" },
      { key: "progress", label: "Lihat progres bulanan", href: "/progress", optional: true },
    ],
  },
];

export const base = (href: string) => href.split("#")[0];

/** Halaman mana termasuk langkah berapa (untuk penunjuk "Langkah X dari 5"). Langkah 1-4 didahulukan. */
export function stepOfPath(path: string): Step | null {
  for (const s of STEPS) if (s.items.some((i) => path === base(i.href) || path.startsWith(base(i.href) + "/"))) return s;
  return null;
}

/** Urutan isian langkah 1-4 (tombol Lanjut mengikuti urutan ini), lalu rekap, lalu evaluasi. */
const FLOW = [...STEPS.slice(0, 4).flatMap((s) => s.items.map((i) => ({ ...i, step: s.no }))), { ...STEPS[4].items[0], step: 5 }];

export type NextInfo = { blocked: StepItem | null; target: { label: string; href: string } };

/**
 * Tujuan tombol Lanjut dari halaman ini.
 * - Kalau isian wajib di halaman ini belum selesai: terkunci (blocked).
 * - Selain itu: isian wajib berikutnya yang belum selesai SETELAH halaman ini; kalau tidak ada, yang terlewat sebelumnya;
 *   kalau semua sudah: rekap, lalu evaluasi.
 */
export function nextFrom(path: string, done: Record<string, boolean>): NextInfo | null {
  const at = (href: string) => path === base(href) || path.startsWith(base(href) + "/");
  const here = FLOW.map((x, i) => ({ x, i })).filter(({ x }) => at(x.href));
  if (!here.length) return null;
  const pos = here[here.length - 1].i;
  const blocked = here.map(({ x }) => x).find((x) => !x.optional && x.step < 5 && !done[x.key]) ?? null;
  const open = (x: (typeof FLOW)[number]) => !x.optional && x.step < 5 && !done[x.key] && !at(x.href);
  // Dari rencana income, mampir ke Target Harian (opsional, tapi penting untuk menyambungkan mimpi dan rencana).
  const after = FLOW.slice(pos + 1).find((x) => open(x) || (x.key === "target" && FLOW[pos].key === "plan" && !at(x.href)));
  const before = FLOW.slice(0, pos).find(open);
  const t = before ?? after; // yang terlewat diselesaikan dulu, baru maju
  const label = (x: (typeof FLOW)[number]) => (STEPS[x.step - 1].items[0].key === x.key || !here.some(({ x: h }) => h.step === x.step) ? `Langkah ${x.step} · ${x.label}` : x.label);
  if (t) return { blocked, target: { label: label(t), href: t.href } };
  if (path === "/rekap") return { blocked, target: { label: "Langkah 5 · Evaluasi mingguan", href: "/evaluasi" } };
  if (path === "/evaluasi") return { blocked, target: { label: "Kembali ke Dashboard", href: "/dashboard" } };
  return { blocked, target: { label: "Rekap & rekomendasi untuk Anda", href: "/rekap" } };
}
