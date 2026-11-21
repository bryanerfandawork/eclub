"use client";

import Link from "next/link";
import { useActionState } from "react";
import { deleteArticle, saveArticle } from "@/app/actions/articles";
import { SubmitButton } from "@/components/submit-button";
import { FormMessage } from "@/components/ui";

export type ArticleRow = { id: string; slug: string; title: string; excerpt: string; category: string; sef_step: string; access: string; status: string; body: string };

const STEPS = [
  ["", "Umum"],
  ["spark", "Spark"],
  ["personal_mapping", "Personal Mapping"],
  ["acquisition", "Acquisition"],
  ["systemation", "Systemation"],
  ["transformation", "Transformation"],
  ["investation", "Investation"],
];

export function ArticleForm({ row }: { row: ArticleRow }) {
  const [state, action] = useActionState(saveArticle, undefined);
  return (
    <>
      <form action={action} className="space-y-4">
        <input type="hidden" name="id" value={row.id} />
        <div>
          <label className="label" htmlFor="title">Judul</label>
          <input id="title" name="title" defaultValue={row.title} required className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="slug">Slug (alamat)</label>
            <input id="slug" name="slug" defaultValue={row.slug} placeholder="otomatis dari judul" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="category">Kategori</label>
            <input id="category" name="category" defaultValue={row.category} placeholder="Keuangan, Penjualan, Spark…" className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="excerpt">Ringkasan (1–2 kalimat)</label>
          <textarea id="excerpt" name="excerpt" rows={2} defaultValue={row.excerpt} className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="sef_step">Tahap SEF</label>
            <select id="sef_step" name="sef_step" defaultValue={row.sef_step} className="input">
              {STEPS.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="access">Akses</label>
            <select id="access" name="access" defaultValue={row.access} className="input">
              <option value="free">Gratis</option>
              <option value="plus">Khusus Plus</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={row.status} className="input">
              <option value="draft">Draf</option>
              <option value="published">Terbit</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="body">Isi artikel</label>
          <p className="mb-1.5 text-xs text-muted">Pisahkan paragraf dengan baris kosong. Awali baris dengan &quot;## &quot; untuk subjudul, &quot;- &quot; untuk butir, &quot;1. &quot; untuk nomor.</p>
          <textarea id="body" name="body" rows={18} defaultValue={row.body} className="input font-mono text-[13px]" />
        </div>
        <FormMessage state={state} />
        <div className="flex flex-wrap gap-2">
          <SubmitButton>Simpan</SubmitButton>
          {row.id && row.status === "published" && (
            <Link href={`/artikel/${row.slug}`} target="_blank" className="btn-ghost">Lihat</Link>
          )}
        </div>
      </form>
      {row.id && (
        <form action={deleteArticle} className="mt-6 border-t border-line pt-4">
          <input type="hidden" name="id" value={row.id} />
          <button className="text-sm font-medium text-danger hover:underline">Hapus artikel</button>
        </form>
      )}
    </>
  );
}
