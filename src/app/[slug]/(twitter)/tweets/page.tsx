import { getTweetCalendarData, getTweetPage, getUserData } from '@/lib/api';
import { notFound } from 'next/navigation';
import TweetList from '@/components/TweetList';
import ArchiveFilterBar from '@/components/ArchiveFilterBar';
import FilteredArchiveResults from '@/components/FilteredArchiveResults';
import { getArchiveFilterKey, normalizeArchiveFilters } from '@/lib/archive-filters';

interface PageProps {
  params: Promise<{ slug: string }>; 
  searchParams: Promise<{ date?: string; from?: string; to?: string; order?: string }>;
}

export default async function TweetsPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const date = query.date ?? "";
  const filters = normalizeArchiveFilters(query);

  const [user, page, calendar] = await Promise.all([
    getUserData(slug, 'twitter'),
    getTweetPage(slug, 0, 20, date, filters),
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
        <TweetList
          key={`${date || "latest"}:${getArchiveFilterKey(filters)}`}
          initialTweets={page.items}
          initialOffset={page.startOffset ?? 0}
          initialPreviousOffset={page.previousOffset ?? null}
          nextOffset={page.nextOffset}
          targetTweetId={page.targetId}
          slug={slug}
          user={user}
          filters={filters}
        />
      </FilteredArchiveResults>
    </>
  );
}
