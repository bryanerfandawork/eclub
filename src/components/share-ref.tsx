"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

/** Salin / bagikan link (sudah berisi kode affiliate) dalam satu ketukan. */
export function ShareRef({ url, text, compact = false }: { url: string; text: string; compact?: boolean }) {
  const [ok, setOk] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setOk(true);
    setTimeout(() => setOk(false), 1800);
  };
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: `${text}\n${url}` });
        return;
      } catch {
        return;
      }
    }
    copy();
  };
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "" : "mt-3"}`}>
      <button type="button" onClick={copy} className="btn border border-line bg-white px-3 py-2 text-heading hover:bg-paper">
        {ok ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />} {ok ? "Link tersalin" : "Salin link"}
      </button>
      <a href={wa} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] px-3 py-2 text-white hover:brightness-95">
        WhatsApp
      </a>
      <button type="button" onClick={share} className="btn border border-line bg-white px-3 py-2 text-heading hover:bg-paper sm:hidden" aria-label="Bagikan">
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}
