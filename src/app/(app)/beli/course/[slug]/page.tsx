import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseCover } from "@/components/course-cover";
import { OrderButton } from "@/components/order-button";
import { rupiah } from "@/lib/format";
import { getCourseBySlug } from "@/lib/lms";

export const metadata = { title: "Beli course" };

export default async function BuyCourse({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCourseBySlug(slug);
  if (!data || data.course.access !== "purchase") notFound();
  const c = data.course;
  return (
    <div className="mx-auto max-w-lg">
      <div className="card overflow-hidden">
        <CourseCover url={c.cover_url} title={c.title} />
        <div className="p-6">
          <p className="eyebrow">Beli course</p>
          <h1 className="mt-2 text-xl font-bold text-heading">{c.title}</h1>
          <p className="mt-1 text-sm text-muted">{data.lessons.length} lesson · akses selamanya</p>
          <p className="mt-5 text-3xl font-bold text-heading">{rupiah(c.price)}</p>
          <div className="mt-5">
            <OrderButton product="course" slug={c.slug} label="Lanjut ke pembayaran" />
          </div>
          {c.include_in_plus && (
            <p className="mt-4 text-center text-sm text-muted">
              Atau dapatkan gratis dengan{" "}
              <Link href="/beli/plus" className="font-semibold text-brand hover:underline">
                EClub Plus
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
