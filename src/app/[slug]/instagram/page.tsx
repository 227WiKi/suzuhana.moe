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
    <div className="w-full max-w-5xl mx-auto px-4 py-4">
      <InstagramProfile userData={userData} />

      <ArchiveFilterBar
        className="lg:hidden"
        filters={filters}
        minDate={minDate}
        maxDate={maxDate}
      />

      <div className="flex items-center gap-2 px-2 py-4 mb-4 border-b border-gray-100 dark:border-zinc-800">
         <Grid size={18} className="text-gray-900 dark:text-white" />
         <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Posts
         </h2>
      </div>

      <FilteredArchiveResults filterKey={getArchiveFilterKey(filters)}>
        {filteredPosts.length > 0 ? (
          <InstagramGrid posts={filteredPosts} userData={userData} />
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-14 text-center text-sm font-medium text-gray-400 dark:border-gray-800">
            没有符合该日期范围的 Instagram 贴文。
          </div>
        )}
      </FilteredArchiveResults>
    </div>
  );
}
