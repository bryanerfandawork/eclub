"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ArrowRight, Check, HelpCircle, Lightbulb, Plus } from "lucide-react";
import { saveIncome } from "@/app/actions/income";
import { ASSETS, CHIPS, HELP, SWOT, type Assets, type IncomeProfile, type Swot } from "@/lib/income";

function Picker({ options, value, onChange, tone = "brand" }: { options: string[]; value: string[]; onChange: (v: string[]) => void; tone?: string }) {
  const [custom, setCustom] = useState("");
  const list = [...options, ...value.filter((x) => !options.includes(x))];
  const on = tone === "success" ? "border-success bg-success text-white" : tone === "danger" ? "border-danger bg-danger text-white" : tone === "gold" ? "border-gold bg-gold text-heading" : tone === "muted" ? "border-heading bg-heading text-white" : "border-brand bg-brand text-white";
  const add = () => {
    const v = custom.trim().slice(0, 40);
    if (v && !value.includes(v)) onChange([...value, v].slice(0, 20));
    setCustom("");
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((l) => {
        const sel = value.includes(l);
        return (
          <button key={l} type="button" onClick={() => onChange(sel ? value.filter((x) => x !== l) : [...value, l].slice(0, 20))} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${sel ? on : "border-line bg-white text-ink hover:border-brand/40"}`}>
            {sel && <Check className="h-3 w-3" />} {l}
          </button>
        );
      })}
      <span className="inline-flex items-center rounded-full border border-dashed border-line bg-white pr-1 pl-3">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          maxLength={40}
          placeholder="Tambah sendiri…"
          className="w-28 bg-transparent py-1.5 text-xs outline-none"
        />
        <button type="button" onClick={add} aria-label="Tambah" className="grid h-6 w-6 place-items-center rounded-full text-brand hover:bg-paper">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </span>
    </div>
  );
}

function Card({ id, title, desc, help, children }: { id: string; title: string; desc: string; help?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-20 p-5 lg:p-6">
      <h2 className="font-bold text-heading">{title}</h2>
      <p className="mt-0.5 text-sm text-muted">{desc}</p>
      {help && <div className="mt-1.5">{help}</div>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function PotensiForm({ initial, isNew }: { initial: IncomeProfile; isNew: boolean }) {
  const [chips, setChips] = useState({ interests: initial.interests, hobbies: initial.hobbies, talents: initial.talents, passions: initial.passions });
  const [swot, setSwot] = useState<Swot>(initial.swot);
  const [assets, setAssets] = useState<Assets>(initial.assets);
  const [saving, start] = useTransition();
  const [status, setStatus] = useState<{ ok?: boolean; error?: string } | null>(null);
  const profile = useMemo(() => ({ ...initial, ...chips, swot, assets }), [initial, chips, swot, assets]);
  const json = JSON.stringify([chips, swot, assets]);
  const [savedJson, setSavedJson] = useState(isNew ? "" : json);
  const dirty = json !== savedJson;
  const save = () =>
    start(async () => {
      const r = await saveIncome(profile, "potensi");
      setStatus(r);
      if (r.ok) setSavedJson(json);
    });

  // Aha: strategi SWOT sederhana dari pilihan pertama di tiap kotak.
  const strat: string[] = [];
  if (swot.s[0] && swot.o[0]) strat.push(`Pakai kekuatan "${swot.s[0].toLowerCase()}" untuk memanfaatkan peluang "${swot.o[0].toLowerCase()}".`);
  if (swot.w[0] && swot.o[0]) strat.push(`Gunakan "${(swot.o[1] ?? swot.o[0]).toLowerCase()}" untuk memperbaiki "${swot.w[0].toLowerCase()}", misalnya lewat kelas atau mentor.`);
  if (swot.s[0] && swot.t[0]) strat.push(`Hadapi "${swot.t[0].toLowerCase()}" dengan mengandalkan "${(swot.s[1] ?? swot.s[0]).toLowerCase()}".`);
  if (swot.w[0] && swot.t[0]) strat.push(`Waspada: "${swot.w[0].toLowerCase()}" ditambah "${swot.t[0].toLowerCase()}" bisa jadi titik rawan. Siapkan dana darurat & kebiasaan kecil untuk menutupnya.`);
  const filledAssets = (Object.keys(ASSETS) as (keyof Assets)[]).filter((k) => assets[k].length);
  const weakest = (Object.keys(ASSETS) as (keyof Assets)[]).find((k) => !assets[k].length);

  return (
    <div className="mt-5 space-y-5 pb-24 lg:pb-0">
      <Card id="minat" title="Minat, hobi, bakat & passion" desc="Pilih yang paling terasa. Pilihan ini dipakai untuk rekomendasi ide income di Peta Income." help={<Link href={`/artikel/${HELP.self.slug}`} className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"><HelpCircle className="h-3.5 w-3.5" /> {HELP.self.label}</Link>}>
        <div className="space-y-5">
          {(Object.keys(CHIPS) as (keyof typeof CHIPS)[]).map((g) => (
            <div key={g}>
              <p className="mb-2 text-sm font-semibold text-heading">
                {CHIPS[g].title} <span className="font-normal text-muted">· {CHIPS[g].q}</span>
              </p>
              <Picker options={CHIPS[g].items.map(([l]) => l)} value={chips[g]} onChange={(v) => setChips((c) => ({ ...c, [g]: v }))} />
            </div>
          ))}
        </div>
      </Card>

      <Card id="swot" title="Personal SWOT" desc="Kekuatan & kelemahan ada di dalam diri. Peluang & ancaman ada di luar diri.">
        <div className="grid gap-3 md:grid-cols-2">
          {(Object.keys(SWOT) as (keyof Swot)[]).map((k) => (
            <div key={k} className="rounded-2xl border border-line bg-paper/50 p-4">
              <p className="text-sm font-bold text-heading">
                {k.toUpperCase()} · {SWOT[k].title}
              </p>
              <p className="mb-2.5 text-xs text-muted">{SWOT[k].q}</p>
              <Picker options={SWOT[k].items} value={swot[k]} onChange={(v) => setSwot((x) => ({ ...x, [k]: v }))} tone={SWOT[k].tone} />
            </div>
          ))}
        </div>
        {strat.length > 0 && (
          <div className="mt-4 rounded-2xl bg-gold-soft/60 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-heading">
              <Lightbulb className="h-4 w-4 text-gold" /> Strategi dari SWOT Anda
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink">
              {strat.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card id="aset" title="Peta Aset" desc="Setiap orang punya 4 jenis modal, bukan hanya uang. Centang yang sudah Anda punya.">
        <div className="grid gap-3 md:grid-cols-2">
          {(Object.keys(ASSETS) as (keyof Assets)[]).map((k) => (
            <div key={k} className="rounded-2xl border border-line p-4">
              <p className="text-sm font-bold text-heading">
                {ASSETS[k].emoji} {ASSETS[k].title}
              </p>
              <p className="mb-2.5 text-xs text-muted">{ASSETS[k].q}</p>
              <Picker options={ASSETS[k].items} value={assets[k]} onChange={(v) => setAssets((x) => ({ ...x, [k]: v }))} />
            </div>
          ))}
        </div>
        {filledAssets.length > 0 && (
          <p className="mt-4 rounded-2xl bg-paper p-4 text-sm text-ink">
            💡 Anda sudah punya {filledAssets.length} dari 4 jenis modal.{" "}
            {weakest ? `Modal ${ASSETS[weakest].title.replace("Modal ", "")} masih kosong: ini yang paling layak ditambah lewat rencana di langkah 4.` : "Lengkap! Gabungkan modal sosial dan modal diri untuk memulai massive income dengan modal uang kecil."}
          </p>
        )}
      </Card>

      <div className="card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="font-bold text-heading">Lanjut ke langkah 4: Action Plan</p>
          <p className="mt-0.5 text-sm text-muted">Bekal Anda dipakai untuk memilih rencana income dan target harian yang paling cocok.</p>
        </div>
        <Link href="/income#rencana" className="btn-primary shrink-0">
          Susun rencana <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="fixed inset-x-0 bottom-[64px] z-30 border-t border-line bg-white/95 px-4 py-2.5 backdrop-blur lg:sticky lg:bottom-4 lg:rounded-2xl lg:border lg:shadow-lift">
        <div className="flex items-center justify-end gap-3">
          {status?.error && <p className="flex-1 text-xs text-danger">{status.error}</p>}
          {status?.ok && !dirty && <p className="flex-1 text-xs text-success">Tersimpan. Langkah 3 Anda makin lengkap.</p>}
          <button type="button" onClick={save} disabled={saving || (!dirty && !status?.error)} className="btn-primary">
            {saving ? "Menyimpan…" : dirty ? "Simpan Potensi Diri" : <><Check className="h-4 w-4" /> Tersimpan</>}
          </button>
        </div>
      </div>
    </div>
  );
}
