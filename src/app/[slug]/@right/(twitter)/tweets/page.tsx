import CalendarWidget from "@/components/CalendarWidget";
import RightSection from "@/components/RightSection";
import { getTweetCalendarData } from "@/lib/api";

export default async function TweetsRightRail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const calendarData = await getTweetCalendarData(slug);

  return (
    <RightSection>
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
