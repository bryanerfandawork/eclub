import Link from "next/link";
import { Crown, MessageCircle, Pin, Trash2 } from "lucide-react";
import { deletePost, toggleLike, togglePin } from "@/app/actions/community";
import { ago, CIRCLES, KINDS, type Post } from "@/lib/community";

export function PostCard({ p, uid, staff, full }: { p: Post; uid: string | null; staff: boolean; full?: boolean }) {
  const kind = KINDS.find((k) => k.key === p.kind);
  const circle = CIRCLES.find((c) => c.key === p.circle);
  const initial = (p.author_name ?? "M").slice(0, 1).toUpperCase();
  return (
    <article className={`card p-4 lg:p-5 ${p.pinned ? "border-gold" : ""}`}>
      <header className="flex items-center gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${p.author_plus ? "bg-brand text-gold" : "bg-gold-soft text-heading"}`}>{initial}</span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-heading">
            {p.author_name ?? "Member"}
            {p.author_plus && (
              <span className="flex items-center gap-0.5 rounded-full bg-gold-soft px-1.5 py-0.5 text-[10px] font-bold text-brand">
                <Crown className="h-2.5 w-2.5" /> Plus
              </span>
            )}
          </span>
          <span className="text-xs text-muted">
            {ago(p.created_at)}
            {p.circle !== "umum" && ` · ${circle?.emoji} ${circle?.label}`}
          </span>
        </span>
        {p.pinned && <Pin className="h-4 w-4 text-gold" />}
        {kind && kind.key !== "cerita" && (
          <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink">
            {kind.emoji} {kind.label}
          </span>
        )}
      </header>
      {full ? (
        <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-ink">{p.body}</p>
      ) : (
        <Link href={`/komunitas/${p.id}`} className="mt-3 line-clamp-6 block text-[15px] leading-relaxed whitespace-pre-line text-ink">
          {p.body}
        </Link>
      )}
      <footer className="mt-3 flex items-center gap-1 border-t border-line pt-2.5 text-sm">
        <form action={toggleLike}>
          <input type="hidden" name="post" value={p.id} />
          <input type="hidden" name="liked" value={p.liked ? "1" : "0"} />
          <button className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 whitespace-nowrap font-semibold transition active:scale-95 ${p.liked ? "bg-gold-soft text-brand" : "text-muted hover:bg-paper"}`}>
            🔥 {p.likes > 0 ? p.likes : ""} <span className={p.likes > 0 ? "hidden sm:inline" : ""}>Semangat</span>
          </button>
        </form>
        <Link href={`/komunitas/${p.id}`} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-muted hover:bg-paper">
          <MessageCircle className="h-4 w-4" /> {p.comments > 0 ? p.comments : ""} <span className={p.comments > 0 ? "hidden sm:inline" : ""}>Komentar</span>
        </Link>
        <span className="ml-auto flex items-center">
          {staff && (
            <form action={togglePin}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="pinned" value={p.pinned ? "1" : "0"} />
              <button className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-paper" title={p.pinned ? "Lepas sematan" : "Sematkan"}>
                <Pin className="h-4 w-4" />
              </button>
            </form>
          )}
          {(staff || p.user_id === uid) && (
            <form action={deletePost}>
              <input type="hidden" name="id" value={p.id} />
              <button className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-paper hover:text-danger" title="Hapus">
                <Trash2 className="h-4 w-4" />
              </button>
            </form>
          )}
        </span>
      </footer>
    </article>
  );
}
