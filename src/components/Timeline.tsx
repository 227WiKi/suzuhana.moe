import type { TimelineEvent } from "@/lib/api";
import { CalendarDays } from "lucide-react";

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  if (!events?.length) return null;
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return (
    <section className="mb-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-6 text-lg font-bold">Timeline</h2>
      <ol className="relative flex flex-col gap-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-px before:bg-border">
        {sortedEvents.map((event, index) => (
          <li key={index} className="relative pl-8 before:absolute before:left-1 before:top-1 before:size-2 before:rounded-full before:bg-accent before:ring-4 before:ring-card">
            <time className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays size={16} aria-hidden="true" />{event.date.replace(/-/g, '/')}
            </time>
            <h3 className="text-base font-bold">{event.title}</h3>
            {event.description ? <p className="mt-2 text-base leading-relaxed">{event.description}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
