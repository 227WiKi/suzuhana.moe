"use client";

import type { ArchiveUser, InstagramPost } from "@/lib/api";
import RichText from "./RichText";

// Same header, caption and date layout as the post dialog in InstagramGrid,
// laid out as a single card.
export default function InstagramPostCard({ post, user }: { post: InstagramPost; user: ArchiveUser }) {
  const image = post.images[0];
  return (
    <article className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="size-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
          <img src={user.avatar} alt="" className="size-full object-cover" />
        </div>
        <span className="truncate text-sm font-bold tracking-tight text-foreground">{user.screen_name}</span>
      </div>
      {image ? (
        <div className="aspect-[16/10] w-full bg-muted">
          <img src={image} alt="" className="size-full object-cover" />
        </div>
      ) : null}
      <div className="flex gap-3 p-4">
        <div className="mt-1 size-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
          <img src={user.avatar} alt="" className="size-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground dark:text-muted-foreground">
            <span className="mr-2 font-bold text-foreground">{user.screen_name}</span>
            <RichText text={post.text} platform="instagram" className="inline" />
          </p>
          <time dateTime={post.date} className="text-xs text-muted-foreground">{post.date}</time>
        </div>
      </div>
    </article>
  );
}
