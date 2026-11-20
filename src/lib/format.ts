export function rupiah(n: number | null | undefined) {
  if (n == null) return "–";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export function compactRupiah(n: number) {
  if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (n >= 1_000) return `Rp${(n / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  return `Rp${n}`;
}

export function tanggal(iso: string | null) {
  if (!iso) return "–";
  return new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Sisa bulan menuju tanggal target (minimal 1). */
export function monthsUntil(iso: string | null) {
  if (!iso) return null;
  const now = new Date();
  const t = new Date(iso + "T00:00:00");
  const m = (t.getFullYear() - now.getFullYear()) * 12 + (t.getMonth() - now.getMonth());
  return Math.max(1, m);
}

export function dreamProgress(target: number | null, saved: number) {
  if (!target) return 0;
  return Math.min(100, Math.round((saved / target) * 100));
}

export function greeting() {
  const h = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Jakarta" }));
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}
