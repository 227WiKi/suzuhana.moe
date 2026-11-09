"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { appendArchiveFilters, normalizeArchiveFilters } from "@/lib/archive-filters";

export default function ProfileTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isMedia = pathname.endsWith("/media");
  const isTweets = pathname.endsWith("/tweets");
  const filters = normalizeArchiveFilters({
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    order: searchParams.get("order"),
  });
  const filterParams = appendArchiveFilters(new URLSearchParams(), filters).toString();
  const withFilters = (path: string) => `${path}${filterParams ? `?${filterParams}` : ""}`;

  return (
    <div className="flex border-t border-border">

      <Link
        href={withFilters(`/${slug}/tweets`)}
        className="flex-1 relative cursor-pointer hover:bg-muted dark:hover:bg-white/5 transition"
      >
        <div className={`flex items-center justify-center py-3 font-bold transition-colors ${
          isTweets
            ? "text-foreground border-b-2 border-accent"
            : "text-muted-foreground font-medium border-b-2 border-transparent"
        }`}>
          推文
        </div>
      </Link>

      <Link
        href={withFilters(`/${slug}/media`)}
        className="flex-1 relative cursor-pointer hover:bg-muted dark:hover:bg-white/5 transition"
      >
        <div className={`flex items-center justify-center py-3 font-bold transition-colors ${
          isMedia
            ? "text-foreground border-b-2 border-accent"
            : "text-muted-foreground font-medium border-b-2 border-transparent"
        }`}>
           媒体
        </div>
      </Link>
    </div>
  );
}
