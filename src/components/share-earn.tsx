import { myShare, refUrl } from "@/lib/share";
import { ShareButton } from "./share-ref";

/** Tombol kecil "Bagikan" untuk member Plus: link sudah berisi kode affiliate. Member lain tidak melihat apa-apa. */
export async function ShareEarn({ path, text }: { path: string; text: string; what?: string }) {
  const s = await myShare();
  if (!s.eligible || !s.code) return null;
  return <ShareButton url={refUrl(path, s.code)} text={text} />;
}
