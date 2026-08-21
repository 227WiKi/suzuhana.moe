import RightSection from "@/components/RightSection";
import Timeline from "@/components/Timeline";
import { getTimeline } from "@/lib/api";

export default async function ProfileRightRail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const events = await getTimeline(slug);

  return (
    <RightSection profile>
      <Timeline events={events} />
    </RightSection>
  );
}
