import { getMediaPage, getTweetCalendarData, getUserData } from '@/lib/api';
import { notFound } from 'next/navigation';
import MediaGrid from '@/components/MediaGrid';
import ArchiveFilterBar from '@/components/ArchiveFilterBar';
import FilteredArchiveResults from '@/components/FilteredArchiveResults';
import { getArchiveFilterKey, normalizeArchiveFilters } from '@/lib/archive-filters';

interface PageProps {
  params: Promise<{ slug: string }>; 
  searchParams: Promise<{ from?: string; to?: string; order?: string }>;
}

export default async function MediaPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const filters = normalizeArchiveFilters(query);

  const [user, page, calendar] = await Promise.all([
    getUserData(slug, 'twitter'),
    getMediaPage(slug, 0, 15, filters),
    getTweetCalendarData(slug),
  ]);
  if (!user) return notFound();
  
  return (
    <>
      <ArchiveFilterBar
        className="lg:hidden"
        filters={filters}
        minDate={calendar?.start}
        maxDate={calendar?.end}
      />
      <FilteredArchiveResults filterKey={getArchiveFilterKey(filters)}>
        <MediaGrid
          initialItems={page.items}
          total={page.total}
          nextOffset={page.nextOffset}
          slug={slug}
          user={user}
          filters={filters}
        />
      </FilteredArchiveResults>
    </>
  );
}
