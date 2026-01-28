import { TimelineEvent } from "@/lib/api";
import { Star, Disc, Flag, Circle, AtSign } from "lucide-react";

const getIcon = (type: string | undefined) => {
  switch (type) {
    case 'milestone': 
      return <Star size={12} className="text-yellow-500" fill="currentColor" />;
    case 'graduation': 
      return <Flag size={12} className="text-red-500" fill="currentColor" />;
    case 'release': 
      return <Disc size={12} className="text-blue-500" />;
    case 'sns': 
      return <AtSign size={12} className="text-pink-400" />; 
    default: 
      return <Circle size={10} className="text-gray-400" />;
  }
};

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) return null;

  const sortedEvents = [...events].sort((b, a) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white dark:bg-[#16181c] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm mb-4">
      <h3 className="font-black text-lg mb-4 text-gray-900 dark:text-white">
        Timeline
      </h3>

      <div className="relative pl-2">
        <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gray-100 dark:bg-gray-800" />

        <div className="flex flex-col gap-6">
          {sortedEvents.map((event, index) => (
            <div 
              key={index} 
              className="relative pl-8 group opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-[#16181c] border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center z-10 group-hover:border-[#008CD2] transition-colors">
                {getIcon(event.type)}
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-gray-400 mb-0.5">
                  {event.date.replace(/-/g, '/')}
                </span>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  {event.title}
                </h4>
                {event.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}