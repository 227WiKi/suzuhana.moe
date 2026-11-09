import ArchiveEmptyState from "@/components/ArchiveEmptyState";
import { getInstagramPosts, getUserData } from "@/lib/api";
import { notFound } from "next/navigation";
import InstagramGrid from "@/components/InstagramGrid";
import InstagramProfile from "@/components/InstagramProfile";
import ArchiveFilterBar from "@/components/ArchiveFilterBar";
import FilteredArchiveResults from "@/components/FilteredArchiveResults";
import { Grid } from "lucide-react";
import {
  applyArchiveFilters,
  getArchiveDateBounds,
  getArchiveFilterKey,
  normalizeArchiveFilters,
} from "@/lib/archive-filters";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string; to?: string; order?: string }>;
}

export default async function InstagramPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const filters = normalizeArchiveFilters(query);

  const [userData, posts] = await Promise.all([
    getUserData(slug, 'instagram'),
    getInstagramPosts(slug)
  ]);

  if (!userData) return notFound();

  const filteredPosts = applyArchiveFilters(
    posts,
    filters,
    (post) => post.date,
    (post) => `${post.date}:${post.id}`,
  );
  const { minDate, maxDate } = getArchiveDateBounds(posts, (post) => post.date);

  return (
    <div className="w-full py-4">
      <InstagramProfile userData={userData} />

      <ArchiveFilterBar
        className="2xl:hidden"
        filters={filters}
        minDate={minDate}
        maxDate={maxDate}
      />

      <div className="flex items-center gap-2 px-2 py-4 mb-4 border-b border-border">
         <Grid size={18} className="text-foreground" />
         <h2 className="text-sm font-bold text-muted-foreground">
            Posts
         </h2>
      </div>

      <FilteredArchiveResults filterKey={getArchiveFilterKey(filters)}>
        {filteredPosts.length > 0 ? (
          <InstagramGrid posts={filteredPosts} userData={userData} />
        ) : (
          <ArchiveEmptyState message="没有符合该日期范围的 Instagram 贴文。" href={`/${slug}/instagram`} label="查看全部贴文" />
        )}
      </FilteredArchiveResults>
    </div>
  );
}
