export type Wallet = "personal" | "business";
export type TxKind = "in" | "out" | "transfer";
export type Tx = { id: string; wallet: Wallet; kind: TxKind; to_wallet: Wallet | null; amount: number; category: string; note: string | null; tx_date: string; pocket_id?: string | null; to_pocket_id?: string | null };
export type Cat = { key: string; label: string; emoji: string };

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
      { key: "utilitas", label: "Listrik & air", emoji: "⚡" },
      { key: "marketing", label: "Marketing & iklan", emoji: "📣" },
      { key: "ongkir", label: "Ongkir & transport", emoji: "🚚" },
      { key: "peralatan", label: "Peralatan", emoji: "🔧" },
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
