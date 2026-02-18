"use client";

import { usePathname } from "next/navigation";
import Timeline from "./Timeline";
import CalendarWidget from "./CalendarWidget";

interface RightSectionProps {
  events: any[];
  slug: string;
  dateRange: { start: string, end: string } | null;
}

export default function RightSection({ events, slug, dateRange }: RightSectionProps) {
  const pathname = usePathname();
  
  const isProfilePage = pathname === `/${slug}` || pathname === `/${slug}/`;
  const isInstagramPage = pathname.includes(`/${slug}/instagram`);

  return (
    <div 
      className={`
        hidden lg:flex flex-col w-[350px] shrink-0 gap-4 h-fit
        ${isProfilePage 
          ? 'mt-4' 
          : 'sticky top-4' 
        }
      `}
    >
      
      {isProfilePage ? (
        <Timeline events={events} />
      ) : isInstagramPage ? (
        null
      ) : (
        <CalendarWidget 
          minDate={dateRange?.start} 
          maxDate={dateRange?.end} 
        />
      )}

      <div className="bg-gray-50 dark:bg-[#16181c] border border-gray-200 dark:border-none rounded-xl p-4 transition-colors">
        <h2 className="text-xl font-bold mb-4 text-black dark:text-white">About</h2>
        <div className="text-gray-600 dark:text-gray-500 text-sm leading-relaxed">
          22/7 成员社交媒体的数字留档
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400 px-4 leading-relaxed">
        <span>
          <a
            href="https://suzuhana.moe"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium"
          >
            Project Suzuhana Moe
          </a>
          , part of{' '}
          <span className="inline-flex items-center gap-1 align-bottom">
            <img
              src="https://nananiji.zzzhxxx.top/assets/home/logo.svg"
              alt="22/7 Wiki"
              className="w-4 h-4"
            />
            <span>Project.</span>
          </span>
          <br />
          © 2026 22/7 WiKi All rights reserved.
        </span>
      </div>
    </div>
  );
}