import { Trash2 } from "lucide-react";
import { deleteTestimonial } from "@/app/actions/testimonials";
import { listTestimonials } from "@/lib/testimonials";
import { TestimonialForm } from "./testimonial-form";

export const metadata = { title: "Admin · Testimoni" };

export default async function AdminTestimonials() {
  const items = await listTestimonials(false);
  return (
    <div className="space-y-5">
      <section className="card p-5 lg:p-6">
        <h2 className="text-lg font-bold text-heading">Tambah testimoni</h2>
        <p className="mt-1 text-sm text-muted">
          Gunakan hanya kata-kata asli dari member yang sudah memberi izin. Bagian testimoni di halaman depan baru muncul setelah ada minimal satu yang ditampilkan.
        </p>
        <div className="mt-4">
          <TestimonialForm />
        </div>
      </section>
      {items.map((t) => (
        <section key={t.id} className="card p-5 lg:p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${t.published ? "bg-success/10 text-success" : "bg-paper text-muted"}`}>
              {t.published ? "Tampil" : "Disembunyikan"}
            </span>
            <form action={deleteTestimonial}>
              <input type="hidden" name="id" value={t.id} />
              <button className="flex items-center gap-1 text-xs font-semibold text-danger hover:underline">
                <Trash2 className="h-3.5 w-3.5" /> Hapus
              </button>
            </form>
          </div>
          <TestimonialForm t={t} />
        </section>
      ))}
    </div>
  );
}
