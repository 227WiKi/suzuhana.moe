import ArchiveFilterBar from "@/components/ArchiveFilterBar";
import CalendarWidget from "@/components/CalendarWidget";
import RightSection from "@/components/RightSection";
import { getTweetCalendarData } from "@/lib/api";
import { normalizeArchiveFilters } from "@/lib/archive-filters";

export default async function TweetsRightRail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string; to?: string; order?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const filters = normalizeArchiveFilters(query);
  const calendarData = await getTweetCalendarData(slug);

  return (
    <RightSection
      afterAbout={(
        <ArchiveFilterBar
          layout="rail"
          filters={filters}
          minDate={calendarData?.start}
          maxDate={calendarData?.end}
        />
      )}
    >
      {calendarData ? (
        <CalendarWidget
          key={`${calendarData.start}-${calendarData.end}`}
          minDate={calendarData.start}
          maxDate={calendarData.end}
          availableDates={calendarData.availableDates}
        />
      ) : null}
    </RightSection>
  );
}
