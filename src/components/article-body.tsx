/** Render teks artikel sederhana: paragraf, "## " judul, "- " butir, "1. " nomor. */
export function ArticleBody({ text }: { text: string }) {
  const blocks = text.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className="space-y-4 text-[16px] leading-[1.8] text-ink">
      {blocks.map((b, i) => {
        const lines = b.split("\n").filter(Boolean);
        if (lines.length === 1 && lines[0].startsWith("## ")) return <h2 key={i} className="pt-3 text-xl font-bold text-heading">{lines[0].slice(3)}</h2>;
        const head = lines[0]?.startsWith("## ") ? <h2 className="pt-3 pb-2 text-xl font-bold text-heading">{lines[0].slice(3)}</h2> : null;
        const rest = head ? lines.slice(1) : lines;
        if (rest.length && rest.every((l) => l.startsWith("- ")))
          return (
            <div key={i}>
              {head}
              <ul className="list-disc space-y-1.5 pl-5 marker:text-brand">{rest.map((l, k) => <li key={k}>{l.slice(2)}</li>)}</ul>
            </div>
          );
        if (rest.length && rest.every((l) => /^\d+\.\s/.test(l)))
          return (
            <div key={i}>
              {head}
              <ol className="list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-brand">{rest.map((l, k) => <li key={k}>{l.replace(/^\d+\.\s/, "")}</li>)}</ol>
            </div>
          );
        return (
          <div key={i}>
            {head}
            {rest.length > 0 && <p>{rest.join(" ")}</p>}
          </div>
        );
      })}
    </div>
  );
}
