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
    <div className="mb-8 p-6 md:p-8 rounded-2xl border border-border bg-white dark:bg-card shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
      <div className="shrink-0">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-border bg-muted shadow-inner">
          {userData.avatar ? (
            <img
              src={userData.avatar}
              alt={userData.screen_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <User size={16} aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1 flex flex-col text-center md:text-left">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-foreground">{userData.name}</h1>
          <p className="mt-3 break-all text-base text-muted-foreground">@{userData.screen_name}</p>
        </div>

        {hasStats && (
          <div className="flex justify-center md:justify-start gap-8 mb-6">
            {userData.stats?.followers > 0 && (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-bold mb-1">Followers</span>
                <span className="text-base font-mono font-bold text-foreground">
                  {formatNumber(userData.stats.followers)}
                </span>
              </div>
            )}
            {userData.stats?.following > 0 && (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-bold mb-1">Following</span>
                <span className="text-base font-mono font-bold text-foreground">
                  {formatNumber(userData.stats.following)}
                </span>
              </div>
            )}
          </div>
        )}

        {userData.bio && (
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap max-w-2xl border-t border-border pt-4">
            {userData.bio}
          </p>
        )}
      </div>
    </div>
  );
}
