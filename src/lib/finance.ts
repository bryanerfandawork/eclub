export type Wallet = "personal" | "business";
export type TxKind = "in" | "out" | "transfer";
export type Tx = { book_id?: string | null; user_id?: string; source?: string; id: string; wallet: Wallet; kind: TxKind; to_wallet: Wallet | null; amount: number; category: string; note: string | null; tx_date: string; pocket_id?: string | null; to_pocket_id?: string | null };
export type Cat = { key: string; label: string; emoji: string };

export type BookKind = "business" | "family";
export type BookRole = "owner" | "manager" | "recorder";
/** Buku keuangan bersama (SQL 029). Pribadi bukan buku: selalu rahasia. */
export type Book = { id: string; kind: BookKind; name: string; owner_id: string; owner_name: string | null; role: BookRole; status: "invited" | "active"; pocket_ids: string[] | null; owner_plus: boolean; workspace_id: string | null; members: number; mine: boolean };
export const BOOK_EMOJI: Record<BookKind, string> = { business: "🏪", family: "👨‍👩‍👧" };
export const ROLE_LABEL: Record<BookRole, string> = { owner: "Pemilik", manager: "Pengelola", recorder: "Pencatat" };
export const bookWallet = (k: BookKind): Wallet => (k === "business" ? "business" : "personal");

export const WALLET_LABEL: Record<Wallet, string> = { personal: "Pribadi", business: "Usaha" };

export const CATEGORIES: Record<Wallet, { out: Cat[]; in: Cat[] }> = {
  personal: {
    out: [
      { key: "makan", label: "Makan & minum", emoji: "🍜" },
      { key: "belanja", label: "Belanja harian", emoji: "🛒" },
      { key: "tagihan", label: "Rumah & tagihan", emoji: "🏠" },
      { key: "transport", label: "Transportasi", emoji: "🚗" },
      { key: "pulsa", label: "Pulsa & internet", emoji: "📱" },
      { key: "kesehatan", label: "Kesehatan", emoji: "💊" },
      { key: "pendidikan", label: "Pendidikan", emoji: "🎓" },
      { key: "keluarga", label: "Keluarga", emoji: "👨‍👩‍👧" },
      { key: "hiburan", label: "Hiburan", emoji: "🎉" },
      { key: "pakaian", label: "Pakaian & aksesoris", emoji: "👕" },
      { key: "perawatan", label: "Perawatan diri", emoji: "💇" },
      { key: "rumah_tangga", label: "Perlengkapan rumah", emoji: "🧹" },
      { key: "anak", label: "Kebutuhan anak", emoji: "🧸" },
      { key: "langganan", label: "Langganan & aplikasi", emoji: "📺" },
      { key: "kendaraan", label: "Servis & pajak kendaraan", emoji: "🛵" },
      { key: "asuransi", label: "Asuransi", emoji: "🛡️" },
      { key: "hadiah", label: "Hadiah & kondangan", emoji: "🎁" },
      { key: "sedekah", label: "Sedekah & zakat", emoji: "🤲" },
      { key: "cicilan", label: "Cicilan & utang", emoji: "💳" },
      { key: "tabungan", label: "Tabungan & mimpi", emoji: "🐷" },
      { key: "lain", label: "Lainnya", emoji: "📦" },
    ],
    in: [
      { key: "gaji", label: "Gaji", emoji: "💼" },
      { key: "bonus", label: "Bonus & hadiah", emoji: "🎁" },
      { key: "sampingan", label: "Penghasilan sampingan", emoji: "🧑‍💻" },
      { key: "investasi", label: "Hasil investasi", emoji: "📈" },
      { key: "saldo_awal", label: "Saldo awal", emoji: "💰" },
      { key: "lain", label: "Lainnya", emoji: "➕" },
    ],
  },
  business: {
    out: [
      { key: "bahan", label: "Bahan baku & stok", emoji: "🧺" },
      { key: "gaji_karyawan", label: "Gaji karyawan", emoji: "👷" },
      { key: "sewa", label: "Sewa tempat", emoji: "🏪" },
      { key: "utilitas", label: "Listrik, air & internet", emoji: "⚡" },
      { key: "kemasan", label: "Kemasan", emoji: "🥡" },
      { key: "marketing", label: "Marketing & iklan", emoji: "📣" },
      { key: "ongkir", label: "Ongkir & transport", emoji: "🚚" },
      { key: "peralatan", label: "Peralatan", emoji: "🔧" },
      { key: "perbaikan", label: "Perawatan & perbaikan", emoji: "🛠️" },
      { key: "atk", label: "ATK & perlengkapan kantor", emoji: "✏️" },
      { key: "konsumsi", label: "Konsumsi & jamuan", emoji: "☕" },
      { key: "software", label: "Aplikasi & langganan", emoji: "💻" },
      { key: "komisi", label: "Komisi & fee", emoji: "🎯" },
      { key: "biaya_bank", label: "Biaya bank & admin", emoji: "🏧" },
      { key: "operasional", label: "Operasional lain", emoji: "🗂️" },
      { key: "pajak", label: "Pajak & izin", emoji: "🧾" },
      { key: "cicilan", label: "Cicilan usaha", emoji: "💳" },
      { key: "lain", label: "Lainnya", emoji: "📦" },
    ],
    in: [
      { key: "penjualan", label: "Penjualan", emoji: "💵" },
      { key: "jasa", label: "Pendapatan jasa", emoji: "🤝" },
      { key: "modal", label: "Modal masuk / pinjaman", emoji: "🏦" },
      { key: "saldo_awal", label: "Saldo awal", emoji: "💰" },
      { key: "lain", label: "Lainnya", emoji: "➕" },
    ],
  },
};

export const TRANSFERS = [
  { key: "gaji_diri", label: "Gaji diri sendiri", emoji: "🧑‍💼", from: "business" as Wallet, to: "personal" as Wallet, hint: "Ambil uang dari usaha untuk kebutuhan pribadi, tercatat rapi." },
  { key: "tambah_modal", label: "Tambah modal usaha", emoji: "🌱", from: "personal" as Wallet, to: "business" as Wallet, hint: "Masukkan uang pribadi ke usaha sebagai modal." },
];
/** Pindah antar kantong (misal tarik tunai dari ATM, isi saldo e-wallet). Khusus Plus. */
export const MOVE = { key: "pindah", label: "Pindah antar kantong", emoji: "🔁", hint: "Tarik tunai, setor ke bank, isi saldo e-wallet." };

export function catInfo(t: Pick<Tx, "wallet" | "kind" | "category">): Cat {
  if (t.kind === "transfer") {
    const tr = TRANSFERS.find((x) => x.key === t.category);
    return { key: t.category, label: tr?.label ?? MOVE.label, emoji: tr?.emoji ?? MOVE.emoji };
  }
  return CATEGORIES[t.wallet][t.kind].find((c) => c.key === t.category) ?? { key: t.category, label: "Lainnya", emoji: "📦" };
}

/** Pengaruh transaksi terhadap saldo dompet tertentu. */
export function effect(t: Tx, w: Wallet): number {
  if (t.kind === "in") return t.wallet === w ? t.amount : 0;
  if (t.kind === "out") return t.wallet === w ? -t.amount : 0;
  if (t.wallet === t.to_wallet) return 0; // pindah antar kantong dalam dompet yang sama
  return t.wallet === w ? -t.amount : t.to_wallet === w ? t.amount : 0;
}

/** Pengaruh transaksi terhadap sekumpulan kantong (satu buku / pribadi). Pindah di dalam kumpulan = 0. */
export function setEffect(t: Tx, ids: Set<string>): number {
  const from = !!t.pocket_id && ids.has(t.pocket_id);
  if (t.kind === "in") return from ? t.amount : 0;
  if (t.kind === "out") return from ? -t.amount : 0;
  const to = !!t.to_pocket_id && ids.has(t.to_pocket_id);
  return from === to ? 0 : from ? -t.amount : t.amount;
}

/** Ringkasan bulan untuk sekumpulan kantong. */
export function setSummary(txs: Tx[], ids: Set<string>) {
  let income = 0, expense = 0, transferIn = 0, transferOut = 0;
  const byCat = new Map<string, number>();
  for (const t of txs) {
    const inSet = !!t.pocket_id && ids.has(t.pocket_id);
    if (t.kind === "in" && inSet && t.category !== "saldo_awal") income += t.amount;
    else if (t.kind === "out" && inSet) {
      expense += t.amount;
      byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount);
    } else if (t.kind === "transfer") {
      const v = setEffect(t, ids);
      if (v < 0) transferOut -= v;
      if (v > 0) transferIn += v;
    }
  }
  const top = [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  return { income, expense, transferIn, transferOut, top };
}
