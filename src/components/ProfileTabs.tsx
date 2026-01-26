"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  
  const isMedia = pathname.endsWith("/media");
  const isTweets = pathname.endsWith("/tweets");

  return (
    <div className="flex border-t border-gray-100 dark:border-gray-800">

      <Link 
        href={`/${slug}/tweets`} 
        className="flex-1 relative cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition"
      >
        <div className={`flex items-center justify-center py-3 font-bold transition-colors ${
          isTweets 
            ? "text-black dark:text-white border-b-2 border-[#008CD2]" 
            : "text-gray-500 font-medium border-b-2 border-transparent"
        }`}>
          推文
        </div>
      </Link>
      
      <Link 
        href={`/${slug}/media`} 
        className="flex-1 relative cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition"
      >
        <div className={`flex items-center justify-center py-3 font-bold transition-colors ${
          isMedia 
            ? "text-black dark:text-white border-b-2 border-[#008CD2]" 
            : "text-gray-500 font-medium border-b-2 border-transparent"
        }`}>
           媒体
        </div>
      </Link>
    </div>
  );
}