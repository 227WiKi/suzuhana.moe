"use client";

import RichText from '@/components/RichText';
import ProfileTabs from '@/components/ProfileTabs';

interface TwitterHeaderProps {
  user: any;
  uniqueTweetsCount: number;
  username: string;
}

export default function TwitterHeader({ user, uniqueTweetsCount, username }: TwitterHeaderProps) {
  return (
    <>
      <div className="sticky top-2 z-10 mt-2 bg-white/90 dark:bg-[#16181c]/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-sm border border-white/20 mb-4">
        <h1 className="text-xl font-bold leading-none">{user.name}</h1>
        <p className="text-xs text-gray-500 mt-1">{uniqueTweetsCount} posts</p>
      </div>

      <div className="bg-white dark:bg-[#16181c] rounded-2xl overflow-hidden shadow-sm mb-4 border border-gray-100 dark:border-gray-800">
          <div className="relative">
            <div className="h-32 sm:h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                {user.banner && <img src={user.banner} alt="banner" className="w-full h-full object-cover" />}
            </div>
            <div className="absolute -bottom-12 left-4">
                <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-white dark:border-[#16181c] object-cover bg-white dark:bg-black" />
            </div>
          </div>
          
          <div className="mt-14 px-5 pb-5">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <div className="text-gray-500 text-sm">@{user.screen_name}</div>
            <div className="mt-3 whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200 text-[15px]">
              <RichText text={user.bio} />
            </div>
          </div>

          <ProfileTabs username={username} />
      </div>
    </>
  );
}