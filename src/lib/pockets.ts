import type { Wallet } from "./finance";

export type PocketType = "cash" | "bank" | "ewallet" | "other";
export type Pocket = { id: string; wallet: Wallet; name: string; type: PocketType; provider: string | null; balance: number };

/**
 * Penanda bank & e-wallet: lencana warna + singkatan (bukan logo resmi, agar aman dari sisi merek dagang
 * tetapi tetap mudah dikenali).
 */
export const PROVIDERS: { key: string; label: string; short: string; type: PocketType; bg: string; fg: string }[] = [
  { key: "bca", label: "BCA", short: "BCA", type: "bank", bg: "#0060AF", fg: "#fff" },
  { key: "bri", label: "BRI", short: "BRI", type: "bank", bg: "#00529C", fg: "#fff" },
  { key: "mandiri", label: "Bank Mandiri", short: "MDR", type: "bank", bg: "#003D79", fg: "#FFB700" },
  { key: "bni", label: "BNI", short: "BNI", type: "bank", bg: "#F15A23", fg: "#fff" },
  { key: "bsi", label: "BSI", short: "BSI", type: "bank", bg: "#00A39D", fg: "#fff" },
  { key: "btn", label: "BTN", short: "BTN", type: "bank", bg: "#0E4C92", fg: "#FDD100" },
  { key: "cimb", label: "CIMB Niaga", short: "CIMB", type: "bank", bg: "#7A0019", fg: "#fff" },
  { key: "permata", label: "PermataBank", short: "PMT", type: "bank", bg: "#00843D", fg: "#fff" },
  { key: "danamon", label: "Danamon", short: "DNM", type: "bank", bg: "#F7941D", fg: "#fff" },
  { key: "bpd", label: "Bank daerah (BPD)", short: "BPD", type: "bank", bg: "#5B6770", fg: "#fff" },
  { key: "jago", label: "Bank Jago", short: "JAGO", type: "bank", bg: "#FDB913", fg: "#1a1a1a" },
  { key: "seabank", label: "SeaBank", short: "SEA", type: "bank", bg: "#FF6A13", fg: "#fff" },
  { key: "blu", label: "blu by BCA", short: "blu", type: "bank", bg: "#00B2E3", fg: "#fff" },
  { key: "gopay", label: "GoPay", short: "GP", type: "ewallet", bg: "#00AA13", fg: "#fff" },
  { key: "ovo", label: "OVO", short: "OVO", type: "ewallet", bg: "#4C3494", fg: "#fff" },
  { key: "dana", label: "DANA", short: "DANA", type: "ewallet", bg: "#118EEA", fg: "#fff" },
  { key: "shopeepay", label: "ShopeePay", short: "SP", type: "ewallet", bg: "#EE4D2D", fg: "#fff" },
  { key: "linkaja", label: "LinkAja", short: "LA", type: "ewallet", bg: "#E82529", fg: "#fff" },
];

export const TYPE_INFO: Record<PocketType, { label: string; emoji: string }> = {
  cash: { label: "Uang tunai", emoji: "👛" },
  bank: { label: "Rekening bank", emoji: "🏦" },
  ewallet: { label: "E-wallet", emoji: "📱" },
  other: { label: "Lainnya", emoji: "🗃️" },
};

export const providerOf = (key: string | null | undefined) => PROVIDERS.find((p) => p.key === key);
