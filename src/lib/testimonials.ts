import { isDemoMode } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  photo_url: string | null;
  published: boolean;
  sort: number;
};

/** Testimoni yang ditampilkan (RLS: publik hanya melihat yang published). */
export async function listTestimonials(onlyPublished = true): Promise<Testimonial[]> {
  if (isDemoMode) return [];
  const supabase = await createClient();
  let q = supabase.from("testimonials").select("id,name,role,quote,photo_url,published,sort").order("sort").order("created_at");
  if (onlyPublished) q = q.eq("published", true);
  const { data } = await q;
  return (data as Testimonial[] | null) ?? [];
}
