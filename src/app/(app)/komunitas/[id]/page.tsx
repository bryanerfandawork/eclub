import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Crown, Trash2 } from "lucide-react";
import { deleteComment } from "@/app/actions/community";
import { ago, getPost, me } from "@/lib/community";
import { getAccount, isAdmin } from "@/lib/plans";
import { CommentForm } from "../client";
import { PostCard } from "../post-card";

export const metadata = { title: "Komunitas" };

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, uid, acc] = await Promise.all([getPost(id), me(), getAccount()]);
  if (!data) notFound();
  const staff = isAdmin(acc.role);
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/komunitas" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-heading">
        <ArrowLeft className="h-4 w-4" /> Komunitas
      </Link>
      <PostCard p={data.post} uid={uid} staff={staff} full />
      <section className="card mt-4 p-4 lg:p-5">
        <h2 className="text-sm font-bold text-heading">{data.comments.length} komentar</h2>
        <ul className="mt-3 space-y-3">
          {data.comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold-soft text-xs font-bold text-heading">{(c.author_name ?? "M").slice(0, 1)}</span>
              <div className="min-w-0 flex-1 rounded-2xl bg-paper px-3.5 py-2.5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-heading">
                  {c.author_name ?? "Member"} {c.author_plus && <Crown className="h-3 w-3 text-gold" />}
                  <span className="font-normal text-muted">· {ago(c.created_at)}</span>
                </p>
                <p className="mt-0.5 text-sm whitespace-pre-line text-ink">{c.body}</p>
              </div>
              {(staff || c.user_id === uid) && (
                <form action={deleteComment}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="post" value={id} />
                  <button className="grid h-8 w-8 place-items-center rounded-full text-muted hover:text-danger" title="Hapus">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <CommentForm post={id} />
        </div>
      </section>
    </div>
  );
}
