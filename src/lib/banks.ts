/** Ubah teks rekening (satu baris per rekening, mis. "BCA 1234567890 a.n. PT EClub") menjadi data terstruktur. */
export type BankAccount = { bank: string; number: string; holder: string; brand: BankBrand };
export type BankBrand = { label: string; bg: string; fg: string; accent?: string };

const BRANDS: [RegExp, BankBrand][] = [
  [/\bbca\b|central asia/i, { label: "BCA", bg: "#0060AF", fg: "#ffffff" }],
  [/mandiri/i, { label: "mandiri", bg: "#003D79", fg: "#ffffff", accent: "#F7B500" }],
  [/\bbri\b|rakyat/i, { label: "BRI", bg: "#00529C", fg: "#ffffff", accent: "#F37021" }],
  [/\bbni\b|negara/i, { label: "BNI", bg: "#F15A23", fg: "#ffffff", accent: "#006D77" }],
  [/\bbsi\b|syariah indonesia/i, { label: "BSI", bg: "#00A39D", fg: "#ffffff", accent: "#F8AD3C" }],
  [/\bbtn\b|tabungan negara/i, { label: "BTN", bg: "#0055A5", fg: "#ffffff", accent: "#FFD200" }],
  [/cimb/i, { label: "CIMB", bg: "#7A1315", fg: "#ffffff" }],
  [/permata/i, { label: "Permata", bg: "#0B9444", fg: "#ffffff" }],
  [/danamon/i, { label: "Danamon", bg: "#F7941D", fg: "#ffffff" }],
  [/\bjago\b/i, { label: "Jago", bg: "#FDB913", fg: "#1a1a1a" }],
  [/seabank/i, { label: "SeaBank", bg: "#FF5722", fg: "#ffffff" }],
  [/muamalat/i, { label: "Muamalat", bg: "#5C2D91", fg: "#ffffff" }],
  [/\bbpd\b|bank (dki|jatim|jateng|bjb|diy)/i, { label: "BPD", bg: "#334155", fg: "#ffffff" }],
];

export function bankBrand(name: string): BankBrand {
  for (const [re, b] of BRANDS) if (re.test(name)) return b;
  const initials = name.replace(/^bank\s+/i, "").trim().slice(0, 6) || "Bank";
  return { label: initials, bg: "#8B2220", fg: "#ffffff" };
}

export function parseBankAccounts(text: string): { accounts: BankAccount[]; rest: string[] } {
  const accounts: BankAccount[] = [];
  const rest: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/(\d[\d\s.-]{5,}\d)/);
    if (!m || m.index === undefined) {
      rest.push(line);
      continue;
    }
    const bank = line.slice(0, m.index).replace(/[:\-–|,]+\s*$/, "").trim() || "Bank";
    const number = m[1].replace(/[^\d]/g, "");
    const holder = line
      .slice(m.index + m[1].length)
      .replace(/^[\s,:\-–|]*(a\.?\s*n\.?|atas nama)\s*/i, "")
      .replace(/^[\s,:\-–|]+/, "")
      .trim();
    accounts.push({ bank, number, holder, brand: bankBrand(bank) });
  }
  return { accounts, rest };
}
