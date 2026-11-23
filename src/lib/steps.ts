/**
 * Perjalanan 5 Langkah EClub (urutan ala life plan consultant):
 * 1 Mimpi (arah) -> 2 Kondisi Saat Ini (titik awal) -> 3 Potensi Diri (bekal) -> 4 Action Plan (jembatan) -> 5 Evaluasi Berkala (kompas).
 * Langkah 5 berulang: setiap minggu/bulan kembali ke langkah 2-4 dengan data baru.
 */
export type StepItem = { key: string; label: string; href: string; optional?: boolean; /** tidak tampil sebagai chip di atas halaman */ hidden?: boolean };
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
    why: "Mimpi dipecah menjadi rencana income, pekerjaan rutin, dan kebiasaan kecil. Semuanya jadi pengingat dan laporan harian Anda.",
    items: [
      { key: "plan", label: "Tentukan rencana income", href: "/rencana" },
      { key: "target", label: "Pecah mimpi jadi target harian", href: "/target", optional: true },
      { key: "rutinitas", label: "Pekerjaan & kebiasaan harian", href: "/rutinitas" },
      { key: "rekap", label: "Rekap & rekomendasi untuk Anda", href: "/rekap", hidden: true },
    ],
  },
  {
    no: 5,
    key: "evaluasi",
    title: "Evaluasi Berkala",
    q: "Apakah Anda makin dekat?",
    why: "Bukan isian, melainkan ritme: laporan harian (keuangan, rencana aksi, syukur), Rapor Mingguan, dan tinjauan bulanan. Cukup baca dan nyatakan siap.",
    items: [
      { key: "ritme", label: "Pahami ritme evaluasi & siap menjalankannya", href: "/evaluasi" },
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
const FLOW = STEPS.flatMap((s) => s.items.map((i) => ({ ...i, step: s.no })));

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
  const blocked = here.map(({ x }) => x).find((x) => !x.optional && !done[x.key]) ?? null;
  const open = (x: (typeof FLOW)[number]) => !x.optional && !done[x.key] && !at(x.href);
  // Dari rencana income, mampir ke Target Harian (opsional, tapi penting untuk menyambungkan mimpi dan rencana).
  const after = FLOW.slice(pos + 1).find((x) => open(x) || (x.key === "target" && FLOW[pos].key === "plan" && !at(x.href)));
  const before = FLOW.slice(0, pos).find(open);
  const t = before ?? after; // yang terlewat diselesaikan dulu, baru maju
  const label = (x: (typeof FLOW)[number]) => (STEPS[x.step - 1].items[0].key === x.key || !here.some(({ x: h }) => h.step === x.step) ? `Langkah ${x.step} · ${x.label}` : x.label);
  if (t) return { blocked, target: { label: label(t), href: t.href } };
  if (path === "/evaluasi") return { blocked, target: { label: "Mulai laporan harian", href: "/today" } };
  return { blocked, target: { label: "Kembali ke Home", href: "/dashboard" } };
}
