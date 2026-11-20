/** Ubah nomor WhatsApp atau URL dari pengaturan admin menjadi link yang bisa diklik. */
export function contactHref(contact: string, text: string): string | null {
  if (/^\+?\d[\d\s-]{7,}$/.test(contact)) return `https://wa.me/${contact.replace(/[^\d]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(text)}`;
  if (/^https?:\/\//.test(contact)) return contact;
  return null;
}
