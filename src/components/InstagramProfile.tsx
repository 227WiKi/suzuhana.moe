"use client";

import { User } from "lucide-react";

interface InstagramProfileProps {
  userData: {
    screen_name: string; 
    name: string;        
    avatar: string;
    bio: string;
    stats: {
      followers: number;
      following: number;
    };
  };
}

export default function InstagramProfile({ userData }: InstagramProfileProps) {
  const formatNumber = (num: number) => {
    if (!num || num <= 0) return null;
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
  };

  const hasStats = (userData.stats?.followers > 0) || (userData.stats?.following > 0);

  return (
    <div className="mb-8 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
      <div className="shrink-0">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 shadow-inner">
          {userData.avatar ? (
            <img 
              src={userData.avatar} 
              alt={userData.screen_name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <User size={40} />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col text-center md:text-left">
        <div className="mb-4">
          <h1 className="text-xl font-medium text-zinc-500 dark:text-zinc-400 tracking-tight">
            {userData.screen_name}
          </h1>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">
            {userData.name}
          </h2>
        </div>

        {hasStats && (
          <div className="flex justify-center md:justify-start gap-8 mb-6">
            {userData.stats?.followers > 0 && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-400 font-bold mb-1">Followers</span>
                <span className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-200">
                  {formatNumber(userData.stats.followers)}
                </span>
              </div>
            )}
            {userData.stats?.following > 0 && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-400 font-bold mb-1">Following</span>
                <span className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-200">
                  {formatNumber(userData.stats.following)}
                </span>
              </div>
            )}
          </div>
        )}

        {userData.bio && (
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap max-w-2xl border-t border-gray-50 dark:border-zinc-900 pt-4">
            {userData.bio}
          </p>
        )}
      </div>
    </div>
  );
}