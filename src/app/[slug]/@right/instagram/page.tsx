import ArchiveFilterBar from "@/components/ArchiveFilterBar";
import RightSection from "@/components/RightSection";
import { getInstagramPosts } from "@/lib/api";
import {
  getArchiveDateBounds,
  normalizeArchiveFilters,
} from "@/lib/archive-filters";

export default async function InstagramRightRail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string; to?: string; order?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const filters = normalizeArchiveFilters(query);
  const posts = await getInstagramPosts(slug);
  const { minDate, maxDate } = getArchiveDateBounds(posts, (post) => post.date);

  return (
    <RightSection
      afterAbout={(
        <ArchiveFilterBar
          layout="rail"
          filters={filters}
          minDate={minDate}
          maxDate={maxDate}
        />
      )}
    />
  );
}
